@extends('layouts.app')
@section('title', 'İş İlanları')
@section('content')
<div class="toolbar">
    <h1>İş İlanları</h1>
    <a class="btn" href="{{ route('job-postings.create') }}">+ Yeni İlan</a>
</div>
<table>
    <thead><tr><th>Başlık</th><th>Şirket</th><th>Tür</th><th>Durum</th><th>Son Tarih</th><th>İşlemler</th></tr></thead>
    <tbody>
    @forelse ($jobPostings as $jobPosting)
        <tr>
            <td><a href="{{ route('job-postings.show', $jobPosting) }}">{{ $jobPosting->title }}</a></td>
            <td>{{ $jobPosting->company_name }}</td>
            <td>{{ str_replace('_', ' ', $jobPosting->employment_type) }}</td>
            <td>{{ $jobPosting->status === 'open' ? 'Açık' : 'Kapalı' }}</td>
            <td class="muted">{{ $jobPosting->application_deadline?->format('d.m.Y') ?? '-' }}</td>
            <td class="actions">
                <a class="btn secondary" href="{{ route('job-postings.edit', $jobPosting) }}">Düzenle</a>
                <form method="POST" action="{{ route('job-postings.destroy', $jobPosting) }}" onsubmit="return confirm('Bu ilan silinsin mi?')">
                    @csrf @method('DELETE')
                    <button class="btn danger">Sil</button>
                </form>
            </td>
        </tr>
    @empty
        <tr><td colspan="6" class="muted">Henüz ilan yok.</td></tr>
    @endforelse
    </tbody>
</table>
{{ $jobPostings->links('pagination::bootstrap-4') }}
@endsection
