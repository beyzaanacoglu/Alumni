<label for="user_id">Paylaşan</label>
<select name="user_id" id="user_id" required>
    <option value="">Seçiniz</option>
    @foreach ($users as $user)
        <option value="{{ $user->id }}" @selected(old('user_id', $post->user_id ?? '') == $user->id)>{{ $user->name }}</option>
    @endforeach
</select>
@error('user_id') <div class="error">{{ $message }}</div> @enderror

<label for="body">Gönderi</label>
<textarea name="body" id="body" required>{{ old('body', $post->body ?? '') }}</textarea>
@error('body') <div class="error">{{ $message }}</div> @enderror

<label for="image_path">Görsel URL (isteğe bağlı)</label>
<input type="url" name="image_path" id="image_path" placeholder="https://picsum.photos/800/450" value="{{ old('image_path', $post->image_path ?? '') }}">
@error('image_path') <div class="error">{{ $message }}</div> @enderror