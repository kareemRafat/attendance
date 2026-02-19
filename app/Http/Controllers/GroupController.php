<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupRequest;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Branch;
use App\Enums\CourseType;
use App\Enums\DaysPattern;

class GroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Groups/Index', [
            'groups' => Group::with('branch')->withCount('students')->get(),
            'branches' => Branch::all(),
            'courseTypes' => collect(CourseType::cases())->map(fn($case) => [
                'name' => $case->label(),
                'value' => $case->value,
            ]),
            'daysPatterns' => collect(DaysPattern::cases())->map(fn($case) => [
                'name' => $case->label(),
                'value' => $case->value,
            ]),
            'canManageEverything' => Auth::user()->isAdmin(),
        ]);
    }

    public function store(GroupRequest $request): RedirectResponse
    {
        Group::create($request->validated());

        return redirect()->route('groups.index')->with('success', 'Group created successfully.');
    }

    public function update(GroupRequest $request, Group $group): RedirectResponse
    {
        $this->authorize('update', $group);
        $group->update($request->validated());

        return redirect()->route('groups.index')->with('success', 'Group updated successfully.');
    }

    public function destroy(Group $group): RedirectResponse
    {
        $this->authorize('delete', $group);
        $group->delete();

        return redirect()->route('groups.index')->with('success', 'Group deleted successfully.');
    }

    public function end(Group $group): RedirectResponse
    {
        $this->authorize('update', $group);

        $group->update(['is_active' => false]);

        return redirect()->route('groups.index')->with('success', 'Group ended successfully.');
    }

    public function reactivate(Group $group): RedirectResponse
    {
        $this->authorize('update', $group);

        $group->update(['is_active' => true]);

        return redirect()->route('groups.index')->with('success', 'Group reactivated successfully.');
    }
}
