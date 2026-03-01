<?php

use App\Enums\AttendanceStatus;
use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\Branch;
use App\Models\Group;
use App\Models\LectureSession;
use App\Models\Student;
use App\Models\User;

beforeEach(function () {
    $this->branch = Branch::factory()->create();
    $this->admin = User::factory()->create([
        'role' => UserRole::Admin,
        'branch_id' => $this->branch->id,
    ]);
    $this->student = Student::factory()->create([
        'branch_id' => $this->branch->id,
    ]);
    $this->group = Group::factory()->create([
        'branch_id' => $this->branch->id,
    ]);
    $this->session = LectureSession::factory()->create([
        'group_id' => $this->group->id,
    ]);
    $this->attendance = Attendance::factory()->create([
        'student_id' => $this->student->id,
        'lecture_session_id' => $this->session->id,
        'status' => AttendanceStatus::Present,
    ]);
});

it('can download attendance report as admin', function () {
    // We might need to mock Browsershot to avoid running the headless browser in tests
    // For now, let's see if we can at least reach the controller and it tries to render

    $response = $this->actingAs($this->admin)
        ->get(route('students.attendance.report', $this->student));

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/pdf');
    $response->assertHeader('Content-Disposition', 'attachment; filename="attendance-report-'.$this->student->id.'.pdf"');
});

it('can print attendance report as admin', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('students.attendance.print', $this->student));

    $response->assertSuccessful();
    $response->assertViewIs('reports.attendance-pdf');
    $response->assertSee('window.print()');
});

it('cannot download attendance report of student in different branch as employee', function () {
    $otherBranch = Branch::factory()->create();
    $employee = User::factory()->create([
        'role' => UserRole::Employee,
        'branch_id' => $otherBranch->id,
    ]);

    $response = $this->actingAs($employee)
        ->get(route('students.attendance.report', $this->student));

    $response->assertForbidden();
});

it('can download attendance report of student in same branch as employee', function () {
    $employee = User::factory()->create([
        'role' => UserRole::Employee,
        'branch_id' => $this->branch->id,
    ]);

    $response = $this->actingAs($employee)
        ->get(route('students.attendance.report', $this->student));

    $response->assertSuccessful();
});
