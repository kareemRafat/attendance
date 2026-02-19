<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransferLog extends Model
{
    /** @use HasFactory<\Database\Factories\TransferLogFactory> */
    use HasFactory;

    protected $fillable = [
        'student_id',
        'from_group_id',
        'to_group_id',
        'transferred_at',
        'effective_date',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'transferred_at' => 'datetime',
            'effective_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function fromGroup(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'from_group_id');
    }

    public function toGroup(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'to_group_id');
    }
}
