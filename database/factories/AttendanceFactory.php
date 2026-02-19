<?php

namespace Database\Factories;

use App\Enums\AttendanceStatus;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
use App\Models\LectureSession;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lecture_session_id' => LectureSession::factory(),
            'student_id' => Student::factory(),
            'status' => fake()->randomElement(AttendanceStatus::cases()),
        ];
    }
}
