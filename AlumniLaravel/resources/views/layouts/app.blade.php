<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Mezun Takip Sistemi')</title>
    <style>
        :root { --primary:#1d4ed8; --danger:#dc2626; --bg:#f3f4f6; --card:#fff; --text:#1f2937; --muted:#6b7280; --border:#e5e7eb; }
        * { box-sizing:border-box; }
        body { margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; background:var(--bg); color:var(--text); }
        nav { background:var(--primary); padding:0 24px; display:flex; align-items:center; gap:8px; }
        nav .brand { color:#fff; font-weight:700; margin-right:24px; padding:16px 0; }
        nav a { color:#dbeafe; text-decoration:none; padding:16px 14px; }
        nav a.active, nav a:hover { background:rgba(255,255,255,.15); color:#fff; }
        main { max-width:1100px; margin:24px auto; padding:0 16px; }
        h1 { margin:0 0 16px; font-size:1.6rem; }
        .toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .card { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:18px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .grid .card img { width:100%; height:170px; object-fit:cover; border-radius:8px; margin-bottom:10px; }
        table { width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--border); border-radius:10px; overflow:hidden; }
        th, td { text-align:left; padding:10px 12px; border-bottom:1px solid var(--border); font-size:.92rem; vertical-align:top; }
        th { background:#f9fafb; }
        .muted { color:var(--muted); font-size:.85rem; }
        .btn { display:inline-block; border:0; border-radius:6px; padding:7px 12px; font-size:.88rem; cursor:pointer; text-decoration:none; background:var(--primary); color:#fff; }
        .btn.secondary { background:#e5e7eb; color:var(--text); }
        .btn.danger { background:var(--danger); }
        .actions { display:flex; gap:6px; align-items:center; }
        .actions form { margin:0; }
        label { display:block; font-weight:600; margin:14px 0 4px; }
        input[type=text], input[type=number], input[type=url], select, textarea { width:100%; padding:9px 10px; border:1px solid #d1d5db; border-radius:6px; font:inherit; }
        textarea { min-height:130px; }
        .error { color:var(--danger); font-size:.85rem; margin-top:4px; }
        .alert { padding:10px 14px; border-radius:8px; margin-bottom:16px; background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
        .pagination { list-style:none; display:flex; gap:4px; padding:0; margin:16px 0; }
        .pagination li a, .pagination li span { display:block; padding:6px 11px; border:1px solid var(--border); border-radius:6px; background:#fff; color:var(--text); text-decoration:none; }
        .pagination li.active span { background:var(--primary); color:#fff; border-color:var(--primary); }
        .pagination li.disabled span { color:#9ca3af; }
    </style>
</head>
<body>
<nav>
    <span class="brand">Mezun Takip</span>
    <a href="{{ route('announcements.index') }}" class="{{ request()->routeIs('announcements.*') ? 'active' : '' }}">Duyurular</a>
    <a href="{{ route('feed-posts.index') }}" class="{{ request()->routeIs('feed-posts.*') ? 'active' : '' }}">Akış</a>
    <a href="{{ route('work-experiences.index') }}" class="{{ request()->routeIs('work-experiences.*') ? 'active' : '' }}">İş Deneyimleri / Harita</a>
    <a href="{{ route('job-postings.index') }}" class="{{ request()->routeIs('job-postings.*') ? 'active' : '' }}">İş İlanları</a>
</nav>
<main>
    @if (session('success'))
        <div class="alert">{{ session('success') }}</div>
    @endif
    @yield('content')
</main>
</body>
</html>