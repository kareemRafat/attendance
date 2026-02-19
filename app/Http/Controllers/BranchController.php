<?php

namespace App\Http\Controllers;

use App\Http\Requests\BranchRequest;
use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Branch::class);

        return Inertia::render('Branches/Index', [
            'branches' => Branch::withCount(['groups', 'users'])->get(),
        ]);
    }

    public function store(BranchRequest $request): RedirectResponse
    {
        Branch::create($request->validated());

        return redirect()->route('branches.index')->with('success', 'Branch created successfully.');
    }

    public function update(BranchRequest $request, Branch $branch): RedirectResponse
    {
        $branch->update($request->validated());

        return redirect()->route('branches.index')->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch): RedirectResponse
    {
        $this->authorize('delete', $branch);
        $branch->delete();

        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully.');
    }
}
