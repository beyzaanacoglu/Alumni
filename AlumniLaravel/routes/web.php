<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\FeedPostController;
use App\Http\Controllers\JobPostingController;
use App\Http\Controllers\ScholarshipController;
use App\Http\Controllers\WorkExperienceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Mezun Takip Sistemi
|--------------------------------------------------------------------------
| RESTful standartlarına uygun direct (doğrudan) ve nested (içe içe)
| route tanımları ile rol tabanlı yetkilendirme grupları.
|
| Rol Hiyerarşisi:
|  - admin: Tam sistem yönetimi
|  - alumni: Duyuru ve ilan yayınlama, mezun profili
|  - company: Şirket temsili ve kariyer/staj ilanı yönetimi
|  - student: İlanları inceleme ve dahili başvuru
|--------------------------------------------------------------------------
*/

// Ana Sayfa Yönlendirmesi
Route::get('/', fn () => redirect()->route('announcements.index'))->name('home');

/*
|--------------------------------------------------------------------------
| 1. DIRECT ROUTES (Doğrudan Temel Kaynaklar)
|--------------------------------------------------------------------------
| Standart RESTful Route::resource tanımları (Public / Ziyaretçi Erişimli)
*/

// Duyurular: /announcements
Route::resource('announcements', AnnouncementController::class);

// Sosyal Akış: /feed-posts
Route::resource('feed-posts', FeedPostController::class)
    ->parameters(['feed-posts' => 'feed_post']);

// İş/Staj Haritası ve Deneyimleri: /work-experiences
Route::resource('work-experiences', WorkExperienceController::class)
    ->parameters(['work-experiences' => 'work_experience']);

// İş ve Staj İlanları: /job-postings (ve RESTful kısa takma ad /jobs)
Route::resource('job-postings', JobPostingController::class)
    ->parameters(['job-postings' => 'job_posting']);
Route::get('jobs', [JobPostingController::class, 'index'])->name('jobs.index');
Route::get('jobs/{job_posting}', [JobPostingController::class, 'show'])->name('jobs.show');

// Burs İlanları ve Duyuruları: /scholarships
Route::resource('scholarships', ScholarshipController::class);

/*
|--------------------------------------------------------------------------
| 2. NESTED ROUTES (İçe İçe / İlişkili Kaynaklar)
|--------------------------------------------------------------------------
| Hiyerarşik veri yapıları:
|  - /job-postings/{job_posting}/applications (Bir ilana ait başvurular)
|  - /scholarships/{scholarship}/applications (Bir bursa ait başvurular)
|  - /companies/{company}/jobs (Bir şirkete ait açık iş ilanları)
*/

// İlan Başvuruları (Nested: /job-postings/{job_posting}/...)
Route::prefix('job-postings/{job_posting}')->as('job-postings.')->group(function () {
    // Adayın ilana başvurması
    Route::post('apply', [JobPostingController::class, 'apply'])
        ->name('apply');

    // Başvuruların yönetimi (Nested Resource endpoints)
    Route::prefix('applications/{application}')->as('applications.')->group(function () {
        Route::patch('/', [JobPostingController::class, 'updateApplication'])->name('update');
        Route::delete('/', [JobPostingController::class, 'destroyApplication'])->name('destroy');
    });
});

// RESTful nested aliases: /jobs/{job_posting}/apply ve /jobs/{job_posting}/applications
Route::post('jobs/{job_posting}/apply', [JobPostingController::class, 'apply'])
    ->name('jobs.apply');
Route::get('jobs/{job_posting}/applications', function (\App\Models\JobPosting $job_posting) {
    abort_unless(auth()->user()->isAdmin() || auth()->user()->id === $job_posting->user_id, 403);
    return response()->json($job_posting->applications()->with('user')->latest()->get());
})->name('jobs.applications.index')->middleware(['auth', 'role:alumni,company,admin']);

// Burs Başvuruları (Nested: /scholarships/{scholarship}/...)
Route::prefix('scholarships/{scholarship}')->as('scholarships.')->group(function () {
    Route::post('apply', [ScholarshipController::class, 'apply'])->name('apply');
    Route::get('applications', [ScholarshipController::class, 'applications'])->name('applications.index');
});

/*
|--------------------------------------------------------------------------
| 3. ROLE-BASED PROTECTED ROUTE GROUPS (Rol Tabanlı Yetkilendirme)
|--------------------------------------------------------------------------
| auth ve role middleware'leri ile korunan rota grupları.
| Örnek: role:admin | role:alumni,company,admin | role:student,alumni,admin
*/

Route::middleware(['auth'])->group(function () {

    // A) Öğrenci & Mezun Grubu: İlanlara Başvuru ve Kendi Profilini/Başvurularını Yönetme
    Route::middleware(['role:student,alumni,admin'])->group(function () {
        // Direct route: /my-applications (Doğrudan Başvurularım Uç Noktası)
        Route::get('my-applications', fn () => 'Başvurularım')->name('my-applications');

        Route::prefix('my')->as('my.')->group(function () {
            Route::get('applications', fn () => 'Başvurularım')->name('applications');
            Route::get('profile', fn () => 'Profilim')->name('profile');
        });
    });

    // B) Mezun & Şirket Grubu: Yeni İlan ve Duyuru Oluşturma / Başvuruları İnceleme
    Route::middleware(['role:alumni,company,admin'])->group(function () {
        Route::get('my/published-jobs', fn () => 'Yayınladığım İlanlar')->name('my.jobs');
        Route::get('my/company', fn () => 'Şirket Profilim')->name('my.company');
    });

    // C) Yönetici (Admin) Grubu: Sistem ve Rol Yönetimi
    Route::middleware(['role:admin'])->prefix('admin')->as('admin.')->group(function () {
        Route::get('/', fn () => 'Admin Kontrol Paneli')->name('dashboard');
        Route::get('roles', fn () => 'Rol ve Yetki Yönetimi')->name('roles.index');
        Route::get('users', fn () => 'Kullanıcı Yönetimi')->name('users.index');
        Route::get('companies', fn () => 'Onay Bekleyen Şirketler')->name('companies.index');
    });
});