<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Database\Seeder;

class ScholarshipSeeder extends Seeder
{
    public function run(): void
    {
        $alumniUsers = User::where('role', 'alumni')->get();
        if ($alumniUsers->isEmpty()) {
            $alumniUsers = User::factory(3)->create(['role' => 'alumni']);
        }

        $studentUsers = User::where('role', 'student')->get();
        if ($studentUsers->isEmpty()) {
            $studentUsers = User::factory(10)->create(['role' => 'student']);
        }

        // 1) Örnek Burs İlanları Oluştur
        $scholarshipTemplates = [
            // A) Anonim Mezun Bursu (Veren kişinin adı gizli)
            [
                'title' => 'Mezunlar Başarı ve İhtiyaç Destek Bursu',
                'description' => 'Mühendislik fakültesinde öğrenim gören ve maddi desteğe ihtiyaç duyan başarılı lisans öğrencilerine yönelik mezun katkılı burs programıdır.',
                'donor_name' => null,
                'is_anonymous' => true,
                'amount' => 4500.00,
                'currency' => 'TRY',
                'duration' => '9 Ay (Ekim - Haziran)',
                'quota' => 2,
                'requirements' => 'GPA >= 3.00, Mühendislik Fakültesi 2. veya 3. sınıf öğrencisi olmak.',
                'external_application_link' => null,
                'application_deadline' => now()->addMonths(2)->format('Y-m-d'),
                'status' => 'open',
            ],
            // B) İsmi Görünen Mezun Bursu
            [
                'title' => 'Bilgisayar Mühendisliği 2017 Mezunları Genç Yetenek Bursu',
                'description' => '2017 yılı mezunları olarak bölümümüze yeni başlayan veya öğrenimine devam eden bir genç meslektaşımızın eğitim masraflarını üstlenmek istiyoruz.',
                'donor_name' => 'Caner Erkin (2017 Mezunu)',
                'is_anonymous' => false,
                'amount' => 5000.00,
                'currency' => 'TRY',
                'duration' => '1 Akademik Yıl',
                'quota' => 1,
                'requirements' => 'Bilgisayar veya Yazılım Mühendisliği lisans öğrencisi olmak.',
                'external_application_link' => null,
                'application_deadline' => now()->addMonth()->format('Y-m-d'),
                'status' => 'open',
            ],
            // C) Bir Diğer Anonim Mezun Bursu
            [
                'title' => 'Teknolojiye Adım Kitap ve Ekipman Desteği Bursu',
                'description' => 'Dizüstü bilgisayar, ders kitapları ve online eğitim sertifikaları için tek seferlik veya dönemlik destek fonu.',
                'donor_name' => null,
                'is_anonymous' => true,
                'amount' => 3500.00,
                'currency' => 'TRY',
                'duration' => 'Tek Seferlik',
                'quota' => 3,
                'requirements' => 'İhtiyaç beyanı ve aktif öğrenci belgesi.',
                'external_application_link' => null,
                'application_deadline' => now()->addDays(25)->format('Y-m-d'),
                'status' => 'open',
            ],
            // D) Genel Kurumsal Burs Duyurusu (Harici Yönlendirme Linki ile)
            [
                'title' => 'Türk Eğitim Vakfı (TEV) Üniversite Lisans Burs Duyurusu',
                'description' => 'TEV yurt içi yükseköğrenim burs programı başvuruları başlamıştır. Burs başvuruları vakfın resmi web sitesi üzerinden doğrudan yapılmaktadır.',
                'donor_name' => 'Türk Eğitim Vakfı (TEV)',
                'is_anonymous' => false,
                'amount' => 4500.00,
                'currency' => 'TRY',
                'duration' => '9 Ay Boyunca',
                'quota' => 50,
                'requirements' => 'T.C. vatandaşı olmak, maddi desteğe ihtiyaç duymak, başka bir kamu/özel kurumdan burs almamak.',
                'external_application_link' => 'https://www.tev.org.tr/burs-basvurulari',
                'application_deadline' => now()->addWeeks(3)->format('Y-m-d'),
                'status' => 'open',
            ],
            // E) Vehbi Koç Vakfı Burs Duyurusu (Harici Link)
            [
                'title' => 'Vehbi Koç Vakfı Üniversite Destek Burs Duyurusu',
                'description' => 'Vehbi Koç Vakfı tarafından sağlanan karşılıksız eğitim bursu duyurusudur. İlgilenen öğrencilerimiz ilgili link üzerinden başvuru formunu doldurabilirler.',
                'donor_name' => 'Vehbi Koç Vakfı',
                'is_anonymous' => false,
                'amount' => 6000.00,
                'currency' => 'TRY',
                'duration' => 'Ekim - Haziran',
                'quota' => 15,
                'requirements' => 'Genel başarı durumu, disiplin cezası bulunmamak.',
                'external_application_link' => 'https://vkv.org.tr/egitim-burslari',
                'application_deadline' => now()->addWeeks(4)->format('Y-m-d'),
                'status' => 'open',
            ],
        ];

        $createdScholarships = collect();
        foreach ($scholarshipTemplates as $idx => $template) {
            $author = $alumniUsers->values()->get($idx % $alumniUsers->count());
            $scholarship = Scholarship::create($template + ['user_id' => $author->id]);
            $createdScholarships->push($scholarship);
        }

        // 2) Dahili burslara gerçekçi öğrenci başvuruları oluştur
        $internalScholarships = $createdScholarships->filter(fn ($s) => $s->usesInternalApplications());

        $studentMotivationalLetters = [
            'Sayın Mezunumuz, Mühendislik Fakültesi 3. sınıf öğrencisiyim. Not ortalamam 3.48 olup ailemin maddi imkanları kısıtlıdır. Sağlayacağınız bu burs desteği, tez ve araştırma projelerimde ihtiyaç duyduğum kaynaklara erişmemi sağlayacaktır. Desteğiniz için şimdiden çok teşekkür ederim.',
            'Merhaba, hazırlık sınıfını dereceyle bitirip lisans 1. sınıf eğitimime başladım. Şehir dışından geldiğim için barınma masraflarımı karşılamakta güçlük çekiyorum. Burs desteğinizi layıkıyla değerlendireceğime ve mezun olduğumda ben de bir öğrenciye el uzatacağıma söz veriyorum.',
            'Sayın İlgili, bölümümüzde sürdürdüğüm robotik ve yazılım çalışmalarımı ilerletmek istiyorum. Sağlayacağınız bu eğitim bursu, ders materyalleri ve donanım gereksinimlerimi karşılamamda büyük bir güvence olacaktır.',
            'Merhaba, ihtiyaç bursu şartlarını dikkatle inceledim ve durumumun kriterlere uygun olduğunu belirterek başvurumu sunuyorum. İlgili transkript ve öğrenci belgelerimi mülakat sürecinde iletmekten memnuniyet duyarım.',
        ];

        foreach ($internalScholarships as $scholarship) {
            // Her dahili bursa rastgele 2 ila 4 öğrenci başvursun
            $applicants = $studentUsers->random(min(3, $studentUsers->count()));

            foreach ($applicants as $idx => $student) {
                if (Application::where('scholarship_id', $scholarship->id)->where('user_id', $student->id)->exists()) {
                    continue;
                }

                Application::create([
                    'scholarship_id' => $scholarship->id,
                    'user_id' => $student->id,
                    'type' => Application::TYPE_SCHOLARSHIP,
                    'cover_letter' => $studentMotivationalLetters[$idx % count($studentMotivationalLetters)],
                    'status' => fake()->randomElement(['pending', 'reviewing', 'accepted']),
                ]);
            }
        }
    }
}
