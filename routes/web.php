<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('branches', BranchController::class)->except(['show']);

    Route::middleware(['admin'])->group(function () {
        Route::resource('employees', EmployeeController::class)->except(['show', 'create', 'edit']);
    });

    Route::post('groups/{group}/end', [GroupController::class, 'end'])->name('groups.end');
    Route::post('groups/{group}/reactivate', [GroupController::class, 'reactivate'])->name('groups.reactivate');
    Route::resource('groups', GroupController::class);

    Route::post('students/{student}/enroll', [StudentController::class, 'enroll'])->name('students.enroll');
    Route::post('students/{student}/transfer', [StudentController::class, 'transfer'])->name('students.transfer');
    Route::resource('students', StudentController::class);

    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');
});

require __DIR__.'/settings.php';
