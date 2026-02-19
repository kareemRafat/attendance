<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureBranchAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // Admin can access everything
        if ($user->role === UserRole::Admin) {
            return $next($request);
        }

        // Employee must have a branch assigned
        if (! $user->branch_id) {
            Auth::logout();

            return redirect()->route('login')->withErrors(['branch' => 'You must be assigned to a branch to access this system.']);
        }

        return $next($request);
    }
}
