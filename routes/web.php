<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('branches', BranchController::class)->except(['show']);

    Route::post('groups/{group}/end', [GroupController::class, 'end'])->name('groups.end');
    Route::resource('groups', GroupController::class)->except(['show']);

    Route::post('students/{student}/enroll', [StudentController::class, 'enroll'])->name('students.enroll');
    Route::post('students/{student}/transfer', [StudentController::class, 'transfer'])->name('students.transfer');
    Route::resource('students', StudentController::class);

    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');

    Route::get('reports/dashboard', [ReportController::class, 'dashboard'])->name('reports.dashboard');
    Route::get('reports/student/{student}', [ReportController::class, 'student'])->name('reports.student');
    Route::get('reports/search', [ReportController::class, 'search'])->name('reports.search');
});

require __DIR__.'/settings.php';
