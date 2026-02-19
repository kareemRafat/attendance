<?php

namespace App\Http\Controllers;

use App\Enums\DaysPattern;
use App\Http\Requests\GroupRequest;
use App\Models\Branch;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('tab', 'active');
        $isActive = $status === 'active';

        $groups = Group::where('is_active', $isActive)
            ->with('branch')
            ->withCount('students')
            ->latest()
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
            'branches' => Branch::all(),
            'daysPatterns' => collect(DaysPattern::cases())->map(fn ($case) => [
                'name' => $case->label(),
                'value' => $case->value,
            ]),
            'canManageEverything' => Auth::user()->isAdmin(),
            'currentTab' => $status,
        ]);
    }

    public function show(Group $group): Response
    {
        $this->authorize('view', $group);

        $group->load('branch');

        $students = $group->students()
            ->withPivot('enrolled_at', 'ended_at')
            ->withCount([
                'attendances as present_count' => function ($query) use ($group) {
                    $query->whereHas('lectureSession', function ($q) use ($group) {
                        $q->where('group_id', $group->id);
                    })->where('status', \App\Enums\AttendanceStatus::Present);
                },
                'attendances as absent_count' => function ($query) use ($group) {
                    $query->whereHas('lectureSession', function ($q) use ($group) {
                        $q->where('group_id', $group->id);
                    })->where('status', \App\Enums\AttendanceStatus::Absent);
                },
                'attendances as excused_count' => function ($query) use ($group) {
                    $query->whereHas('lectureSession', function ($q) use ($group) {
                        $q->where('group_id', $group->id);
                    })->where('status', \App\Enums\AttendanceStatus::Excused);
                },
            ])
            ->get();

        $sessions = $group->lectureSessions()
            ->withCount([
                'attendances as present_count' => fn ($q) => $q->where('status', \App\Enums\AttendanceStatus::Present),
                'attendances as absent_count' => fn ($q) => $q->where('status', \App\Enums\AttendanceStatus::Absent),
                'attendances as excused_count' => fn ($q) => $q->where('status', \App\Enums\AttendanceStatus::Excused),
            ])
            ->latest('date')
            ->get();

        return Inertia::render('Groups/Show', [
            'group' => $group,
            'students' => $students,
            'sessions' => $sessions,
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
