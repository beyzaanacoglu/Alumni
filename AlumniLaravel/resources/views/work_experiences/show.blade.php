@extends('layouts.app')
@section('title', $experience->company)
@section('content')
<div class="card">
    <h1>{{ $experience->position }} @ {{ $experience->company }}</h1>
    <p class="muted">{{ $experience->user->name }}</p>
    <p>Koordinatlar: <strong>{{ $experience->latitude }}, {{ $experience->longitude }}</strong></p>
    <p><a target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat={{ $experience->latitude }}&mlon={{ $experience->longitude }}#map=12/{{ $experience->latitude }}/{{ $experience->longitude }}">Haritada göster</a></p>
    <div class="actions">
        <a class="btn" href="{{ route('work-experiences.edit', $experience) }}">Düzenle</a>
        <a class="btn secondary" href="{{ route('work-experiences.index') }}">Listeye Dön</a>
    </div>
</div>
@endsection