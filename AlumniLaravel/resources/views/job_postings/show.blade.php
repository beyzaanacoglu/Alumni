@extends('layouts.app')
@section('title', $jobPosting->title)
@section('content')
<div class="card">
    <h1>{{ $jobPosting->title }}</h1>
    <p class="muted">
        {{ $jobPosting->company_name }} · {{ $jobPosting->user->name }}
        · {{ str_replace('_', ' ', $jobPosting->employment_type) }} · {{ $jobPosting->work_mode }}
        @if ($jobPosting->city) · {{ $jobPosting->city }}{{ $jobPosting->country ? ', '.$jobPosting->country : '' }} @endif
    </p>
    <p><strong>{{ $jobPosting->status === 'open' ? 'Açık' : 'Kapalı' }}</strong>
        @if ($jobPosting->application_deadline) · Son başvuru: {{ $jobPosting->application_deadline->format('d.m.Y') }} @endif
        @if ($jobPosting->experience_level) · Seviye: {{ $jobPosting->experience_level }} @endif
    </p>
    <p style="white-space:pre-line">{{ $jobPosting->description }}</p>
    @if ($jobPosting->required_skills)
        <p><strong>Aranan yetenekler:</strong> {{ $jobPosting->required_skills }}</p>
    @endif
    @if ($jobPosting->contact_email)
        <p><strong>İletişim:</strong> {{ $jobPosting->contact_email }}</p>
    @endif
    <div class="actions">
        <a class="btn" href="{{ route('job-postings.edit', $jobPosting) }}">Düzenle</a>
        <a class="btn secondary" href="{{ route('job-postings.index') }}">Listeye Dön</a>
    </div>
</div>

<div class="card">
    <h2>Başvuru</h2>
    @error('application') <div class="error">{{ $message }}</div> @enderror
    @if (! $jobPosting->usesInternalApplications())
        <form method="POST" action="{{ route('job-postings.apply', $jobPosting) }}">
            @csrf
            <button class="btn">Dış bağlantıdan başvur</button>
        </form>
    @elseif (! $jobPosting->isAcceptingApplications())
        <p class="muted">Bu ilan başvuruya kapalı.</p>
    @else
        <form method="POST" action="{{ route('job-postings.apply', $jobPosting) }}">
            @csrf
            <label for="applicant">Başvuran</label>
            <select name="user_id" id="applicant" required>
                <option value="">Seçiniz</option>
                @foreach ($applicants as $applicant)
                    <option value="{{ $applicant->id }}" @selected(old('user_id') == $applicant->id)>{{ $applicant->name }}</option>
                @endforeach
            </select>
            @error('user_id') <div class="error">{{ $message }}</div> @enderror
            <label for="cover_letter">Ön yazı (isteğe bağlı)</label>
            <textarea name="cover_letter" id="cover_letter">{{ old('cover_letter') }}</textarea>
            @error('cover_letter') <div class="error">{{ $message }}</div> @enderror
            <p><button class="btn">Başvur</button></p>
        </form>
    @endif
</div>

@if ($jobPosting->usesInternalApplications())
<div class="card">
    <h2>Başvurular ({{ $jobPosting->applications_count }})</h2>
    <table>
        <thead><tr><th>Başvuran</th><th>Durum</th><th>Tarih</th><th>İşlemler</th></tr></thead>
        <tbody>
        @forelse ($jobPosting->applications()->with('user')->latest()->get() as $application)
            <tr>
                <td>{{ $application->user->name }}</td>
                <td>
                    <form method="POST" action="{{ route('job-postings.applications.update', [$jobPosting, $application]) }}">
                        @csrf @method('PATCH')
                        <select name="status" onchange="this.form.submit()">
                            @foreach (['submitted' => 'Alındı', 'reviewing' => 'İnceleniyor', 'accepted' => 'Kabul', 'rejected' => 'Red'] as $value => $label)
                                <option value="{{ $value }}" @selected($application->status === $value)>{{ $label }}</option>
                            @endforeach
                        </select>
                    </form>
                </td>
                <td class="muted">{{ $application->created_at->format('d.m.Y') }}</td>
                <td class="actions">
                    <form method="POST" action="{{ route('job-postings.applications.destroy', [$jobPosting, $application]) }}" onsubmit="return confirm('Bu başvuru silinsin mi?')">
                        @csrf @method('DELETE')
                        <button class="btn danger">Sil</button>
                    </form>
                </td>
            </tr>
        @empty
            <tr><td colspan="4" class="muted">Henüz başvuru yok.</td></tr>
        @endforelse
        </tbody>
    </table>
</div>
@endif
@endsection
