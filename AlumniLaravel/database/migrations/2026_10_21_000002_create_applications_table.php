<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['job', 'internship', 'volunteer', 'project', 'scholarship'])->default('job');
            $table->text('cover_letter')->nullable();
            $table->enum('status', ['pending', 'submitted', 'reviewing', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['job_posting_id', 'user_id']);
            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
