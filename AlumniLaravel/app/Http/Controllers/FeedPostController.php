<?php

namespace App\Http\Controllers;

use App\Models\FeedPost;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class FeedPostController extends Controller
{
    public function index(): View
    {
        $posts = FeedPost::with('user')->latest()->paginate(9);

        return view('feed_posts.index', compact('posts'));
    }

    public function create(): View
    {
        return view('feed_posts.create', ['users' => $this->users()]);
    }

    public function store(Request $request): RedirectResponse
    {
        FeedPost::create($this->validated($request));

        return redirect()->route('feed-posts.index')->with('success', 'Gönderi paylaşıldı.');
    }

    public function show(FeedPost $feed_post): View
    {
        $feed_post->load('user');

        return view('feed_posts.show', ['post' => $feed_post]);
    }

    public function edit(FeedPost $feed_post): View
    {
        return view('feed_posts.edit', ['post' => $feed_post, 'users' => $this->users()]);
    }

    public function update(Request $request, FeedPost $feed_post): RedirectResponse
    {
        $feed_post->update($this->validated($request));

        return redirect()->route('feed-posts.show', $feed_post)->with('success', 'Gönderi güncellendi.');
    }

    public function destroy(FeedPost $feed_post): RedirectResponse
    {
        $feed_post->delete();

        return redirect()->route('feed-posts.index')->with('success', 'Gönderi silindi.');
    }

    private function users()
    {
        return User::orderBy('name')->get(['id', 'name']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'body' => ['required', 'string', 'min:2', 'max:5000'],
            'image_path' => ['nullable', 'url', 'max:255'],
        ]);
    }
}