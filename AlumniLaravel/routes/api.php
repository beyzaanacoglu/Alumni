<?php

use App\Models\Application;
use App\Models\Company;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Mezun Takip Sistemi RESTful API
|--------------------------------------------------------------------------
| RESTful standartlarına uygun JSON uç noktaları:
|  - Direct Routes: /api/jobs, /api/scholarships, /api/alumni, /api/companies
|  - Nested Routes: /api/jobs/{job}/applications, /api/scholarships/{scholarship}/applications
|  - Role Middleware: role:admin, role:alumni, role:company, role:student
|--------------------------------------------------------------------------
*/

Route::as('api.')->group(function () {

    /*
    |----------------------------------------------------------------------
    | 1. PUBLIC DIRECT ROUTES (Herkesin Erişebileceği Açık Uç Noktalar)
    |----------------------------------------------------------------------
    */

    // İlan Listesi ve İlan Detayı: GET /api/jobs, GET /api/jobs/{job}
    Route::get('jobs', function (Request $request) {
        return JobPosting::with(['user:id,name,email', 'company:id,name,industry'])
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('employment_type'), fn ($q, $t) => $q->where('employment_type', $t))
            ->when($request->query('city'), fn ($q, $c) => $q->where('city', $c))
            ->latest()
            ->paginate(15);
    })->name('jobs.index');

    Route::get('jobs/{job}', function (JobPosting $job) {
        return $job->load(['user:id,name,email', 'company'])->loadCount('applications');
    })->name('jobs.show');

    // Burs Listesi ve Burs Detayı: GET /api/scholarships, GET /api/scholarships/{scholarship}
    Route::get('scholarships', function (Request $request) {
        return Scholarship::when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('internal') === '1', fn ($q) => $q->internal())
            ->latest()
            ->paginate(15)
            ->through(function ($scholarship) {
                return [
                    'id' => $scholarship->id,
                    'title' => $scholarship->title,
                    'description' => $scholarship->description,
                    'donor_display_name' => $scholarship->donor_display_name,
                    'is_anonymous' => $scholarship->is_anonymous,
                    'amount' => $scholarship->amount,
                    'currency' => $scholarship->currency,
                    'duration' => $scholarship->duration,
                    'quota' => $scholarship->quota,
                    'requirements' => $scholarship->requirements,
                    'external_application_link' => $scholarship->external_application_link,
                    'is_external' => ! $scholarship->usesInternalApplications(),
                    'application_deadline' => $scholarship->application_deadline,
                    'status' => $scholarship->status,
                    'created_at' => $scholarship->created_at,
                ];
            });
    })->name('scholarships.index');

    Route::get('scholarships/{scholarship}', function (Scholarship $scholarship) {
        return response()->json([
            'id' => $scholarship->id,
            'title' => $scholarship->title,
            'description' => $scholarship->description,
            'donor_display_name' => $scholarship->donor_display_name,
            'is_anonymous' => $scholarship->is_anonymous,
            'amount' => $scholarship->amount,
            'currency' => $scholarship->currency,
            'duration' => $scholarship->duration,
            'quota' => $scholarship->quota,
            'requirements' => $scholarship->requirements,
            'contact_email' => $scholarship->contact_email,
            'external_application_link' => $scholarship->external_application_link,
            'is_external' => ! $scholarship->usesInternalApplications(),
            'application_deadline' => $scholarship->application_deadline,
            'status' => $scholarship->status,
            'applications_count' => $scholarship->applications()->count(),
            'created_at' => $scholarship->created_at,
        ]);
    })->name('scholarships.show');

    // Mezunlar Rehberi: GET /api/alumni, GET /api/alumni/{user}
    Route::get('alumni', function (Request $request) {
        return User::where('role', 'alumni')
            ->with(['profile', 'workExperiences'])
            ->paginate(15);
    })->name('alumni.index');

    Route::get('alumni/{user}', function (User $user) {
        abort_unless($user->isAlumni(), 404, 'Alumni not found.');
        return $user->load(['profile', 'workExperiences']);
    })->name('alumni.show');

    // Şirketler Listesi: GET /api/companies, GET /api/companies/{company}
    Route::get('companies', function () {
        return Company::withCount('jobPostings')->paginate(15);
    })->name('companies.index');

    Route::get('companies/{company}', function (Company $company) {
        return $company->loadCount('jobPostings');
    })->name('companies.show');

    /*
    |----------------------------------------------------------------------
    | 2. PUBLIC NESTED ROUTES (Hiyerarşik / İlişkili Uç Noktalar)
    |----------------------------------------------------------------------
    */

    // Belirli bir şirkete ait iş ilanları: GET /api/companies/{company}/jobs
    Route::get('companies/{company}/jobs', function (Company $company) {
        return $company->jobPostings()->with('user:id,name')->latest()->paginate(10);
    })->name('companies.jobs.index');

    // Belirli bir mezunun iş deneyimleri: GET /api/alumni/{user}/experiences
    Route::get('alumni/{user}/experiences', function (User $user) {
        abort_unless($user->isAlumni(), 404);
        return $user->workExperiences()->latest()->get();
    })->name('alumni.experiences.index');

    // Belirli bir kullanıcının veya mezunun yayınladığı iş ilanları: GET /api/users/{user}/jobs, GET /api/alumni/{user}/jobs
    Route::get('users/{user}/jobs', function (User $user) {
        return $user->jobPostings()
            ->with(['company:id,name,industry'])
            ->latest()
            ->paginate(10);
    })->name('users.jobs.index');

    Route::get('alumni/{user}/jobs', function (User $user) {
        abort_unless($user->isAlumni(), 404, 'Alumni not found.');
        return $user->jobPostings()
            ->with(['company:id,name,industry'])
            ->latest()
            ->paginate(10);
    })->name('alumni.jobs.index');

    /*
    |----------------------------------------------------------------------
    | 3. PROTECTED ROUTES & ROLE-BASED GROUPS (Yetkilendirme Grupları)
    |----------------------------------------------------------------------
    */

    Route::middleware(['auth:sanctum'])->group(function () {

        // A) Mevcut Giriş Yapmış Kullanıcı Bilgisi
        Route::get('user', fn (Request $request) => $request->user()->load('roles'))->name('user');

        // B) Öğrenci ve Mezunlar: İlan Başvurusu Yapma (Nested: POST /api/jobs/{job}/applications)
        Route::middleware(['role:student,alumni,admin'])->group(function () {
            Route::post('jobs/{job}/applications', function (Request $request, JobPosting $job) {
                if (! $job->usesInternalApplications() || ! $job->isAcceptingApplications()) {
                    return response()->json(['error' => 'This job posting does not accept internal applications.'], 400);
                }

                $validated = $request->validate([
                    'cover_letter' => ['nullable', 'string', 'max:5000'],
                    'type' => ['nullable', 'in:job,internship,volunteer,project'],
                ]);

                if ($job->applications()->where('user_id', $request->user()->id)->exists()) {
                    return response()->json(['error' => 'You have already applied for this position.'], 409);
                }

                $type = $validated['type'] ?? match ($job->employment_type) {
                    'internship' => Application::TYPE_INTERNSHIP,
                    'volunteer' => Application::TYPE_VOLUNTEER,
                    'project' => Application::TYPE_PROJECT,
                    default => Application::TYPE_JOB,
                };

                $application = $job->applications()->create([
                    'user_id' => $request->user()->id,
                    'type' => $type,
                    'cover_letter' => $validated['cover_letter'] ?? null,
                ]);

                return response()->json($application, 201);
            })->name('jobs.applications.store');

            // Burs Başvurusu Yapma (Nested: POST /api/scholarships/{scholarship}/applications)
            Route::post('scholarships/{scholarship}/applications', function (Request $request, Scholarship $scholarship) {
                if (! $scholarship->usesInternalApplications() || ! $scholarship->isAcceptingApplications()) {
                    return response()->json(['error' => 'This scholarship does not accept internal applications.'], 400);
                }

                $validated = $request->validate([
                    'cover_letter' => ['nullable', 'string', 'max:5000'],
                ]);

                if ($scholarship->applications()->where('user_id', $request->user()->id)->exists()) {
                    return response()->json(['error' => 'You have already applied for this scholarship.'], 409);
                }

                $application = $scholarship->applications()->create([
                    'user_id' => $request->user()->id,
                    'type' => Application::TYPE_SCHOLARSHIP,
                    'cover_letter' => $validated['cover_letter'] ?? null,
                ]);

                return response()->json($application, 201);
            })->name('scholarships.applications.store');

            // Kullanıcının kendi başvuruları (Direct Routes: /api/my-applications ve /api/my/applications)
            Route::get('my-applications', function (Request $request) {
                return $request->user()->applications()->with(['jobPosting', 'scholarship'])->latest()->get();
            })->name('my-applications');

            Route::get('my/applications', function (Request $request) {
                return $request->user()->applications()->with(['jobPosting', 'scholarship'])->latest()->get();
            })->name('my.applications');
        });

        // C) Mezun ve Şirket Temsilcileri: İlan ve Burs Yönetimi & Başvuru İnceleme
        Route::middleware(['role:alumni,company,admin'])->group(function () {
            // İlan Oluşturma: POST /api/jobs
            Route::post('jobs', function (Request $request) {
                $validated = $request->validate([
                    'title' => ['required', 'string', 'max:255'],
                    'description' => ['required', 'string'],
                    'company_name' => ['required', 'string', 'max:255'],
                    'company_id' => ['nullable', 'exists:companies,id'],
                    'employment_type' => ['required', 'in:full_time,part_time,internship,volunteer,project,contract'],
                    'work_mode' => ['required', 'in:onsite,remote,hybrid'],
                    'city' => ['nullable', 'string'],
                    'application_deadline' => ['nullable', 'date'],
                    'status' => ['nullable', 'in:open,closed'],
                ]);

                $job = $request->user()->jobPostings()->create($validated);
                return response()->json($job, 201);
            })->name('jobs.store');

            // Belirli bir kullanıcı adına ilan oluşturma: POST /api/users/{user}/jobs (Nested)
            Route::post('users/{user}/jobs', function (Request $request, User $user) {
                abort_unless($user->id === $request->user()->id || $request->user()->isAdmin(), 403);

                $validated = $request->validate([
                    'title' => ['required', 'string', 'max:255'],
                    'description' => ['required', 'string'],
                    'company_name' => ['required', 'string', 'max:255'],
                    'company_id' => ['nullable', 'exists:companies,id'],
                    'employment_type' => ['required', 'in:full_time,part_time,internship,volunteer,project,contract'],
                    'work_mode' => ['required', 'in:onsite,remote,hybrid'],
                    'city' => ['nullable', 'string'],
                    'application_deadline' => ['nullable', 'date'],
                    'status' => ['nullable', 'in:open,closed'],
                ]);

                $job = $user->jobPostings()->create($validated);
                return response()->json($job, 201);
            })->name('users.jobs.store');

            // İlan Güncelleme & Silme
            Route::match(['put', 'patch'], 'jobs/{job}', function (Request $request, JobPosting $job) {
                abort_unless($job->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                $job->update($request->all());
                return response()->json($job);
            })->name('jobs.update');

            Route::delete('jobs/{job}', function (Request $request, JobPosting $job) {
                abort_unless($job->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                $job->delete();
                return response()->noContent();
            })->name('jobs.destroy');

            // Nested: İlana Gelen Başvuruları Listeleme & Durum Güncelleme
            Route::get('jobs/{job}/applications', function (Request $request, JobPosting $job) {
                abort_unless($job->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                return $job->applications()->with('user:id,name,email')->latest()->get();
            })->name('jobs.applications.index');

            Route::patch('jobs/{job}/applications/{application}', function (Request $request, JobPosting $job, Application $application) {
                abort_unless($job->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                abort_unless($application->job_posting_id === $job->id, 404);

                $validated = $request->validate([
                    'status' => ['required', 'in:pending,submitted,reviewing,accepted,rejected'],
                ]);
                $application->update($validated);
                return response()->json($application);
            })->name('jobs.applications.update');

            // Burs Oluşturma: POST /api/scholarships
            Route::post('scholarships', function (Request $request) {
                $validated = $request->validate([
                    'title' => ['required', 'string', 'max:255'],
                    'description' => ['required', 'string'],
                    'donor_name' => ['nullable', 'string', 'max:255'],
                    'is_anonymous' => ['nullable', 'boolean'],
                    'amount' => ['nullable', 'numeric', 'min:0'],
                    'currency' => ['nullable', 'string', 'size:3'],
                    'duration' => ['nullable', 'string', 'max:100'],
                    'quota' => ['nullable', 'integer', 'min:1'],
                    'requirements' => ['nullable', 'string'],
                    'contact_email' => ['nullable', 'email'],
                    'external_application_link' => ['nullable', 'url', 'max:500'],
                    'application_deadline' => ['nullable', 'date'],
                    'status' => ['nullable', 'in:open,closed'],
                ]);

                $scholarship = $request->user()->fundedScholarships()->create($validated);
                return response()->json($scholarship, 201);
            })->name('scholarships.store');

            // Burs Güncelleme & Silme
            Route::match(['put', 'patch'], 'scholarships/{scholarship}', function (Request $request, Scholarship $scholarship) {
                abort_unless($scholarship->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                $scholarship->update($request->all());
                return response()->json($scholarship);
            })->name('scholarships.update');

            Route::delete('scholarships/{scholarship}', function (Request $request, Scholarship $scholarship) {
                abort_unless($scholarship->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                $scholarship->delete();
                return response()->noContent();
            })->name('scholarships.destroy');

            // Nested: Bursa Gelen Başvuruları Listeleme & Durum Güncelleme
            Route::get('scholarships/{scholarship}/applications', function (Request $request, Scholarship $scholarship) {
                abort_unless($scholarship->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                return $scholarship->applications()->with('user:id,name,email')->latest()->get();
            })->name('scholarships.applications.index');

            Route::patch('scholarships/{scholarship}/applications/{application}', function (Request $request, Scholarship $scholarship, Application $application) {
                abort_unless($scholarship->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
                abort_unless($application->scholarship_id === $scholarship->id, 404);

                $validated = $request->validate([
                    'status' => ['required', 'in:pending,submitted,reviewing,accepted,rejected'],
                ]);
                $application->update($validated);
                return response()->json($application);
            })->name('scholarships.applications.update');
        });

        // D) Sistem Yöneticisi (Admin) Özel Uç Noktaları
        Route::middleware(['role:admin'])->prefix('admin')->as('admin.')->group(function () {
            Route::get('stats', fn () => [
                'users_count' => User::count(),
                'jobs_count' => JobPosting::count(),
                'applications_count' => JobApplication::count(),
                'companies_count' => Company::count(),
            ])->name('stats');
        });
    });
});
