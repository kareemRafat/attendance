<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Group;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_branches' => Branch::count(),
            'total_groups' => Group::where('is_active', true)->count(),
            'total_students' => Student::count(),
        ];

        $branches = Branch::withCount(['groups', 'users'])->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'branches' => $branches,
        ]);
    }
}
