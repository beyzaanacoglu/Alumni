@extends('layouts.app')
@section('title', 'İş Deneyimini Düzenle')
@section('content')
<h1>İş Deneyimini Düzenle</h1>
<form class="card" method="POST" action="{{ route('work-experiences.update', $experience) }}">
    @csrf
    @method('PUT')
    @include('work_experiences._form')
    <p><button class="btn">Güncelle</button> <a class="btn secondary" href="{{ route('work-experiences.show', $experience) }}">İptal</a></p>
</form>
@endsection