<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Companies table
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // optional company rep/owner
            $table->string('name');
            $table->string('industry')->nullable();     // Yazılım, Finans, E-Ticaret, vb.
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Add company_id foreign key to job_postings table
        if (Schema::hasTable('job_postings')) {
            Schema::table('job_postings', function (Blueprint $table) {
                $table->foreignId('company_id')->nullable()->after('user_id')->constrained('companies')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('job_postings') && Schema::hasColumn('job_postings', 'company_id')) {
            Schema::table('job_postings', function (Blueprint $table) {
                $table->dropForeign(['company_id']);
                $table->dropColumn('company_id');
            });
        }

        Schema::dropIfExists('companies');
    }
};
