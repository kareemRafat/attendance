<?php

namespace App\Models;

use App\Enums\DaysPattern;
use App\Models\Concerns\BelongsToBranch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    /** @use HasFactory<\Database\Factories\GroupFactory> */
    use BelongsToBranch, HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'pattern',
        'start_date',
        'max_lectures',
        'is_active',
    ];

    protected $appends = ['formatted_pattern'];

    protected function casts(): array
    {
        return [
            'pattern' => DaysPattern::class,
            'start_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function getFormattedPatternAttribute(): string
    {
        return $this->pattern->label();
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'enrollments');
    }

    public function lectureSessions(): HasMany
    {
        return $this->hasMany(LectureSession::class);
    }
}
