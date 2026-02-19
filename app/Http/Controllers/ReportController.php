<?php

namespace App\Http\Controllers;

use App\Enums\AttendanceStatus;
use App\Models\Branch;
use App\Models\Group;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function dashboard(): Response
    {
        $this->authorize('viewAny', Branch::class);

        $stats = [
            'total_branches' => Branch::count(),
            'total_groups' => Group::where('is_active', true)->count(),
            'total_students' => Student::count(),
        ];

        $branches = Branch::withCount(['groups', 'users'])->get();

        return Inertia::render('Reports/Dashboard', [
            'stats' => $stats,
            'branches' => $branches,
        ]);
    }

    public function student(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load([
            'branch',
            'groups',
            'enrollments.group',
            'attendances.lectureSession.group',
            'transferLogs.fromGroup',
            'transferLogs.toGroup',
        ]);

        $totalLectures = $student->attendances->count();
        $presentCount = $student->attendances->where('status', AttendanceStatus::Present)->count();
        $excusedCount = $student->attendances->where('status', AttendanceStatus::Excused)->count();

        $compliance = $totalLectures > 0 ? round(($presentCount / $totalLectures) * 100, 2) : 100;

        return Inertia::render('Reports/Student', [
            'student' => $student,
            'stats' => [
                'compliance' => $compliance,
                'present' => $presentCount,
                'excused' => $excusedCount,
                'absent' => $totalLectures - ($presentCount + $excusedCount),
                'total' => $totalLectures,
            ],
        ]);
    }

    public function search(Request $request): Response
    {
        $query = $request->input('q');

        $students = Student::where('name', 'like', "%{$query}%")
            ->with(['branch', 'groups'])
            ->limit(20)
            ->get();

        return Inertia::render('Reports/Search', [
            'students' => $students,
            'query' => $query,
        ]);
    }
}
