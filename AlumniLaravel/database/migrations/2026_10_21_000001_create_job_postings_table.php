<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('company_name');
            $table->string('city')->nullable();
            $table->string('country', 2)->nullable();
            $table->enum('employment_type', ['full_time', 'part_time', 'internship', 'volunteer', 'project', 'contract']);
            $table->enum('work_mode', ['onsite', 'remote', 'hybrid'])->default('onsite');
            $table->enum('experience_level', ['entry', 'mid', 'senior'])->nullable();
            $table->text('required_skills')->nullable();
            $table->string('contact_email')->nullable();
            // When set, applicants are redirected here; when NULL, applications are tracked in applications.
            $table->string('external_application_link', 500)->nullable();
            $table->date('application_deadline')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();

            $table->index(['status', 'application_deadline']);
            $table->index('employment_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
