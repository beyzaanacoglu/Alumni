<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class AnnouncementController extends Controller
{
    public function index(): View
    {
        $announcements = Announcement::with('user')->latest()->paginate(10);

        return view('announcements.index', compact('announcements'));
    }

    public function create(): View
    {
        return view('announcements.create', ['authors' => $this->authors()]);
    }

    public function store(Request $request): RedirectResponse
    {
        Announcement::create($this->validated($request));

        return redirect()->route('announcements.index')->with('success', 'Duyuru oluşturuldu.');
    }

    public function show(Announcement $announcement): View
    {
        $announcement->load('user');

        return view('announcements.show', compact('announcement'));
    }

    public function edit(Announcement $announcement): View
    {
        return view('announcements.edit', [
            'announcement' => $announcement,
            'authors' => $this->authors(),
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $announcement->update($this->validated($request));

        return redirect()->route('announcements.show', $announcement)->with('success', 'Duyuru güncellendi.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->route('announcements.index')->with('success', 'Duyuru silindi.');
    }

    /** Duyuruyu yalnızca mezunlar yayınlayabilir. */
    private function authors()
    {
        return User::where('role', 'alumni')->orderBy('name')->get(['id', 'name']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', Rule::exists('users', 'id')->where('role', 'alumni')],
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
            'company_name' => ['nullable', 'string', 'max:255'],
        ], [
            'user_id.exists' => 'Duyuruyu yalnızca mezun kullanıcılar yayınlayabilir.',
        ]);
    }
}