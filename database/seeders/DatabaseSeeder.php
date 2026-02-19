<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
            'password' => encrypt('12345678')
        ]);

        // Create Branches
        $branches = Branch::factory(2)->create();

        foreach ($branches as $branch) {
            // Create Employee for each branch
            User::factory()->employee($branch)->create([
                'name' => "Employee for {$branch->name}",
                'email' => 'employee'.$branch->id.'@example.com',
            ]);

            // Create Groups for each branch
            $groups = Group::factory(2)->create(['branch_id' => $branch->id]);

            foreach ($groups as $group) {
                // Create Students for each group
                $students = Student::factory(10)->create(['branch_id' => $branch->id]);
                foreach ($students as $student) {
                    $student->enrollments()->create([
                        'group_id' => $group->id,
                        'enrolled_at' => now(),
                    ]);
                }
            }
        }
    }
}
