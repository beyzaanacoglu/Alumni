<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->foreignId('scholarship_id')->nullable()->after('job_posting_id')->constrained()->cascadeOnDelete();
            $table->unique(['scholarship_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['scholarship_id']);
            $table->dropUnique(['scholarship_id', 'user_id']);
            $table->dropColumn('scholarship_id');
        });
    }
};
