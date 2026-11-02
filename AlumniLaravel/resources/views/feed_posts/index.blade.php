@extends('layouts.app')
@section('title', 'Akış')
@section('content')
<div class="toolbar">
    <h1>Sosyal Akış</h1>
    <a class="btn" href="{{ route('feed-posts.create') }}">+ Yeni Gönderi</a>
</div>
<div class="grid">
    @forelse ($posts as $post)
        <div class="card">
            @if ($post->image_path)
                <img src="{{ $post->image_path }}" alt="Gönderi görseli" loading="lazy">
            @endif
            <strong>{{ $post->user->name }}</strong>
            <span class="muted"> · {{ $post->created_at->diffForHumans() }}</span>
            <p>{{ \Illuminate\Support\Str::limit($post->body, 140) }}</p>
            <div class="actions">
                <a class="btn secondary" href="{{ route('feed-posts.show', $post) }}">Aç</a>
                <a class="btn secondary" href="{{ route('feed-posts.edit', $post) }}">Düzenle</a>
                <form method="POST" action="{{ route('feed-posts.destroy', $post) }}" onsubmit="return confirm('Gönderi silinsin mi?')">
                    @csrf @method('DELETE')
                    <button class="btn danger">Sil</button>
                </form>
            </div>
        </div>
    @empty
        <p class="muted">Henüz gönderi yok.</p>
    @endforelse
</div>
{{ $posts->links('pagination::bootstrap-4') }}
@endsection