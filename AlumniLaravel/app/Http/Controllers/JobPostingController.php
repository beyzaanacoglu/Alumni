<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class JobPostingController extends Controller
{
    public function index(): View
    {
        $jobPostings = JobPosting::with(['user', 'company'])->latest()->paginate(10);

        return view('job_postings.index', compact('jobPostings'));
    }

    public function create(): View
    {
        return view('job_postings.create', [
            'authors' => $this->authors(),
            'companies' => Company::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        JobPosting::create($this->validated($request));

        return redirect()->route('job-postings.index')->with('success', 'Ilan yayinlandi.');
    }

    public function show(JobPosting $job_posting): View
    {
        $job_posting->load('user')->loadCount('applications');

        return view('job_postings.show', [
            'jobPosting' => $job_posting,
            'applicants' => $this->applicants(),
        ]);
    }

    public function edit(JobPosting $job_posting): View
    {
        return view('job_postings.edit', [
            'jobPosting' => $job_posting,
            'authors' => $this->authors(),
            'companies' => Company::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, JobPosting $job_posting): RedirectResponse
    {
        $job_posting->update($this->validated($request));

        return redirect()->route('job-postings.show', $job_posting)->with('success', 'Ilan guncellendi.');
    }

    public function destroy(JobPosting $job_posting): RedirectResponse
    {
        $job_posting->delete();

        return redirect()->route('job-postings.index')->with('success', 'Ilan silindi.');
    }

    /**
     * Apply to a posting. External postings redirect to the external link;
     * internal postings (no link) are tracked in job_applications.
     */
    public function apply(Request $request, JobPosting $job_posting): RedirectResponse
    {
        if (! $job_posting->usesInternalApplications()) {
            return redirect()->away($job_posting->external_application_link);
        }

        if (! $job_posting->isAcceptingApplications()) {
            return back()->withErrors(['application' => 'Bu ilan basvuruya kapali.']);
        }

        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
            'type' => ['nullable', Rule::in(Application::ALL_TYPES)],
        ]);

        if ($job_posting->applications()->where('user_id', $data['user_id'])->exists()) {
            return back()->withErrors(['user_id' => 'Bu kullanici zaten basvurdu.'])->withInput();
        }

        // Automatic type mapping based on the posting if not explicitly submitted
        $data['type'] = $data['type'] ?? match ($job_posting->employment_type) {
            'internship' => Application::TYPE_INTERNSHIP,
            'volunteer' => Application::TYPE_VOLUNTEER,
            'project' => Application::TYPE_PROJECT,
            default => Application::TYPE_JOB,
        };

        $job_posting->applications()->create($data);

        return redirect()->route('job-postings.show', $job_posting)->with('success', 'Basvurunuz alindi.');
    }

    public function updateApplication(Request $request, JobPosting $job_posting, Application $application): RedirectResponse
    {
        abort_unless($application->job_posting_id === $job_posting->id, 404);

        $data = $request->validate([
            'status' => ['required', Rule::in(Application::ALL_STATUSES)],
        ]);
        $application->update($data);

        return back()->with('success', 'Basvuru durumu guncellendi.');
    }

    public function destroyApplication(JobPosting $job_posting, Application $application): RedirectResponse
    {
        abort_unless($application->job_posting_id === $job_posting->id, 404);
        $application->delete();

        return back()->with('success', 'Basvuru silindi.');
    }

    private function authors()
    {
        return User::whereIn('role', [Role::ALUMNI, Role::COMPANY, Role::ADMIN])
            ->orWhereHas('roles', fn ($q) => $q->whereIn('name', [Role::ALUMNI, Role::COMPANY, Role::ADMIN]))
            ->distinct()
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function applicants()
    {
        return User::orderBy('name')->get(['id', 'name']);
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = User::find($value);
                    if (! $user || ! $user->hasRole([Role::ALUMNI, Role::COMPANY, Role::ADMIN])) {
                        $fail('İlanı yalnızca mezun, şirket temsilcisi veya yönetici kullanıcılar yayınlayabilir.');
                    }
                },
            ],
            'company_id' => ['nullable', 'exists:companies,id'],
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'company_name' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'size:2'],
            'employment_type' => ['required', Rule::in(['full_time', 'part_time', 'internship', 'volunteer', 'project', 'contract'])],
            'work_mode' => ['required', Rule::in(['onsite', 'remote', 'hybrid'])],
            'experience_level' => ['nullable', Rule::in(['entry', 'mid', 'senior'])],
            'required_skills' => ['nullable', 'string', 'max:2000'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'external_application_link' => ['nullable', 'url', 'max:500'],
            'application_deadline' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['open', 'closed'])],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'decimal:0,8'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'decimal:0,8'],
        ]);

        return $validated;
    }
}
