<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\WorkExperience>
 */
class WorkExperienceFactory extends Factory
{
    /**
     * Gerçek şehir merkezleri [enlem, boylam]. Haritada anlamlı dağılım için kullanılır.
     */
    private const CITIES = [
        'İstanbul' => [41.0082, 28.9784],
        'Ankara' => [39.9334, 32.8597],
        'İzmir' => [38.4237, 27.1428],
        'Bursa' => [40.1826, 29.0665],
        'Kocaeli' => [40.8533, 29.8815],
        'Eskişehir' => [39.7767, 30.5206],
        'Antalya' => [36.8969, 30.7133],
        'Berlin' => [52.5200, 13.4050],
        'Londra' => [51.5074, -0.1278],
        'Amsterdam' => [52.3676, 4.9041],
        'Dublin' => [53.3498, -6.2603],
        'Dubai' => [25.2048, 55.2708],
    ];

    public function definition(): array
    {
        $companies = [
            'Trendyol', 'Hepsiburada', 'Getir', 'Garanti BBVA Teknoloji', 'Turkcell', 'Arçelik',
            'Koç Digital', 'Baykar', 'Logo Yazılım', 'Insider', 'Papara', 'Vestel',
            'SAP', 'Siemens', 'Deloitte', 'PwC', 'Accenture', 'Microsoft',
        ];

        $positions = [
            'Yazılım Geliştirici', 'İş Analisti', 'Veri Analisti', 'Proje Yöneticisi', 'Ürün Yöneticisi',
            'ERP Danışmanı', 'Sistem Analisti', 'Stajyer', 'Dijital Pazarlama Uzmanı', 'IT Destek Uzmanı',
        ];

        // Pozitif ağırlık: şehirlerin çoğu Türkiye'de olsun
        $city = fake()->randomElement(array_keys(self::CITIES));
        [$lat, $lng] = self::CITIES[$city];

        // Şehir merkezi etrafında ~±0.05° (yaklaşık 5 km) sapma
        $latitude = round($lat + fake()->randomFloat(6, -0.05, 0.05), 8);
        $longitude = round($lng + fake()->randomFloat(6, -0.05, 0.05), 8);

        return [
            'user_id' => User::factory(),
            'company' => fake()->randomElement($companies),
            'position' => fake()->randomElement($positions),
            'latitude' => $latitude,
            'longitude' => $longitude,
        ];
    }
}