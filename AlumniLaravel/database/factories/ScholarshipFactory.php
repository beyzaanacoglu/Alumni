<?php

namespace Database\Factories;

use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Scholarship>
 */
class ScholarshipFactory extends Factory
{
    protected $model = Scholarship::class;

    public function definition(): array
    {
        $scholarshipPool = [
            // Mezunların oluşturduğu dahili burslar (Anonim veya İsimli)
            [
                'title' => 'Bilgisayar Mühendisliği Başarı ve İhtiyaç Bursu',
                'description' => 'Bölümümüzde öğrenim gören ve maddi desteğe ihtiyaç duyan başarılı lisans öğrencilerine eğitim yılı boyunca destek bursu sağlanacaktır.',
                'requirements' => 'Bilgisayar Mühendisliği 2. veya 3. sınıf öğrencisi olmak, Genel Not Ortalaması (GPA) en az 2.80 olmak.',
                'amount' => 4000.00,
                'duration' => '9 Ay (Ekim - Haziran)',
                'quota' => 2,
                'is_external' => false,
            ],
            [
                'title' => 'Geleceğin Kadın Mühendisleri Destek Bursu',
                'description' => 'Mühendislik fakültesinde öğrenim gören başarılı kadın öğrencilerimize teknoloji alanındaki gelişimlerini desteklemek amacıyla verilen karşılıksız burs programıdır.',
                'requirements' => 'Mühendislik Fakültesi lisans öğrencisi olmak, GPA >= 3.00.',
                'amount' => 5000.00,
                'duration' => '9 Ay',
                'quota' => 3,
                'is_external' => false,
            ],
            [
                'title' => 'Mezunlar Ağı Barınma ve Kitap Desteği Bursu',
                'description' => 'Farklı şehirlerden üniversitemize gelen ve KYK/özel yurt masraflarında desteğe ihtiyacı olan öğrencilere yönelik mezun dayanışma bursudur.',
                'requirements' => 'Hazırlık veya 1. sınıf öğrencisi olmak, öncelikli ihtiyaç durumu.',
                'amount' => 3000.00,
                'duration' => '9 Ay',
                'quota' => 4,
                'is_external' => false,
            ],
            // Genel kurumsal burs duyuruları (Dış Linke Yönlendiren)
            [
                'title' => 'Türk Eğitim Vakfı (TEV) Yükseköğrenim Lisans Bursu',
                'description' => 'TEV yurt içi yükseköğrenim burs programı kapsamında üniversitemiz öğrencilerine yönelik açık burs başvuruları başlamıştır.',
                'requirements' => 'T.C. vatandaşı olmak, 25 yaşını doldurmamış olmak, başarılı ve maddi desteğe ihtiyaç duymak.',
                'amount' => 4500.00,
                'duration' => 'Ekim - Haziran',
                'quota' => 20,
                'is_external' => true,
                'external_link' => 'https://www.tev.org.tr/burs-basvuru',
            ],
            [
                'title' => 'Vehbi Koç Vakfı Üniversite Destek Burs Programı',
                'description' => 'Vehbi Koç Vakfı tarafından sağlanan karşılıksız eğitim bursu duyurusudur. Başvurular doğrudan vakıf portalı üzerinden alınmaktadır.',
                'requirements' => 'Üniversitemize kayıtlı lisans öğrencisi olmak, disiplin cezası almamış olmak.',
                'amount' => 6000.00,
                'duration' => 'Akademik Yıl Boyunca',
                'quota' => 10,
                'is_external' => true,
                'external_link' => 'https://vkv.org.tr/burslar',
            ],
        ];

        $selected = fake()->randomElement($scholarshipPool);
        $isExternal = $selected['is_external'];

        // Mezun burslarında bağışçının adı bazen anonim bazen açık isim
        $isAnonymous = $isExternal ? false : fake()->boolean(50);
        $donorName = $isExternal
            ? 'Kurumsal Vakıf Duyurusu'
            : ($isAnonymous ? null : fake()->name().' (2018 Mezunu)');

        return [
            'user_id' => User::factory(['role' => 'alumni']),
            'title' => $selected['title'],
            'description' => $selected['description'],
            'donor_name' => $donorName,
            'is_anonymous' => $isAnonymous,
            'amount' => $selected['amount'],
            'currency' => 'TRY',
            'duration' => $selected['duration'],
            'quota' => $selected['quota'],
            'requirements' => $selected['requirements'],
            'contact_email' => fake()->boolean(70) ? fake()->safeEmail() : null,
            'external_application_link' => $isExternal ? ($selected['external_link'] ?? 'https://burs.example.gov.tr') : null,
            'application_deadline' => fake()->dateTimeBetween('+2 weeks', '+2 months')->format('Y-m-d'),
            'status' => 'open',
        ];
    }

    public function anonymous(): static
    {
        return $this->state(fn () => [
            'is_anonymous' => true,
            'donor_name' => null,
            'external_application_link' => null,
        ]);
    }

    public function external(): static
    {
        return $this->state(fn () => [
            'is_anonymous' => false,
            'external_application_link' => 'https://burs.example.gov.tr',
        ]);
    }
}
