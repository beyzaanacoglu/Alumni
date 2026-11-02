@extends('layouts.app')
@section('title', $announcement->title)
@section('content')
<div class="card">
    <h1>{{ $announcement->title }}</h1>
    <p class="muted">{{ $announcement->user->name }} · {{ $announcement->company_name ?? 'Şirket belirtilmedi' }} · {{ $announcement->created_at->format('d.m.Y H:i') }}</p>
    <p style="white-space:pre-line">{{ $announcement->content }}</p>
    <div class="actions">
        <a class="btn" href="{{ route('announcements.edit', $announcement) }}">Düzenle</a>
        <a class="btn secondary" href="{{ route('announcements.index') }}">Listeye Dön</a>
    </div>
</div>
@endsection