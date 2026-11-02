@php
    $p = $jobPosting ?? null;
    $employmentTypes = ['full_time' => 'Tam zamanlı', 'part_time' => 'Yarı zamanlı', 'internship' => 'Staj', 'contract' => 'Sözleşmeli'];
    $workModes = ['onsite' => 'Ofiste', 'remote' => 'Uzaktan', 'hybrid' => 'Hibrit'];
    $levels = ['entry' => 'Başlangıç', 'mid' => 'Orta', 'senior' => 'Kıdemli'];
@endphp
<label for="user_id">Yayınlayan (mezun)</label>
<select name="user_id" id="user_id" required>
    <option value="">Seçiniz</option>
    @foreach ($authors as $author)
        <option value="{{ $author->id }}" @selected(old('user_id', $p->user_id ?? '') == $author->id)>{{ $author->name }}</option>
    @endforeach
</select>
@error('user_id') <div class="error">{{ $message }}</div> @enderror

<label for="title">Başlık</label>
<input type="text" name="title" id="title" value="{{ old('title', $p->title ?? '') }}" required>
@error('title') <div class="error">{{ $message }}</div> @enderror

<label for="company_id">Kayıtlı Şirket (isteğe bağlı)</label>
<select name="company_id" id="company_id">
    <option value="">Doğrudan şirket adı yaz</option>
    @foreach ($companies ?? [] as $company)
        <option value="{{ $company->id }}" @selected(old('company_id', $p->company_id ?? '') == $company->id)>{{ $company->name }}</option>
    @endforeach
</select>
@error('company_id') <div class="error">{{ $message }}</div> @enderror

<label for="company_name">Şirket Adı</label>
<input type="text" name="company_name" id="company_name" value="{{ old('company_name', $p->company_name ?? '') }}" required>
@error('company_name') <div class="error">{{ $message }}</div> @enderror

<label for="description">Açıklama</label>
<textarea name="description" id="description" required>{{ old('description', $p->description ?? '') }}</textarea>
@error('description') <div class="error">{{ $message }}</div> @enderror

<label for="employment_type">Çalışma türü</label>
<select name="employment_type" id="employment_type" required>
    @foreach ($employmentTypes as $value => $label)
        <option value="{{ $value }}" @selected(old('employment_type', $p->employment_type ?? '') === $value)>{{ $label }}</option>
    @endforeach
</select>
@error('employment_type') <div class="error">{{ $message }}</div> @enderror

<label for="work_mode">Çalışma şekli</label>
<select name="work_mode" id="work_mode" required>
    @foreach ($workModes as $value => $label)
        <option value="{{ $value }}" @selected(old('work_mode', $p->work_mode ?? 'onsite') === $value)>{{ $label }}</option>
    @endforeach
</select>
@error('work_mode') <div class="error">{{ $message }}</div> @enderror

<label for="experience_level">Deneyim seviyesi (isteğe bağlı)</label>
<select name="experience_level" id="experience_level">
    <option value="">Belirtilmedi</option>
    @foreach ($levels as $value => $label)
        <option value="{{ $value }}" @selected(old('experience_level', $p->experience_level ?? '') === $value)>{{ $label }}</option>
    @endforeach
</select>
@error('experience_level') <div class="error">{{ $message }}</div> @enderror

<label for="required_skills">Aranan yetenekler (isteğe bağlı)</label>
<textarea name="required_skills" id="required_skills">{{ old('required_skills', $p->required_skills ?? '') }}</textarea>
@error('required_skills') <div class="error">{{ $message }}</div> @enderror

<label for="city">Şehir (isteğe bağlı)</label>
<input type="text" name="city" id="city" value="{{ old('city', $p->city ?? '') }}">
@error('city') <div class="error">{{ $message }}</div> @enderror

<label for="country">Ülke kodu, ör. TR (isteğe bağlı)</label>
<input type="text" name="country" id="country" maxlength="2" value="{{ old('country', $p->country ?? '') }}">
@error('country') <div class="error">{{ $message }}</div> @enderror

<label for="contact_email">İletişim e-postası (isteğe bağlı)</label>
<input type="email" name="contact_email" id="contact_email" value="{{ old('contact_email', $p->contact_email ?? '') }}">
@error('contact_email') <div class="error">{{ $message }}</div> @enderror

<label for="external_application_link">Dış başvuru bağlantısı (boş bırakılırsa başvurular sistem içinde takip edilir)</label>
<input type="url" name="external_application_link" id="external_application_link" value="{{ old('external_application_link', $p->external_application_link ?? '') }}">
@error('external_application_link') <div class="error">{{ $message }}</div> @enderror

<label for="application_deadline">Son başvuru tarihi (isteğe bağlı)</label>
<input type="date" name="application_deadline" id="application_deadline" value="{{ old('application_deadline', optional($p->application_deadline ?? null)->format('Y-m-d')) }}">
@error('application_deadline') <div class="error">{{ $message }}</div> @enderror

<label for="status">Durum</label>
<select name="status" id="status" required>
    <option value="open" @selected(old('status', $p->status ?? 'open') === 'open')>Açık</option>
    <option value="closed" @selected(old('status', $p->status ?? 'open') === 'closed')>Kapalı</option>
</select>
@error('status') <div class="error">{{ $message }}</div> @enderror

<label for="latitude">Enlem (isteğe bağlı, -90 ile 90)</label>
<input type="number" step="any" name="latitude" id="latitude" value="{{ old('latitude', $p->latitude ?? '') }}">
@error('latitude') <div class="error">{{ $message }}</div> @enderror

<label for="longitude">Boylam (isteğe bağlı, -180 ile 180)</label>
<input type="number" step="any" name="longitude" id="longitude" value="{{ old('longitude', $p->longitude ?? '') }}">
@error('longitude') <div class="error">{{ $message }}</div> @enderror
