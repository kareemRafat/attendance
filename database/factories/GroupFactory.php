<?php

namespace Database\Factories;

use App\Enums\CourseType;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Group>
 */
use App\Enums\DaysPattern;
use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class GroupFactory extends Factory
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
            'name' => fake()->unique()->word().' Group',
            'course_type' => fake()->randomElement(CourseType::cases()),
            'pattern' => fake()->randomElement(DaysPattern::cases()),
            'start_date' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'max_lectures' => 45,
            'is_active' => true,
        ];
    }
}
