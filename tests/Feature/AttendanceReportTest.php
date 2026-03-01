<?php

use App\Models\Student;
use App\Models\User;
use App\Models\Branch;
use App\Models\Attendance;
use App\Models\LectureSession;
use App\Models\Group;
use App\Enums\AttendanceStatus;
use App\Enums\UserRole;

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

it('can print attendance report as admin', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('students.attendance.print', $this->student));

    $response->assertSuccessful();
    $response->assertViewIs('reports.attendance-pdf');
    $response->assertSee('window.print()');
});

it('cannot print attendance report of student in different branch as employee', function () {
    $otherBranch = Branch::factory()->create();
    $employee = User::factory()->create([
        'role' => UserRole::Employee,
        'branch_id' => $otherBranch->id,
    ]);

    $response = $this->actingAs($employee)
        ->get(route('students.attendance.print', $this->student));

    $response->assertForbidden();
});

it('can print attendance report of student in same branch as employee', function () {
    $employee = User::factory()->create([
        'role' => UserRole::Employee,
        'branch_id' => $this->branch->id,
    ]);

    $response = $this->actingAs($employee)
        ->get(route('students.attendance.print', $this->student));

    $response->assertSuccessful();
});
