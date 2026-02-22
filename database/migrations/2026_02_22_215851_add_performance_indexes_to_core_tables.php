<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->index('name');
            $table->index('track');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->index('ended_at');
        });

        Schema::table('lecture_sessions', function (Blueprint $table) {
            $table->index('date');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['track']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex(['ended_at']);
        });

        Schema::table('lecture_sessions', function (Blueprint $table) {
            $table->dropIndex(['date']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });
    }
};
