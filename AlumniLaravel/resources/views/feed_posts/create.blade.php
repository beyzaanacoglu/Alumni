@extends('layouts.app')
@section('title', 'Yeni Gönderi')
@section('content')
<h1>Yeni Gönderi</h1>
<form class="card" method="POST" action="{{ route('feed-posts.store') }}">
    @csrf
    @include('feed_posts._form')
    <p><button class="btn">Paylaş</button> <a class="btn secondary" href="{{ route('feed-posts.index') }}">İptal</a></p>
</form>
@endsection