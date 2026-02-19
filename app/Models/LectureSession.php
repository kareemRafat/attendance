<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LectureSession extends Model
{
    /** @use HasFactory<\Database\Factories\LectureSessionFactory> */
    use HasFactory;

    protected $fillable = ['group_id', 'date', 'lecture_number'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'attendances');
    }
}
