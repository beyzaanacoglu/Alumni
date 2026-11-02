<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Company;
use App\Models\FeedPost;
use App\Models\Application;
use App\Models\JobPosting;
use App\Models\Message;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0) Temel rollerin oluşturulması
        $roles = [
            Role::ADMIN => Role::firstOrCreate(['name' => Role::ADMIN], ['display_name' => 'Yönetici', 'description' => 'Sistem genelinde tam yetkili']),
            Role::ALUMNI => Role::firstOrCreate(['name' => Role::ALUMNI], ['display_name' => 'Mezun', 'description' => 'Mezuniyetini tamamlamış, ilan ve duyuru açabilen']),
            Role::COMPANY => Role::firstOrCreate(['name' => Role::COMPANY], ['display_name' => 'Şirket Temsilcisi', 'description' => 'Kurumsal kariyer ve staj ilanı yayınlayabilen']),
            Role::STUDENT => Role::firstOrCreate(['name' => Role::STUDENT], ['display_name' => 'Öğrenci', 'description' => 'Mevcut öğrenci, ilanlara başvurabilen']),
        ];

        // 1) 50 kullanıcı: 1 sabit admin + 49 rastgele rollü kullanıcı
        $adminUser = User::factory()->create([
            'name' => 'Admin Kullanıcı',
            'email' => 'admin@alumni.test',
            'role' => 'admin',
        ]);
        $adminUser->assignRole(Role::ADMIN);

        User::factory(49)->create();

        // Rol dağılımını dengele
        $missingAlumni = 10 - User::where('role', 'alumni')->count();
        if ($missingAlumni > 0) {
            User::where('role', 'student')->inRandomOrder()->limit($missingAlumni)->update(['role' => 'alumni']);
        }

        // Birkaç şirket kullanıcısı oluştur
        User::where('role', 'student')->inRandomOrder()->limit(4)->update(['role' => 'company']);

        $users = User::all();
        $userIds = $users->pluck('id');
        $alumni = $users->where('role', 'alumni');
        $companyUsers = $users->where('role', 'company');

        // Her kullanıcının rolünü role_user pivot tablosuna eşle
        foreach ($users as $user) {
            $userRoleName = $user->role ?? 'student';
            if (isset($roles[$userRoleName])) {
                $user->roles()->syncWithoutDetaching([$roles[$userRoleName]->id]);
            }
        }

        // Örnek şirket kayıtları (One-to-Many ilişkisi için)
        $sampleCompanies = collect([
            ['name' => 'Trendyol', 'industry' => 'E-Ticaret & Yazılım', 'city' => 'İstanbul', 'website' => 'https://trendyol.com'],
            ['name' => 'Hepsiburada', 'industry' => 'E-Ticaret', 'city' => 'İstanbul', 'website' => 'https://hepsiburada.com'],
            ['name' => 'Garanti BBVA Teknoloji', 'industry' => 'Fintek & Bankacılık', 'city' => 'İstanbul', 'website' => 'https://garantibbva.com.tr'],
            ['name' => 'SAP Türkiye', 'industry' => 'Kurumsal Yazılım & ERP', 'city' => 'İstanbul', 'website' => 'https://sap.com'],
        ])->map(function ($data, $idx) use ($companyUsers) {
            $assignedRep = $companyUsers->values()->get($idx);
            return Company::create($data + ['user_id' => $assignedRep?->id]);
        });

        // 2) Her kullanıcıya bir profil
        foreach ($users as $user) {
            Profile::factory()->create(['user_id' => $user->id]);
        }

        // 3) Her kullanıcıya 1-3 iş/staj deneyimi (harita verisi)
        foreach ($users as $user) {
            WorkExperience::factory(fake()->numberBetween(1, 3))->create(['user_id' => $user->id]);
        }

        // 4) Duyurular yalnızca mezunlar tarafından
        foreach ($alumni as $user) {
            Announcement::factory(fake()->numberBetween(1, 3))->create(['user_id' => $user->id]);
        }

        // 4b) İş ilanları yalnızca mezunlar tarafından
        $jobPostings = collect();
        foreach ($alumni as $user) {
            $created = JobPosting::factory(fake()->numberBetween(1, 2))->create(['user_id' => $user->id]);
            $jobPostings = $jobPostings->merge($created);
        }

        // 4c) İş, staj ve gönüllü proje başvuruları seeder'ı
        $this->call(ApplicationSeeder::class);

        // 4d) Burs ilanları ve öğrenci burs başvuruları seeder'ı
        $this->call(ScholarshipSeeder::class);

        // 5) Sosyal akış gönderileri
        foreach ($users as $user) {
            FeedPost::factory(fake()->numberBetween(0, 4))->create(['user_id' => $user->id]);
        }

        // 6) Birbirinden farklı iki kullanıcı arasında mesajlar
        for ($i = 0; $i < 120; $i++) {
            [$senderId, $receiverId] = $userIds->random(2)->values()->all();
            Message::factory()->create([
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
            ]);
        }
    }
}