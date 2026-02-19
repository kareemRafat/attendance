<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    /** @use HasFactory<\Database\Factories\BranchFactory> */
    use HasFactory;

    protected $fillable = ['name', 'location'];

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
