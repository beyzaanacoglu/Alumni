<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\FeedPost>
 */
class FeedPostFactory extends Factory
{
    public function definition(): array
    {
        $bodies = [
            'Bugün mezunlar buluşmasında eski dostlarla bir araya gelmek harikaydı!',
            'Yeni işimde ilk haftamı tamamladım, bana destek olan herkese teşekkürler.',
            'Veritabanı tasarımı dersindeki proje deneyimim bugün işimde çok işime yarıyor.',
            'Staj arayan arkadaşlar için ekibimizde yeni pozisyonlar açıldı, mesaj atabilirsiniz.',
            'Kampüs günlerini özledim. Yönetim Bilişim Sistemleri bölümünde geçen yıllar çok kıymetliydi.',
            'Bu hafta sonu İstanbul\'da networking kahvesi düzenliyoruz, katılmak isteyen var mı?',
            'Laravel ile geliştirdiğimiz mezun takip sistemi sonunda canlıya çıktı!',
            'Mezuniyet töreninden kareler paylaşıyorum, hepinizi çok özleyeceğim.',
            'Kariyer günlerinde sunum yapmak benim için büyük bir gururdu.',
            'ERP sertifikamı aldım! Çalışırken öğrendiklerimi paylaşmaktan mutluluk duyarım.',
        ];

        $seed = fake()->unique()->numberBetween(1, 1000000);

        return [
            'user_id' => User::factory(),
            'body' => fake()->randomElement($bodies),
            'image_path' => fake()->boolean(55) ? "https://picsum.photos/seed/{$seed}/800/450" : null,
        ];
    }
}