<?php

namespace App\Http\Controllers;

use App\Enums\DaysPattern;
use App\Models\Attendance;
use App\Models\Group;
use App\Models\LectureSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Branch;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $date = $request->input('date', now()->format('Y-m-d'));
        $branchId = $request->input('branch_id');
        $carbonDate = Carbon::parse($date);
        $dayOfWeek = $carbonDate->dayOfWeek;

        // Map day of week to patterns
        $activePatterns = [];
        if ($dayOfWeek === 6 || $dayOfWeek === 2) {
            $activePatterns[] = DaysPattern::SatTue;
        }
        if ($dayOfWeek === 0 || $dayOfWeek === 3) {
            $activePatterns[] = DaysPattern::SunWed;
        }
        if ($dayOfWeek === 1 || $dayOfWeek === 4) {
            $activePatterns[] = DaysPattern::MonThu;
        }

        $query = Group::where('is_active', true)
            ->whereIn('pattern', $activePatterns)
            ->with(['branch', 'students' => function ($query) use ($carbonDate) {
                // Only students enrolled on this date and not ended
                $enrolledBefore = $carbonDate->copy()->endOfDay();
                $endedAfter = $carbonDate->copy()->startOfDay();

                $query->wherePivot('enrolled_at', '<=', $enrolledBefore)
                    ->where(function ($q) use ($endedAfter) {
                        $q->whereNull('enrollments.ended_at')
                            ->orWhere('enrollments.ended_at', '>', $endedAfter);
                    });
            }]);

        if (! $user->isAdmin()) {
            $query->where('branch_id', $user->branch_id);
        } elseif ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $groups = $query->get();

        // Check if attendance already exists for these groups
        foreach ($groups as $group) {
            $session = LectureSession::where('group_id', $group->id)
                ->where('date', $date)
                ->with('attendances')
                ->first();

            $group->lecture_session = $session;
        }

        return Inertia::render('Attendance/Index', [
            'groups' => $groups,
            'selectedDate' => $date,
            'selectedBranchId' => $branchId ? (int) $branchId : null,
            'branches' => $user->isAdmin() ? Branch::all() : [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'group_id' => ['required', 'exists:groups,id'],
            'date' => ['required', 'date'],
            'attendances' => ['required', 'array'],
            'attendances.*.student_id' => ['required', 'exists:students,id'],
            'attendances.*.status' => ['required', 'string'],
            'attendances.*.is_installment_due' => ['required', 'boolean'],
        ], [], [
            'group_id' => 'المجموعة',
            'date' => 'التاريخ',
            'attendances' => 'سجلات الحضور',
            'attendances.*.status' => 'الحالة',
            'attendances.*.is_installment_due' => 'حالة القسط',
        ]);

        DB::transaction(function () use ($request) {
            $groupId = $request->group_id;
            $date = $request->date;

            // 1. Get or Create Lecture Session
            $session = LectureSession::firstOrCreate(
                ['group_id' => $groupId, 'date' => $date],
                [
                    'lecture_number' => LectureSession::where('group_id', $groupId)->count() + 1,
                ]
            );

            // 2. Prepare data for bulk insert
            $attendanceData = collect($request->attendances)->map(function ($item) use ($session) {
                return [
                    'lecture_session_id' => $session->id,
                    'student_id' => $item['student_id'],
                    'status' => $item['status'],
                    'is_installment_due' => $item['is_installment_due'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray();

            // 3. Upsert attendances
            Attendance::upsert(
                $attendanceData,
                ['lecture_session_id', 'student_id'],
                ['status', 'is_installment_due', 'updated_at']
            );
        });

        return redirect()->back()->with('success', 'تم حفظ سجل الحضور بنجاح.');
    }
}
