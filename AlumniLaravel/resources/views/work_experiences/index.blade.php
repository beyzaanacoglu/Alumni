@extends('layouts.app')
@section('title', 'İş Deneyimleri')
@section('content')
<div class="toolbar">
    <h1>İş Deneyimleri ve Harita Koordinatları</h1>
    <a class="btn" href="{{ route('work-experiences.create') }}">+ Yeni Deneyim</a>
</div>
<table>
    <thead><tr><th>Kişi</th><th>Şirket</th><th>Pozisyon</th><th>Enlem</th><th>Boylam</th><th>Harita</th><th>İşlemler</th></tr></thead>
    <tbody>
    @forelse ($experiences as $experience)
        <tr>
            <td>{{ $experience->user->name }}</td>
            <td><a href="{{ route('work-experiences.show', $experience) }}">{{ $experience->company }}</a></td>
            <td>{{ $experience->position }}</td>
            <td>{{ number_format($experience->latitude, 6) }}</td>
            <td>{{ number_format($experience->longitude, 6) }}</td>
            <td><a target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat={{ $experience->latitude }}&mlon={{ $experience->longitude }}#map=12/{{ $experience->latitude }}/{{ $experience->longitude }}">Görüntüle</a></td>
            <td class="actions">
                <a class="btn secondary" href="{{ route('work-experiences.edit', $experience) }}">Düzenle</a>
                <form method="POST" action="{{ route('work-experiences.destroy', $experience) }}" onsubmit="return confirm('Kayıt silinsin mi?')">
                    @csrf @method('DELETE')
                    <button class="btn danger">Sil</button>
                </form>
            </td>
        </tr>
    @empty
        <tr><td colspan="7" class="muted">Henüz kayıt yok.</td></tr>
    @endforelse
    </tbody>
</table>
{{ $experiences->links('pagination::bootstrap-4') }}
@endsection