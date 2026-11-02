@extends('layouts.app')
@section('title', 'İlanı Düzenle')
@section('content')
<h1>İlanı Düzenle</h1>
<form class="card" method="POST" action="{{ route('job-postings.update', $jobPosting) }}">
    @csrf
    @method('PUT')
    @include('job_postings._form')
    <p><button class="btn">Güncelle</button> <a class="btn secondary" href="{{ route('job-postings.show', $jobPosting) }}">İptal</a></p>
</form>
@endsection
