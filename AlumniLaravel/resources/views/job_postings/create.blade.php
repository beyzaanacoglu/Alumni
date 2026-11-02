@extends('layouts.app')
@section('title', 'Yeni İlan')
@section('content')
<h1>Yeni İş İlanı</h1>
<form class="card" method="POST" action="{{ route('job-postings.store') }}">
    @csrf
    @include('job_postings._form')
    <p><button class="btn">Kaydet</button> <a class="btn secondary" href="{{ route('job-postings.index') }}">İptal</a></p>
</form>
@endsection
