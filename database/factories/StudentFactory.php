<?php

namespace Database\Factories;

use App\Enums\CourseType;
use App\Models\Branch;
/**
 * @extends \Illuminate\Contracts\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'track' => fake()->randomElement(CourseType::cases()),
            'name' => fake()->name(),
            'details' => fake()->paragraph(),
        ];
    }
}
