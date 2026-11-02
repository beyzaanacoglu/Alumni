@extends('layouts.app')
@section('title', 'Yeni İş Deneyimi')
@section('content')
<h1>Yeni İş Deneyimi</h1>
<form class="card" method="POST" action="{{ route('work-experiences.store') }}">
    @csrf
    @include('work_experiences._form')
    <p><button class="btn">Kaydet</button> <a class="btn secondary" href="{{ route('work-experiences.index') }}">İptal</a></p>
</form>
@endsection