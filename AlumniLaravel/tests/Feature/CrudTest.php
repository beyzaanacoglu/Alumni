<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\FeedPost;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * Mevcut MySQL veritabanında çalışır; her test sonunda yapılan değişiklikleri geri alır.
 */
class CrudTest extends TestCase
{
    use DatabaseTransactions;

    public function test_all_pages_render(): void
    {
        $alumni = User::factory()->create(['role' => 'alumni']);
        $a = Announcement::factory()->create(['user_id' => $alumni->id]);
        $p = FeedPost::factory()->create(['user_id' => $alumni->id]);
        $w = WorkExperience::factory()->create(['user_id' => $alumni->id]);
        $j = JobPosting::factory()->create(['user_id' => $alumni->id]);

        foreach ([
            '/announcements', '/announcements/create', "/announcements/{$a->id}", "/announcements/{$a->id}/edit",
            '/feed-posts', '/feed-posts/create', "/feed-posts/{$p->id}", "/feed-posts/{$p->id}/edit",
            '/work-experiences', '/work-experiences/create', "/work-experiences/{$w->id}", "/work-experiences/{$w->id}/edit",
            '/job-postings', '/job-postings/create', "/job-postings/{$j->id}", "/job-postings/{$j->id}/edit",
        ] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_announcement_crud_and_validation(): void
    {
        $alumni = User::factory()->create(['role' => 'alumni']);
        $student = User::factory()->create(['role' => 'student']);

        $this->post('/announcements', ['user_id' => $alumni->id, 'title' => '', 'content' => 'x'])
            ->assertSessionHasErrors('title');
        $this->post('/announcements', ['user_id' => $student->id, 'title' => 'Geçerli başlık', 'content' => 'İçerik'])
            ->assertSessionHasErrors('user_id');

        $this->post('/announcements', ['user_id' => $alumni->id, 'title' => 'Geçerli başlık', 'content' => 'İçerik'])
            ->assertRedirect('/announcements');
        $a = Announcement::where('title', 'Geçerli başlık')->firstOrFail();

        $this->put("/announcements/{$a->id}", ['user_id' => $alumni->id, 'title' => 'Yeni başlık', 'content' => 'İçerik'])
            ->assertRedirect();
        $this->assertDatabaseHas('announcements', ['id' => $a->id, 'title' => 'Yeni başlık']);

        $this->delete("/announcements/{$a->id}")->assertRedirect('/announcements');
        $this->assertDatabaseMissing('announcements', ['id' => $a->id]);
    }

    public function test_feed_post_crud(): void
    {
        $u = User::factory()->create();
        $this->post('/feed-posts', ['user_id' => $u->id, 'body' => ''])->assertSessionHasErrors('body');
        $this->post('/feed-posts', ['user_id' => $u->id, 'body' => 'Merhaba dünya', 'image_path' => 'https://picsum.photos/800/450'])
            ->assertRedirect('/feed-posts');
        $p = FeedPost::where('body', 'Merhaba dünya')->firstOrFail();
        $this->put("/feed-posts/{$p->id}", ['user_id' => $u->id, 'body' => 'Güncel'])->assertRedirect();
        $this->assertDatabaseHas('feed_posts', ['id' => $p->id, 'body' => 'Güncel']);
        $this->delete("/feed-posts/{$p->id}")->assertRedirect('/feed-posts');
        $this->assertDatabaseMissing('feed_posts', ['id' => $p->id]);
    }

    public function test_work_experience_crud_and_coordinate_validation(): void
    {
        $u = User::factory()->create();
        $base = ['user_id' => $u->id, 'company' => 'Test A.Ş.', 'position' => 'Analist'];

        $this->post('/work-experiences', $base + ['latitude' => 'abc', 'longitude' => '28.9'])->assertSessionHasErrors('latitude');
        $this->post('/work-experiences', $base + ['latitude' => '91.5', 'longitude' => '28.9'])->assertSessionHasErrors('latitude');
        $this->post('/work-experiences', $base + ['latitude' => '41.1', 'longitude' => '181'])->assertSessionHasErrors('longitude');
        $this->post('/work-experiences', $base + ['latitude' => '41.123456789', 'longitude' => '28.9'])->assertSessionHasErrors('latitude');

        $this->post('/work-experiences', $base + ['latitude' => '41.01384', 'longitude' => '28.94966'])
            ->assertRedirect('/work-experiences');
        $w = WorkExperience::where('company', 'Test A.Ş.')->firstOrFail();
        $this->put("/work-experiences/{$w->id}", $base + ['latitude' => '39.9334', 'longitude' => '32.8597'])->assertRedirect();
        $this->assertDatabaseHas('work_experiences', ['id' => $w->id, 'latitude' => '39.93340000']);
        $this->delete("/work-experiences/{$w->id}")->assertRedirect('/work-experiences');
        $this->assertDatabaseMissing('work_experiences', ['id' => $w->id]);
    }

    public function test_job_posting_crud_and_applications(): void
    {
        $alumni = User::factory()->create(['role' => 'alumni']);
        $student = User::factory()->create(['role' => 'student']);

        $this->post('/job-postings', [
            'user_id' => $student->id,
            'title' => 'Stajyer',
            'description' => 'Açıklama',
            'company_name' => 'Trendyol',
            'employment_type' => 'internship',
            'work_mode' => 'onsite',
            'status' => 'open',
        ])->assertSessionHasErrors('user_id');

        $this->post('/job-postings', [
            'user_id' => $alumni->id,
            'title' => 'Junior Developer',
            'description' => 'Detaylı açıklama',
            'company_name' => 'Trendyol',
            'employment_type' => 'full_time',
            'work_mode' => 'hybrid',
            'status' => 'open',
        ])->assertRedirect('/job-postings');

        $posting = JobPosting::where('title', 'Junior Developer')->firstOrFail();

        $this->post("/job-postings/{$posting->id}/apply", [
            'user_id' => $student->id,
            'cover_letter' => 'Ön yazı metnim',
        ])->assertRedirect("/job-postings/{$posting->id}");

        $this->assertDatabaseHas('job_applications', [
            'job_posting_id' => $posting->id,
            'user_id' => $student->id,
            'status' => 'submitted',
        ]);

        $this->delete("/job-postings/{$posting->id}")->assertRedirect('/job-postings');
        $this->assertDatabaseMissing('job_postings', ['id' => $posting->id]);
    }
}