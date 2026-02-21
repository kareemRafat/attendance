<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BranchIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected $branch1;

    protected $branch2;

    protected $employee1;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch1 = Branch::factory()->create(['name' => 'Branch 1']);
        $this->branch2 = Branch::factory()->create(['name' => 'Branch 2']);

        $this->employee1 = User::factory()->employee($this->branch1)->create();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_restricts_employee_to_their_own_branch_groups(): void
    {
        Group::factory()->create(['branch_id' => $this->branch1->id, 'name' => 'B1 Group']);
        Group::factory()->create(['branch_id' => $this->branch2->id, 'name' => 'B2 Group']);

        $response = $this->actingAs($this->employee1)->get(route('groups.index'));

        // If assertInertia fails due to Inertia v2 testing bug,
        // we'll use a more basic assertion to verify isolation
        $response->assertSuccessful();
        $groups = $response->viewData('page')['props']['groups'];
        $this->assertCount(1, $groups);
        $this->assertEquals('B1 Group', $groups[0]['name']);
    }

    public function test_allows_admin_to_see_all_branch_groups(): void
    {
        Group::factory()->create(['branch_id' => $this->branch1->id]);
        Group::factory()->create(['branch_id' => $this->branch2->id]);

        $response = $this->actingAs($this->admin)->get(route('groups.index'));

        $response->assertSuccessful();
        $groups = $response->viewData('page')['props']['groups'];
        $this->assertCount(2, $groups);
    }

    public function test_saves_bulk_attendance_and_creates_lecture_session(): void
    {
        $this->withoutExceptionHandling();

        $group = Group::factory()->create(['branch_id' => $this->branch1->id]);
        $student1 = Student::factory()->create(['branch_id' => $this->branch1->id]);
        $student2 = Student::factory()->create(['branch_id' => $this->branch1->id]);

        $student1->enrollments()->create(['group_id' => $group->id, 'enrolled_at' => now()->subDay()]);
        $student2->enrollments()->create(['group_id' => $group->id, 'enrolled_at' => now()->subDay()]);

        $date = now()->format('Y-m-d');

        $response = $this->actingAs($this->employee1)->post(route('attendance.store'), [
            'group_id' => $group->id,
            'date' => $date,
            'attendances' => [
                ['student_id' => $student1->id, 'status' => 'present', 'is_installment_due' => false],
                ['student_id' => $student2->id, 'status' => 'absent', 'is_installment_due' => true],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('lecture_sessions', [
            'group_id' => $group->id,
            'date' => $date,
            'lecture_number' => 1,
        ]);

        $this->assertDatabaseHas('attendances', [
            'student_id' => $student1->id,
            'status' => 'present',
            'is_installment_due' => false,
        ]);

        $this->assertDatabaseHas('attendances', [
            'student_id' => $student2->id,
            'status' => 'absent',
            'is_installment_due' => true,
        ]);
    }
}
