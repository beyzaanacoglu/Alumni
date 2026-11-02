<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        // Dahili başvuru kabul eden tüm ilanları bul
        $internalPostings = JobPosting::whereNull('external_application_link')->get();

        if ($internalPostings->isEmpty()) {
            return;
        }

        // Başvuru yapabilecek öğrenci ve mezun kullanıcılar
        $candidateUsers = User::whereIn('role', ['student', 'alumni'])->get();

        if ($candidateUsers->isEmpty()) {
            $candidateUsers = User::all();
        }

        $coverLetters = [
            Application::TYPE_JOB => [
                'Merhaba, ilanınızda yer alan teknik gereksinimler yazılım geliştirme alanındaki deneyimlerimle çok iyi örtüşüyor. Ekibinize katılarak hızlıca değer üretmek isterim.',
                'Sayın Yetkili, üniversitemde edindiğim mühendislik temeli ve geliştirdiğim modern web projeleriyle şirketinize katkı sağlamaktan onur duyarım.',
                'İlanınızı heyecanla inceledim; GitHub portfolyomdaki projelerimle pozisyona uygunluğumu aktarabileceğim bir ön görüşme rica ederim.',
            ],
            Application::TYPE_INTERNSHIP => [
                'Merhaba, zorunlu yaz stajım için şirketinizin alanında öncü mühendislik ekibinde yer almak ve pratik tecrübe edinmek istiyorum.',
                'Sayın İlgili, lisans son sınıf uzun dönem staj programınızda aktif görev alarak kurumsal yazılım süreçlerini deneyimlemek arzusundayım.',
                'Merhaba, teknolojiye olan tutkum ve öğrenme isteğimle stajyer olarak ekibinize dinamizm katacağıma inanıyorum.',
            ],
            Application::TYPE_VOLUNTEER => [
                'Merhaba, mezunlarımızın başlattığı bu açık kaynak gönüllü topluluk projesine kodlama ve mimari test süreçlerinde destek vermek istiyorum.',
                'Topluluğumuza katkı sağlayacak bu sosyal fayda odaklı çalışmada gönüllü olarak görev almaktan büyük mutluluk duyarım.',
            ],
            Application::TYPE_PROJECT => [
                'Merhaba, yayınlanan mezun projesinin veri tabanı ve arayüz entegrasyonu aşamalarında aktif rol almak istiyorum.',
                'Üniversitemizin araştırma ve inovasyon projesinde gönüllü proje asistanı olarak katkı sunmak istiyorum.',
            ],
        ];

        foreach ($internalPostings as $posting) {
            // İlan tipine göre başvuru türünü belirle
            $appType = match ($posting->employment_type) {
                'internship' => Application::TYPE_INTERNSHIP,
                'volunteer' => Application::TYPE_VOLUNTEER,
                'project' => Application::TYPE_PROJECT,
                default => Application::TYPE_JOB,
            };

            // İlan sahibi hariç adaylardan rastgele 2-4 aday seç
            $eligibleCandidates = $candidateUsers->reject(fn ($u) => $u->id === $posting->user_id);
            $selectedCandidates = $eligibleCandidates->random(min(fake()->numberBetween(2, 4), $eligibleCandidates->count()));

            foreach ($selectedCandidates as $candidate) {
                // Mükerrer başvuru kontrolü
                if (Application::where('job_posting_id', $posting->id)->where('user_id', $candidate->id)->exists()) {
                    continue;
                }

                $sampleLetters = $coverLetters[$appType] ?? $coverLetters[Application::TYPE_JOB];

                Application::create([
                    'job_posting_id' => $posting->id,
                    'user_id' => $candidate->id,
                    'type' => $appType,
                    'cover_letter' => fake()->boolean(85) ? fake()->randomElement($sampleLetters) : null,
                    'status' => fake()->randomElement(Application::ALL_STATUSES),
                ]);
            }
        }
    }
}
