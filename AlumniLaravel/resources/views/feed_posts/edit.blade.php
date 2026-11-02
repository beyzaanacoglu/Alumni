@extends('layouts.app')
@section('title', 'Gönderiyi Düzenle')
@section('content')
<h1>Gönderiyi Düzenle</h1>
<form class="card" method="POST" action="{{ route('feed-posts.update', $post) }}">
    @csrf
    @method('PUT')
    @include('feed_posts._form')
    <p><button class="btn">Güncelle</button> <a class="btn secondary" href="{{ route('feed-posts.show', $post) }}">İptal</a></p>
</form>
@endsection