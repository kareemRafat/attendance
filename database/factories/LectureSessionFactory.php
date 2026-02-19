<?php

namespace Database\Factories;

use App\Models\Group;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LectureSession>
 */
use Illuminate\Database\Eloquent\Factories\Factory;

class LectureSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group_id' => Group::factory(),
            'date' => now(),
            'lecture_number' => fake()->numberBetween(1, 45),
        ];
    }
}
