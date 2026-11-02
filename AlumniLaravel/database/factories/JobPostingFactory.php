<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\JobPosting>
 */
class JobPostingFactory extends Factory
{
    public function definition(): array
    {
        $companies = [
            'Trendyol', 'Hepsiburada', 'Getir', 'Turkcell', 'Arçelik', 'Insider', 'Papara', 'Vestel',
            'Mezunlar Derneği İnovasyon Merkezi', 'Açık Kaynak Yazılım Topluluğu',
        ];

        $postingsPool = [
            ['title' => 'Junior Backend Geliştirici (PHP / Laravel)', 'type' => 'full_time'],
            ['title' => 'Frontend React Geliştirici', 'type' => 'full_time'],
            ['title' => 'Yazılım Mühendisliği Yaz Stajyeri', 'type' => 'internship'],
            ['title' => 'Uzun Dönem Veri Analitiği Stajı', 'type' => 'internship'],
            ['title' => 'Mobil Uygulama Test & QA Stajyeri', 'type' => 'internship'],
            ['title' => 'Mezunlar Ağı Açık Kaynak Projesi Gönüllü Geliştirici', 'type' => 'volunteer'],
            ['title' => 'Sosyal Sorumluluk: Liselilere Kodlama Eğitimi Projesi', 'type' => 'project'],
            ['title' => 'Üniversite-Sanayi İşbirliği Ar-Ge Proje Asistanı', 'type' => 'project'],
            ['title' => 'Part-Time Teknik Destek & Sistem Uzmanı', 'type' => 'part_time'],
        ];

        $selected = fake()->randomElement($postingsPool);
        $cities = [['İstanbul', 41.01384, 28.94966], ['Ankara', 39.93340, 32.85970], ['İzmir', 38.42370, 27.14280]];

        // Volunteer and internship postings often accept internal applications directly
        $external = in_array($selected['type'], ['volunteer', 'project']) ? false : fake()->boolean(40);
        [$city, $lat, $lng] = fake()->randomElement($cities);
        $withCoordinates = fake()->boolean(70);

        return [
            'user_id' => User::factory(['role' => 'alumni']),
            'title' => $selected['title'],
            'description' => fake()->paragraphs(2, true),
            'company_name' => fake()->randomElement($companies),
            'city' => $city,
            'country' => 'TR',
            'employment_type' => $selected['type'],
            'work_mode' => fake()->randomElement(['onsite', 'remote', 'hybrid']),
            'experience_level' => fake()->randomElement(['entry', 'mid', 'senior', null]),
            'required_skills' => fake()->randomElement(['SQL, Power BI', 'PHP, Laravel, MySQL', 'Node.js, PostgreSQL', 'React, TypeScript', null]),
            'contact_email' => fake()->boolean(60) ? fake()->safeEmail() : null,
            'external_application_link' => $external ? 'https://careers.example.com/jobs/'.fake()->numberBetween(1000, 9999) : null,
            'application_deadline' => fake()->boolean(75) ? fake()->dateTimeBetween('+1 week', '+3 months')->format('Y-m-d') : null,
            'status' => 'open',
            'latitude' => $withCoordinates ? $lat : null,
            'longitude' => $withCoordinates ? $lng : null,
        ];
    }
}
