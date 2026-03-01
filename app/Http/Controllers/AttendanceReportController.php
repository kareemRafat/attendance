<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\View\View;

class AttendanceReportController extends Controller
{
    public function print(Student $student): View
    {
        $this->authorize('view', $student);

        $student->load(['branch', 'attendances.lectureSession.group']);

        $attendances = $student->attendances()
            ->with(['lectureSession.group'])
            ->get()
            ->sortBy(fn($attendance) => $attendance->lectureSession->date);

        $stats = [
            'present' => $attendances->where('status.value', 'present')->count(),
            'absent' => $attendances->where('status.value', 'absent')->count(),
            'excused' => $attendances->where('status.value', 'excused')->count(),
            'total' => $attendances->count(),
        ];

        return view('reports.attendance-pdf', [
            'student' => $student,
            'attendances' => $attendances,
            'stats' => $stats,
            'print' => true,
            'return_url' => route('students.show', $student),
        ]);
    }
}
