<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentRequest;
use App\Models\Group;
use App\Models\Student;
use App\Models\TransferLog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        return Inertia::render('Students/Index', [
            'students' => Student::with(['branch', 'groups' => function ($query) {
                $query->whereNull('enrollments.ended_at');
            }])->paginate(10),
            'availableGroups' => Group::where('is_active', true)->get(),
        ]);
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load(['branch', 'enrollments' => function ($query) {
            $query->whereNull('ended_at')->with('group');
        }]);

        $attendanceStats = $student->attendances()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status->value => $item->total];
            });

        $attendanceHistory = $student->attendances()
            ->with(['lectureSession.group'])
            ->latest()
            ->paginate(10);

        $transferHistory = $student->transferLogs()
            ->with(['fromGroup', 'toGroup'])
            ->latest()
            ->get();

        return Inertia::render('Students/Show', [
            'student' => $student,
            'stats' => [
                'present' => $attendanceStats->get('present', 0),
                'absent' => $attendanceStats->get('absent', 0),
                'excused' => $attendanceStats->get('excused', 0),
                'total' => $attendanceStats->sum(),
            ],
            'attendanceHistory' => $attendanceHistory,
            'transferHistory' => $transferHistory,
        ]);
    }

    public function store(StudentRequest $request): RedirectResponse
    {
        Student::create($request->validated());

        return redirect()->route('students.index')->with('success', 'Student created successfully.');
    }

    public function update(StudentRequest $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);
        $student->update($request->validated());

        return redirect()->route('students.index')->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $this->authorize('delete', $student);
        $student->delete();

        return redirect()->route('students.index')->with('success', 'Student deleted successfully.');
    }

    public function enroll(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'group_id' => ['required', 'exists:groups,id'],
        ]);

        $student->enrollments()->create([
            'group_id' => $request->group_id,
            'enrolled_at' => now(),
        ]);

        return redirect()->route('students.index')->with('success', 'Student enrolled successfully.');
    }

    public function transfer(Request $request, Student $student): RedirectResponse
    {
        $request->validate([
            'from_group_id' => ['required', 'exists:groups,id'],
            'to_group_id' => ['required', 'exists:groups,id', 'different:from_group_id'],
            'effective_date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        DB::transaction(function () use ($request, $student) {
            // Log the transfer
            TransferLog::create([
                'student_id' => $student->id,
                'from_group_id' => $request->from_group_id,
                'to_group_id' => $request->to_group_id,
                'transferred_at' => now(),
                'effective_date' => $request->effective_date,
            ]);

            // End previous enrollment
            $student->enrollments()
                ->where('group_id', $request->from_group_id)
                ->whereNull('ended_at')
                ->update(['ended_at' => $request->effective_date]);

            // Start new enrollment
            $student->enrollments()->create([
                'group_id' => $request->to_group_id,
                'enrolled_at' => $request->effective_date,
            ]);
        });

        return redirect()->route('students.index')->with('success', 'Student transfer scheduled successfully.');
    }
}
