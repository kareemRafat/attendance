<?php

use App\Models\Branch;
use App\Models\Group;
use App\Models\User;
use App\Enums\DaysPattern;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->branch1 = Branch::factory()->create(['name' => 'Branch 1']);
    $this->branch2 = Branch::factory()->create(['name' => 'Branch 2']);
    
    $this->admin = User::factory()->admin()->create();
    $this->employee = User::factory()->employee($this->branch1)->create();
    
    // Sat, Feb 21, 2026 is day 6 (Saturday)
    Carbon::setTestNow('2026-02-21');
});

afterEach(function () {
    Carbon::setTestNow();
});

test('employee only sees groups from their own branch for today', function () {
    // Group in employee's branch for Saturday (SatTue)
    Group::factory()->create([
        'branch_id' => $this->branch1->id,
        'name' => 'Branch 1 Group',
        'pattern' => DaysPattern::SatTue,
        'is_active' => true,
    ]);
    
    // Group in another branch for Saturday
    Group::factory()->create([
        'branch_id' => $this->branch2->id,
        'name' => 'Branch 2 Group',
        'pattern' => DaysPattern::SatTue,
        'is_active' => true,
    ]);
    
    // Group in employee's branch but NOT for Saturday
    Group::factory()->create([
        'branch_id' => $this->branch1->id,
        'name' => 'Other Pattern Group',
        'pattern' => DaysPattern::SunWed,
        'is_active' => true,
    ]);
    
    $response = $this->actingAs($this->employee)->get(route('attendance.index'));
    
    $response->assertSuccessful();
    $groups = $response->viewData('page')['props']['groups'];
    
    expect($groups)->toHaveCount(1);
    expect($groups[0]['name'])->toBe('Branch 1 Group');
    expect($response->viewData('page')['props']['branches'])->toHaveCount(0);
});

test('can save attendance with installment due status', function () {
    $group = Group::factory()->create([
        'branch_id' => $this->branch1->id,
        'pattern' => DaysPattern::SatTue,
    ]);
    $student = \App\Models\Student::factory()->create(['branch_id' => $this->branch1->id]);
    $student->enrollments()->create(['group_id' => $group->id, 'enrolled_at' => now()->subDay()]);

    $response = $this->actingAs($this->employee)->post(route('attendance.store'), [
        'group_id' => $group->id,
        'date' => now()->format('Y-m-d'),
        'attendances' => [
            [
                'student_id' => $student->id,
                'status' => 'present',
                'is_installment_due' => true,
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->id,
        'status' => 'present',
        'is_installment_due' => true,
    ]);
});

test('admin sees groups from all branches and can filter by branch', function () {
    Group::factory()->create([
        'branch_id' => $this->branch1->id,
        'name' => 'Branch 1 Group',
        'pattern' => DaysPattern::SatTue,
        'is_active' => true,
    ]);
    
    Group::factory()->create([
        'branch_id' => $this->branch2->id,
        'name' => 'Branch 2 Group',
        'pattern' => DaysPattern::SatTue,
        'is_active' => true,
    ]);
    
    // No filter
    $response = $this->actingAs($this->admin)->get(route('attendance.index'));
    $response->assertSuccessful();
    $groups = $response->viewData('page')['props']['groups'];
    expect($groups)->toHaveCount(2);
    expect($response->viewData('page')['props']['branches'])->toHaveCount(2);
    
    // Filter by Branch 1
    $response = $this->actingAs($this->admin)->get(route('attendance.index', ['branch_id' => $this->branch1->id]));
    $response->assertSuccessful();
    $groups = $response->viewData('page')['props']['groups'];
    expect($groups)->toHaveCount(1);
    expect($groups[0]['name'])->toBe('Branch 1 Group');
    expect($response->viewData('page')['props']['selectedBranchId'])->toBe($this->branch1->id);
});
