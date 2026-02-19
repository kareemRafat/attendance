<?php

namespace App\Http\Requests;

use App\Enums\CourseType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->user()->branch_id && ! $this->user()->isAdmin()) {
            $this->merge([
                'branch_id' => $this->user()->branch_id,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'branch_id' => ['required', 'exists:branches,id'],
            'track' => ['required', Rule::enum(CourseType::class)],
        ];

        if ($this->has('students')) {
            return array_merge($rules, [
                'students' => ['required', 'array', 'min:1'],
                'students.*.name' => ['required', 'string', 'max:255'],
                'students.*.details' => ['nullable', 'string'],
                'group_id' => ['required', 'exists:groups,id'],
            ]);
        }

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            return [
                'name' => ['required', 'string', 'max:255'],
                'track' => ['required', Rule::enum(CourseType::class)],
            ];
        }

        return array_merge($rules, [
            'name' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
            'group_id' => ['required', 'exists:groups,id'],
        ]);
    }
}
