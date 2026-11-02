<label for="user_id">Yayınlayan (mezun)</label>
<select name="user_id" id="user_id" required>
    <option value="">Seçiniz</option>
    @foreach ($authors as $author)
        <option value="{{ $author->id }}" @selected(old('user_id', $announcement->user_id ?? '') == $author->id)>{{ $author->name }}</option>
    @endforeach
</select>
@error('user_id') <div class="error">{{ $message }}</div> @enderror

<label for="title">Başlık</label>
<input type="text" name="title" id="title" value="{{ old('title', $announcement->title ?? '') }}" required>
@error('title') <div class="error">{{ $message }}</div> @enderror

<label for="company_name">Şirket (isteğe bağlı)</label>
<input type="text" name="company_name" id="company_name" value="{{ old('company_name', $announcement->company_name ?? '') }}">
@error('company_name') <div class="error">{{ $message }}</div> @enderror

<label for="content">İçerik</label>
<textarea name="content" id="content" required>{{ old('content', $announcement->content ?? '') }}</textarea>
@error('content') <div class="error">{{ $message }}</div> @enderror