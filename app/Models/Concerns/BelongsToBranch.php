<?php

namespace App\Models\Concerns;

use App\Models\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Model;

trait BelongsToBranch
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new BranchScope);
    }
}
