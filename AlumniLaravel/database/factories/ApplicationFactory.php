<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        $type = fake()->randomElement(Application::ALL_TYPES);

        $coverLetters = [
            Application::TYPE_JOB => [
                'Merhaba, ilanınızda belirtilen yetkinlikler yazılım geliştirme alanındaki kariyer hedeflerimle birebir örtüşüyor. Ekibinize katılarak katma değer sağlamak isterim.',
                'Sayın Yetkili, üniversitemde aldığım temel bilgisayar mühendisliği eğitimi ve kişisel projelerimde edindiğim deneyimle pozisyona katkı sunabileceğime inanıyorum.',
                'İlanınızı ilgiyle inceledim. Modern web teknolojileriyle geliştirdiğim projeler portfolyomda yer almaktadır; detayları mülakatta aktarmaktan mutluluk duyarım.',
            ],
            Application::TYPE_INTERNSHIP => [
                'Merhaba, üniversitemin zorunlu yaz stajı kapsamında şirketinizin dinamik ekibinde stajyer mühendis olarak yer almak ve kendimi geliştirmek istiyorum.',
                'Sayın İlgili, lisans eğitimimin son sınıfında uzun dönem staj imkanından yararlanarak gerçek dünya projelerinde aktif rol üstlenmek istiyorum.',
                'Merhaba, staj programınızın genç yeteneklere sunduğu mentorluk fırsatları beni çok heyecanlandırdı. Başvurumu değerlendirmenizi rica ederim.',
            ],
            Application::TYPE_VOLUNTEER => [
                'Merhaba, mezunlarımızın başlattığı bu açık kaynak gönüllü topluluk projesine kodlama ve test süreçlerinde gönüllü olarak destek vermek istiyorum.',
                'Topluluğumuza katkı sağlayacak bu sosyal sorumluluk projesinde gönüllü görev almaktan gurur duyarım.',
            ],
            Application::TYPE_PROJECT => [
                'Merhaba, paylaştığınız mezun projesinin gereksinimlerini inceledim. Mimari tasarım ve veri tabanı modelleme kısımlarında projeye destek olmak istiyorum.',
                'Geliştirilen bu yeni araştırma ve geliştirme projesinde gönüllü araştırmacı/geliştirici olarak yer almak istiyorum.',
            ],
        ];

        return [
            'job_posting_id' => JobPosting::factory(),
            'user_id' => User::factory(['role' => 'student']),
            'type' => $type,
            'cover_letter' => fake()->boolean(80) ? fake()->randomElement($coverLetters[$type]) : null,
            'status' => fake()->randomElement(Application::ALL_STATUSES),
        ];
    }

    public function job(): static
    {
        return $this->state(fn () => ['type' => Application::TYPE_JOB]);
    }

    public function internship(): static
    {
        return $this->state(fn () => ['type' => Application::TYPE_INTERNSHIP]);
    }

    public function volunteer(): static
    {
        return $this->state(fn () => ['type' => Application::TYPE_VOLUNTEER]);
    }

    public function project(): static
    {
        return $this->state(fn () => ['type' => Application::TYPE_PROJECT]);
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => Application::STATUS_PENDING]);
    }

    public function accepted(): static
    {
        return $this->state(fn () => ['status' => Application::STATUS_ACCEPTED]);
    }
}
