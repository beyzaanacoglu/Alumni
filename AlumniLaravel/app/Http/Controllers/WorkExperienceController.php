<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class WorkExperienceController extends Controller
{
    public function index(): View
    {
        $experiences = WorkExperience::with('user')->latest()->paginate(15);

        return view('work_experiences.index', compact('experiences'));
    }

    public function create(): View
    {
        return view('work_experiences.create', ['users' => $this->users()]);
    }

    public function store(Request $request): RedirectResponse
    {
        WorkExperience::create($this->validated($request));

        return redirect()->route('work-experiences.index')->with('success', 'İş deneyimi eklendi.');
    }

    public function show(WorkExperience $work_experience): View
    {
        $work_experience->load('user');

        return view('work_experiences.show', ['experience' => $work_experience]);
    }

    public function edit(WorkExperience $work_experience): View
    {
        return view('work_experiences.edit', ['experience' => $work_experience, 'users' => $this->users()]);
    }

    public function update(Request $request, WorkExperience $work_experience): RedirectResponse
    {
        $work_experience->update($this->validated($request));

        return redirect()->route('work-experiences.show', $work_experience)->with('success', 'İş deneyimi güncellendi.');
    }

    public function destroy(WorkExperience $work_experience): RedirectResponse
    {
        $work_experience->delete();

        return redirect()->route('work-experiences.index')->with('success', 'İş deneyimi silindi.');
    }

    private function users()
    {
        return User::orderBy('name')->get(['id', 'name']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'company' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            // decimal(10,8): -90..90, en fazla 8 ondalık basamak
            'latitude' => ['required', 'numeric', 'between:-90,90', 'regex:/^-?\d{1,2}(\.\d{1,8})?$/'],
            // decimal(11,8): -180..180, en fazla 8 ondalık basamak
            'longitude' => ['required', 'numeric', 'between:-180,180', 'regex:/^-?\d{1,3}(\.\d{1,8})?$/'],
        ], [
            'latitude.regex' => 'Enlem en fazla 8 ondalık basamaklı ondalık sayı olmalıdır (örn. 41.01384000).',
            'longitude.regex' => 'Boylam en fazla 8 ondalık basamaklı ondalık sayı olmalıdır (örn. 28.94966000).',
        ]);
    }
}