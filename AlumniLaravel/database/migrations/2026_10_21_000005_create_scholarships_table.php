<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Oluşturan mezun / yönetici
            $table->string('title'); // Burs Başlığı (Örn: Mezunlar Başarı Bursu, İhtiyaç Bursu)
            $table->text('description'); // Detaylı açıklama ve burs kapsamı
            $table->string('donor_name')->nullable(); // Belirtilmişse mezunun veya kurumun adı
            $table->boolean('is_anonymous')->default(false); // Veren kişinin adı gizlensin mi? (Anonim mezun tercihi)
            $table->decimal('amount', 10, 2)->nullable(); // Aylık veya toplam burs tutarı
            $table->string('currency', 3)->default('TRY');
            $table->string('duration')->nullable(); // Örn: 9 Ay, Yıllık, Tek Seferlik
            $table->unsignedInteger('quota')->nullable(); // Kontenjan (Kaç öğrenciye verileceği)
            $table->text('requirements')->nullable(); // Not ortalaması, bölüm, ihtiyaç beyanı vb. kriterler
            $table->string('contact_email')->nullable();
            // Harici genel burs duyurusu ise dış yönlendirme linki; NULL ise sistem üzerinden dahili başvuru
            $table->string('external_application_link', 500)->nullable();
            $table->date('application_deadline')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();

            $table->index(['status', 'application_deadline']);
            $table->index('is_anonymous');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};
