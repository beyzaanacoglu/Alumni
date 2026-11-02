<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Announcement>
 */
class AnnouncementFactory extends Factory
{
    public function definition(): array
    {
        $companies = [
            'Trendyol', 'Hepsiburada', 'Getir', 'Garanti BBVA Teknoloji', 'Turkcell', 'Arçelik',
            'Koç Digital', 'Baykar', 'Logo Yazılım', 'Insider', 'Papara', 'Vestel',
        ];

        $company = fake()->randomElement($companies);

        $items = [
            ['%s Yaz Stajı Programı Başvuruları Açıldı', '%s bünyesinde 2026 yaz dönemi için 8 haftalık staj programı başlıyor. Yönetim Bilişim Sistemleri ve ilgili bölüm öğrencileri başvurabilir. Son başvuru tarihi ayın sonudur.'],
            ['%s Veri Analisti Pozisyonu', 'Ekibimize SQL ve Power BI bilgisine sahip, yeni mezun veya 1-2 yıl deneyimli bir veri analisti arıyoruz. Başvurular için profilimden bana mesaj atabilirsiniz.'],
            ['%s ile Kariyer Sohbeti Etkinliği', 'Mezunlarımızdan %s çalışanları ile kariyer yolculuklarını konuşacağımız çevrim içi etkinliğe tüm öğrencilerimiz davetlidir.'],
            ['%s Açık Kaynak Proje Ekibi Arıyor', '%s mezun ağı olarak yürüttüğümüz açık kaynak mezun takip projesine katkıda bulunmak isteyen öğrencilere mentorluk desteği sağlayacağız.'],
            ['%s Junior Yazılım Geliştirici İlanı', 'Laravel ve MySQL deneyimi olan, takım çalışmasına yatkın junior yazılım geliştiriciler arıyoruz. Uzaktan ve hibrit çalışma seçenekleri mevcuttur.'],
        ];

        [$title, $content] = fake()->randomElement($items);

        return [
            'user_id' => User::factory(['role' => 'alumni']),
            'title' => sprintf($title, $company),
            'content' => str_contains($content, '%s') ? sprintf($content, $company) : $content,
            'company_name' => fake()->boolean(85) ? $company : null,
        ];
    }
}