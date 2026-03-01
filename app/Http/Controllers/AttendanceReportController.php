<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Response;
use Illuminate\View\View;
use Spatie\Browsershot\Browsershot;

class AttendanceReportController extends Controller
{
    public function download(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load(['branch', 'attendances.lectureSession.group']);

        $attendances = $student->attendances()
            ->with(['lectureSession.group'])
            ->get()
            ->sortBy(fn ($attendance) => $attendance->lectureSession->date);

        $stats = [
            'present' => $attendances->where('status.value', 'present')->count(),
            'absent' => $attendances->where('status.value', 'absent')->count(),
            'excused' => $attendances->where('status.value', 'excused')->count(),
            'total' => $attendances->count(),
        ];

        $html = view('reports.attendance-pdf', [
            'student' => $student,
            'attendances' => $attendances,
            'stats' => $stats,
        ])->render();

        $pdf = Browsershot::html($html)
            ->setNodeBinary(env('NODE_PATH'))
            ->setChromePath(env('PUPPETEER_EXECUTABLE_PATH'))
            ->format('A4')
            ->margins(10, 10, 10, 10)
            ->emulateMedia('print')
            ->waitUntilNetworkIdle()
            ->pdf();

        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="attendance-report-'.$student->id.'.pdf"');
    }

    public function print(Student $student): View
    {
        $this->authorize('view', $student);

        $student->load(['branch', 'attendances.lectureSession.group']);

        $attendances = $student->attendances()
            ->with(['lectureSession.group'])
            ->get()
            ->sortBy(fn ($attendance) => $attendance->lectureSession->date);

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
