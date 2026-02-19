<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupRequest;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Groups/Index', [
            'groups' => Group::with('branch')->withCount('students')->get(),
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
}
