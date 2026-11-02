@extends('layouts.app')
@section('title', 'Duyuruyu Düzenle')
@section('content')
<h1>Duyuruyu Düzenle</h1>
<form class="card" method="POST" action="{{ route('announcements.update', $announcement) }}">
    @csrf
    @method('PUT')
    @include('announcements._form')
    <p><button class="btn">Güncelle</button> <a class="btn secondary" href="{{ route('announcements.show', $announcement) }}">İptal</a></p>
</form>
@endsection