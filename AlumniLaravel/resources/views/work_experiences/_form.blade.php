<label for="user_id">Kişi</label>
<select name="user_id" id="user_id" required>
    <option value="">Seçiniz</option>
    @foreach ($users as $user)
        <option value="{{ $user->id }}" @selected(old('user_id', $experience->user_id ?? '') == $user->id)>{{ $user->name }}</option>
    @endforeach
</select>
@error('user_id') <div class="error">{{ $message }}</div> @enderror

<label for="company">Şirket</label>
<input type="text" name="company" id="company" value="{{ old('company', $experience->company ?? '') }}" required>
@error('company') <div class="error">{{ $message }}</div> @enderror

<label for="position">Pozisyon</label>
<input type="text" name="position" id="position" value="{{ old('position', $experience->position ?? '') }}" required>
@error('position') <div class="error">{{ $message }}</div> @enderror

<label for="latitude">Enlem (-90 ile 90)</label>
<input type="number" step="any" name="latitude" id="latitude" placeholder="41.01384000" value="{{ old('latitude', $experience->latitude ?? '') }}" required>
@error('latitude') <div class="error">{{ $message }}</div> @enderror

<label for="longitude">Boylam (-180 ile 180)</label>
<input type="number" step="any" name="longitude" id="longitude" placeholder="28.94966000" value="{{ old('longitude', $experience->longitude ?? '') }}" required>
@error('longitude') <div class="error">{{ $message }}</div> @enderror