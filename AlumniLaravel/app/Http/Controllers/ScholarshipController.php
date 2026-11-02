<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Role;
use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class ScholarshipController extends Controller
{
    public function index(Request $request): View
    {
        $scholarships = Scholarship::with('user')
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('internal') === '1', fn ($q) => $q->internal())
            ->latest()
            ->paginate(10);

        return view('scholarships.index', compact('scholarships'));
    }

    public function create(): View
    {
        return view('scholarships.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $scholarship = Scholarship::create($validated);

        return redirect()->route('scholarships.index')->with('success', 'Burs ilanı başarıyla yayınlandı.');
    }

    public function show(Scholarship $scholarship): View
    {
        $scholarship->load('user')->loadCount('applications');

        return view('scholarships.show', compact('scholarship'));
    }

    public function edit(Scholarship $scholarship): View
    {
        return view('scholarships.edit', compact('scholarship'));
    }

    public function update(Request $request, Scholarship $scholarship): RedirectResponse
    {
        $validated = $this->validated($request);
        $scholarship->update($validated);

        return redirect()->route('scholarships.show', $scholarship)->with('success', 'Burs bilgileri güncellendi.');
    }

    public function destroy(Scholarship $scholarship): RedirectResponse
    {
        $scholarship->delete();

        return redirect()->route('scholarships.index')->with('success', 'Burs ilanı silindi.');
    }

    /**
     * Öğrencinin bursa başvurması.
     * Dış burs linki varsa oraya yönlendirir; yoksa sistem içi Application oluşturur.
     */
    public function apply(Request $request, Scholarship $scholarship): RedirectResponse
    {
        if (! $scholarship->usesInternalApplications()) {
            return redirect()->away($scholarship->external_application_link);
        }

        if (! $scholarship->isAcceptingApplications()) {
            return back()->withErrors(['application' => 'Bu burs başvurulara kapalıdır.']);
        }

        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
        ]);

        if ($scholarship->applications()->where('user_id', $data['user_id'])->exists()) {
            return back()->withErrors(['user_id' => 'Bu bursa daha önce başvurdunuz.'])->withInput();
        }

        $scholarship->applications()->create([
            'user_id' => $data['user_id'],
            'type' => Application::TYPE_SCHOLARSHIP,
            'cover_letter' => $data['cover_letter'] ?? null,
            'status' => Application::STATUS_PENDING,
        ]);

        return redirect()->route('scholarships.show', $scholarship)->with('success', 'Burs başvurunuz başarıyla alındı.');
    }

    /**
     * Burs veren mezunun veya yöneticinin gelen başvuruları incelemesi.
     */
    public function applications(Scholarship $scholarship): View
    {
        abort_unless(auth()->user()->isAdmin() || auth()->user()->id === $scholarship->user_id, 403);

        $applications = $scholarship->applications()->with('user.profile')->latest()->get();

        return view('scholarships.applications', compact('scholarship', 'applications'));
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = User::find($value);
                    if (! $user || ! $user->hasRole([Role::ALUMNI, Role::ADMIN, Role::COMPANY])) {
                        $fail('Burs ilanını yalnızca mezunlar, yöneticiler veya kurumsal hesaplar yayınlayabilir.');
                    }
                },
            ],
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'donor_name' => ['nullable', 'string', 'max:255'],
            'is_anonymous' => ['nullable', 'boolean'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'duration' => ['nullable', 'string', 'max:100'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'external_application_link' => ['nullable', 'url', 'max:500'],
            'application_deadline' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['open', 'closed'])],
        ]);
    }
}
