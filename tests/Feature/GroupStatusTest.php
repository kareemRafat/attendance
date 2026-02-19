<?php

use App\Models\Branch;
use App\Models\Group;
use App\Models\User;
use function Pest\Laravel\{actingAs, post, get, withoutMiddleware};

beforeEach(function () {
    withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    $this->branch = Branch::factory()->create();
    $this->admin = User::factory()->admin()->create();
    $this->employee = User::factory()->employee($this->branch)->create();
});

it('can end an active group', function () {
    $group = Group::factory()->create([
        'branch_id' => $this->branch->id,
        'is_active' => true,
    ]);

    $this->actingAs($this->admin)
        ->post(route('groups.end', $group))
        ->assertRedirect(route('groups.index'));

    expect($group->fresh()->is_active)->toBeFalse();
});

it('can reactivate a closed group', function () {
    $group = Group::factory()->create([
        'branch_id' => $this->branch->id,
        'is_active' => false,
    ]);

    $this->actingAs($this->admin)
        ->post(route('groups.reactivate', $group))
        ->assertRedirect(route('groups.index'));

    expect($group->fresh()->is_active)->toBeTrue();
});

it('filters groups by status in the index page', function () {
    Group::factory()->create([
        'branch_id' => $this->branch->id,
        'is_active' => true,
        'name' => 'Active Group',
    ]);

    Group::factory()->create([
        'branch_id' => $this->branch->id,
        'is_active' => false,
        'name' => 'Closed Group',
    ]);

    $response = $this->actingAs($this->admin)->get(route('groups.index'));

    $response->assertSuccessful();
    
    // Check if both groups are returned (filtering is done on frontend)
    $groups = $response->viewData('page')['props']['groups'];
    expect($groups)->toHaveCount(2);
});
