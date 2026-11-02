@extends('layouts.app')
@section('title', 'Yeni Duyuru')
@section('content')
<h1>Yeni Duyuru</h1>
<form class="card" method="POST" action="{{ route('announcements.store') }}">
    @csrf
    @include('announcements._form')
    <p><button class="btn">Kaydet</button> <a class="btn secondary" href="{{ route('announcements.index') }}">İptal</a></p>
</form>
@endsection