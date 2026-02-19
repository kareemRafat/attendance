<?php

namespace App\Models;

use App\Enums\CourseType;
use App\Models\Concerns\BelongsToBranch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use BelongsToBranch, HasFactory;

    protected $fillable = ['branch_id', 'track', 'name', 'details'];

    protected $appends = ['formatted_track'];

    protected function casts(): array
    {
        return [
            'track' => CourseType::class,
        ];
    }

    public function getFormattedTrackAttribute(): ?string
    {
        return $this->track?->label();
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'enrollments');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function transferLogs(): HasMany
    {
        return $this->hasMany(TransferLog::class);
    }
}
