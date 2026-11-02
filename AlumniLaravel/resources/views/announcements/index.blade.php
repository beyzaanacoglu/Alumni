@extends('layouts.app')
@section('title', 'Duyurular')
@section('content')
<div class="toolbar">
    <h1>Duyurular</h1>
    <a class="btn" href="{{ route('announcements.create') }}">+ Yeni Duyuru</a>
</div>
<table>
    <thead><tr><th>Başlık</th><th>Şirket</th><th>Yayınlayan</th><th>Tarih</th><th>İşlemler</th></tr></thead>
    <tbody>
    @forelse ($announcements as $announcement)
        <tr>
            <td><a href="{{ route('announcements.show', $announcement) }}">{{ $announcement->title }}</a></td>
            <td>{{ $announcement->company_name ?? '-' }}</td>
            <td>{{ $announcement->user->name }}</td>
            <td class="muted">{{ $announcement->created_at->format('d.m.Y') }}</td>
            <td class="actions">
                <a class="btn secondary" href="{{ route('announcements.edit', $announcement) }}">Düzenle</a>
                <form method="POST" action="{{ route('announcements.destroy', $announcement) }}" onsubmit="return confirm('Bu duyuru silinsin mi?')">
                    @csrf @method('DELETE')
                    <button class="btn danger">Sil</button>
                </form>
            </td>
        </tr>
    @empty
        <tr><td colspan="5" class="muted">Henüz duyuru yok.</td></tr>
    @endforelse
    </tbody>
</table>
{{ $announcements->links('pagination::bootstrap-4') }}
@endsection