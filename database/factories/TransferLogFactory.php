<?php

namespace Database\Factories;

use App\Models\Group;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TransferLog>
 */
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransferLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'from_group_id' => Group::factory(),
            'to_group_id' => Group::factory(),
            'transferred_at' => now(),
            'effective_date' => now()->addWeek(),
            'reason' => fake()->sentence(),
        ];
    }
}
