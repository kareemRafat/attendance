<?php

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\Branch;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Group;
use App\Models\LectureSession;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin
        User::factory()->admin()->create([
            'name' => 'kareem',
            'email' => 'admin@admin.com',
            'password' => Hash::make('12345678'),
            'role' => UserRole::Admin,
        ]);

        // Create Branches
        $branches = Branch::factory(2)->create();

        foreach ($branches as $branch) {
            // Create Employee for each branch
            User::factory()->employee($branch)->create([
                'name' => "Employee for {$branch->name}",
                'email' => 'employee'.$branch->id.'@example.com',
            ]);

            // Create some active groups
            $activeGroups = Group::factory(2)->create([
                'branch_id' => $branch->id,
                'is_active' => true,
            ]);

            // Create some closed groups
            $closedGroups = Group::factory(1)->create([
                'branch_id' => $branch->id,
                'is_active' => false,
            ]);

            $allGroups = $activeGroups->concat($closedGroups);

            foreach ($allGroups as $group) {
                // Create Students for each group
                $students = Student::factory(8)->create(['branch_id' => $branch->id]);
                foreach ($students as $student) {
                    $student->enrollments()->create([
                        'group_id' => $group->id,
                        'enrolled_at' => now()->subMonths(1),
                        'ended_at' => $group->is_active ? null : now()->subDays(5),
                    ]);
                }

                // Create some past sessions and attendance
                for ($i = 1; $i <= 5; $i++) {
                    $session = LectureSession::factory()->create([
                        'group_id' => $group->id,
                        'lecture_number' => $i,
                        'date' => now()->subDays(30 - ($i * 3)),
                    ]);

                    foreach ($students as $student) {
                        Attendance::factory()->create([
                            'lecture_session_id' => $session->id,
                            'student_id' => $student->id,
                            'status' => fake()->randomElement(AttendanceStatus::cases()),
                        ]);
                    }
                }
            }
        }
    }
}
