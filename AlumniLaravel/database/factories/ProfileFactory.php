<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
{
    public function definition(): array
    {
        $departments = [
            'Yönetim Bilişim Sistemleri',
            'Bilgisayar Mühendisliği',
            'İşletme',
            'Endüstri Mühendisliği',
            'İktisat',
            'Yazılım Mühendisliği',
            'Uluslararası Ticaret ve Lojistik',
        ];

        $interests = [
            'veri analitiği', 'kurumsal kaynak planlama (ERP)', 'web geliştirme', 'dijital dönüşüm',
            'iş zekâsı', 'proje yönetimi', 'siber güvenlik', 'yapay zekâ', 'girişimcilik', 'e-ticaret',
        ];

        $openings = [
            'Mezuniyetimden bu yana',
            'Üniversite yıllarımdan beri',
            'Kariyerimin başından itibaren',
            'Son birkaç yıldır',
        ];

        $closings = [
            'Mezun ve öğrenci ağımızla bilgi paylaşmaktan keyif alıyorum.',
            'Yeni mezunlara mentorluk yapmaya her zaman açığım.',
            'Staj ve iş fırsatları için benimle iletişime geçebilirsiniz.',
            'Birlikte projeler geliştirmek için bağlantı kurmaktan çekinmeyin.',
        ];

        $bio = sprintf(
            '%s %s ve %s alanlarına ilgi duyuyorum. %s',
            fake()->randomElement($openings),
            fake()->randomElement($interests),
            fake()->randomElement($interests),
            fake()->randomElement($closings)
        );

        return [
            'user_id' => User::factory(),
            'graduation_year' => fake()->numberBetween(2018, 2026),
            'department' => fake()->randomElement($departments),
            'bio' => $bio,
        ];
    }
}