@extends('layouts.app')
@section('title', 'Gönderi')
@section('content')
<div class="card">
    @if ($post->image_path)
        <img src="{{ $post->image_path }}" alt="Gönderi görseli" style="max-width:100%;border-radius:8px">
    @endif
    <p><strong>{{ $post->user->name }}</strong> <span class="muted">· {{ $post->created_at->format('d.m.Y H:i') }}</span></p>
    <p style="white-space:pre-line">{{ $post->body }}</p>
    <div class="actions">
        <a class="btn" href="{{ route('feed-posts.edit', $post) }}">Düzenle</a>
        <a class="btn secondary" href="{{ route('feed-posts.index') }}">Listeye Dön</a>
    </div>
</div>
@endsection