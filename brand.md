# By Us, For Us — Brand Guidelines & Design System (`brand.md`)

> **"Rooted in the Past, Empowering the Future Together."**  
> *Geçmişe kök salan, geleceği birlikte güçlendiren mezun ve akademi ekosistemi.*

---

## 1. Marka Özeti & Stratejik Kimlik

| Alan | Tanım |
| :--- | :--- |
| **Marka / Proje Adı** | **By Us, For Us** *(Kısa kod: BUFU)* |
| **Slogan (Tagline)** | *"Rooted in the Past, Empowering the Future Together."* |
| **Hedef Kitle** | Mezunlar, Üniversite Öğrencileri, Akademisyenler & Enstitü Temsilcileri |
| **Temel Değerler** | **Vefa** (Aidiyet & Geçmişe Saygı), **Güvenilirlik** (Kurumsal Bütünlük), **Profesyonellik** (Kariyer & Akademik Yetkinlik) |
| **Tasarım Felsefesi** | Şeffaf, aydınlık, kurumsal ama taze; geçmişin mirasını modern dijital estetikle buluşturan hibrit yapı. |

---

## 2. Ses Tonu & İletişim Tarzı (Tone of Voice)

Platformumuz mezunların birikimini, öğrencilerin dinamizmini ve akademinin ciddiyetini bir araya getirir. Bu nedenle iletişim dili **saygılı, kurumsal, vefalı ve güven verici** bir çizgide olmalıdır.

### 2.1 İletişim İlkeleri
* **Saygılı ve "Siz" Odaklı:** Bütün sistem mesajlarında, butonlarda ve formlarda nezaketli ve kapsayıcı bir "siz" dili kullanılır.
* **Vefa ve Aidiyet:** Topluluk ruhunu canlı tutan, mezuniyet sonrası bağı güçlendiren yapıcı ifadeler seçilir.
* **Net ve Şeffaf:** Hata veya onay durumlarında belirsiz jargondan kaçınılır; kullanıcıya net durum bilgisi verilir.

### 2.2 Metin Örnekleri (Do's & Don'ts)

| Durum | ❌ Kaçınılacak (Aşırı samimi / Soğuk) | ✅ By Us, For Us Standardı |
| :--- | :--- | :--- |
| **Başarı Bildirimi** | "Süper! İşi kaptın." | "Başvurunuz başarıyla iletildi." |
| **Hoş Geldiniz** | "Naber! Tekrar geldin." | "Aramıza tekrar hoş geldiniz." |
| **Hata Bildirimi** | "Bir şeyler patladı, tekrar dene." | "İşleminiz gerçekleştirilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyiniz." |
| **Duyuru Başlığı** | "Kaçırma sakın!" | "Geleneksel Mezun Buluşması: Başvurular Başladı" |
| **Boş Durum (Empty State)** | "Burada hiç veri yok." | "Henüz yayınlanmış bir ilan bulunmamaktadır." |

---

## 3. Renk Paleti (Color Palette & Tokens)

Palet, aydınlık bir zemin üzerine **açık mavi** ve **mint yeşili**nin ferahlatıcı enerjisini yerleştirir; kurumsal ciddiyeti ve derinliği ise **modern petrol yeşili** ve **derin lacivert** ile dengeler.

### 3.1 Ana Renkler (Primary) & Zemin

| Renk İsmi | Hex Kodu | RGB | Tailwind Eşdeğeri | Kullanım Alanı |
| :--- | :--- | :--- | :--- | :--- |
| **Pure White** | `#FFFFFF` | `255, 255, 255` | `bg-white` | Ana arka plan, cam kart gövdeleri |
| **Off-White / Light Canvas** | `#F8FAFC` | `248, 250, 252` | `bg-slate-50` | Sayfa genel zemini, yumuşak kontrast yüzeyler |
| **Soft Sky Blue** | `#E0F2FE` | `224, 242, 254` | `bg-sky-100` | İkincil arka planlar, yumuşak cam yansımaları |
| **Clear Sky Blue** | `#38BDF8` | `56, 189, 248` | `text-sky-400` / `border-sky-300` | İnteraktif geçişler, hafif vurgu sınırları |
| **Fresh Mint Green** | `#A7F3D0` | `167, 243, 208` | `bg-emerald-200` | Vefa/yenilik rozetleri, ferahlık rozetleri |
| **Vibrant Mint** | `#10B981` | `16, 185, 129` | `bg-emerald-500` | Başarı göstergeleri, aktif durum etiketleri |

### 3.2 Vurgu Renkleri (Accent) & Tipografi Tonları

| Renk İsmi | Hex Kodu | RGB | Tailwind Eşdeğeri | Kullanım Alanı |
| :--- | :--- | :--- | :--- | :--- |
| **Deep Petrol / Teal** | `#0F766E` | `15, 118, 110` | `text-teal-700` / `bg-teal-700` | Ana CTA butonları, önemli ikonlar, bağlantılar |
| **Dark Teal Shade** | `#115E59` | `17, 94, 89` | `bg-teal-800` | Buton hover durumları, odak çerçeveleri |
| **Heritage Navy** | `#0F172A` | `15, 23, 42` | `text-slate-900` | Birincil başlıklar, yüksek kontrastlı metinler |
| **Midnight Navy** | `#1E293B` | `30, 41, 59` | `text-slate-800` | Gövde metinleri, kurumsal çizgi ayraçları |
| **Muted Slate** | `#64748B` | `100, 116, 139` | `text-slate-500` | İkincil açıklamalar, meta bilgiler, tarihler |

### 3.3 Durum / Bildirim Renkleri (Functional)

* **Başarı (Success):** Mint Green `#10B981` (Zemin: `#ECFDF5`)
* **Bilgi (Info):** Sky Blue `#0284C7` (Zemin: `#F0F9FF`)
* **Uyarı (Warning):** Amber `#F59E0B` (Zemin: `#FFFBEB`)
* **Hata (Danger):** Rose/Crimson `#E11D48` (Zemin: `#FFF1F2`)

---

## 4. Tipografi Sistemi (Typography)

### 4.1 Ana Yazı Tipi: **Montserrat**
Sitenin tüm kurumsal omurgasını, gövde metinlerini, tabloları, menüleri ve standart başlıkları yönetir.

* **Google Fonts Bağlantısı:** `family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800`
* **Karakter Dağılımı:**
  * **Headings (H1 - H4):** `Montserrat SemiBold (600)` veya `Bold (700)`
  * **Body (Metinler):** `Montserrat Regular (400)` veya `Medium (500)`
  * **Labels & Buttons:** `Montserrat Medium (500)` / `SemiBold (600)` — Hafif `tracking-wide` (harf aralığı) ile.

### 4.2 Display & 3D Vurgu Fontu: **Righteous** veya **Syne (ExtraBold)**
Özel duyurular, kutlama anonsları ("Mezunlar Buluşması 2026", "Aramıza Katılın!", "Yılın Mentörü Ödülleri") ve platformun motivasyonunu yükselten özel spot yazılar için kullanılır.

* **Tavsiye Edilen Font:** `Righteous` (Google Fonts) veya `Syne 800`
* **3D Derinlik CSS Kuralı (Modern 3D Layering):**
  Aşırı retro olmadan, petrol yeşili ve lacivert tonlarıyla temiz bir üçüncü boyut efekti:

```css
/* 3D Motivasyon & Başlık Efekti */
.font-display-3d {
  font-family: 'Righteous', 'Montserrat', sans-serif;
  letter-spacing: 0.04em;
  color: #0F766E; /* Deep Petrol */
  text-shadow: 
    1px 1px 0px #A7F3D0,   /* Mint iç katman */
    2px 2px 0px #0F766E,   /* Petrol gövde */
    3px 3px 0px #0F172A,   /* Lacivert derinlik */
    4px 5px 12px rgba(15, 23, 42, 0.15); /* Yumuşak ortam gölgesi */
}
```

---

## 5. Tasarım Çizgisi & UI Mimarisi

By Us, For Us görsel kimliği iki ana estetik zıtlığın uyumu üzerine inşa edilmiştir: **Cam Şeffaflığı (Glassmorphism)** ve **Yumuşak / Keskin Hat Hibriti**.

```
+---------------------------------------------------------------+
|  GLASSMORPHISM KART (rounded-2xl)                             |
|  bg-white/80 backdrop-blur-md border border-white/60          |
|                                                               |
|  [ KESKİN BADGE ]  (rounded-none / border-l-4 petrol yeşili)  |
|  "2026 MEZUNU"                                                |
|                                                               |
|  Başlık: Geleceğe Birlikte Adım Atıyoruz                      |
|  Metin: Mentorluk programı başvuruları açılmıştır...          |
|                                                               |
|  [ BAŞVURUNUZU YAPIN ] (rounded-md / Keskin-Modern Hibrit)    |
+---------------------------------------------------------------+
```

### 5.1 Hafif Cam Efekti (Glassmorphism Standartları)
* **Zemin:** `rgba(255, 255, 255, 0.75)` ila `rgba(255, 255, 255, 0.88)`
* **Bulanıklık (Blur):** `backdrop-blur-md` (8px - 12px)
* **Sınır Çizgisi (Border):** `1px solid rgba(255, 255, 255, 0.8)` veya `rgba(224, 242, 254, 0.6)` (Hafif sky blue parıltılı)
* **Gölge (Shadow):** `0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.02)`

### 5.2 Köşe Dili Kontrastı (Rounded-2xl ile Keskin Hat Uyumu)
Sisteme hem modern yumuşaklığı hem de kurumsal ciddiyeti kazandırmak için köşe yarıçapları rollere göre paylaştırılır:

1. **Geniş Yüzeyler & Konteynerlar (`rounded-2xl` - 16px):**
   * Ana içerik kartları, cam paneller, modal diyalogları ve açılır menü pencereleri.
2. **Mimari & Kurumsal Vurgular (`rounded-none` veya `rounded-sm` - Keskin):**
   * Durum rozetleri (Badges & Chips)
   * Sol / üst vurgu bordürleri (`border-l-4 border-teal-700`)
   * Veri tablolarının başlık hücreleri ve filtre sekmeleri (Tab headers)
   * Sayfa köşelerindeki dekoratif kurumsal imza blokları
3. **Aksiyon Elemanları (`rounded-md` / `rounded-lg`):**
   * Butonlar ve form girdileri; yumuşak kart ile keskin etiket arasında dengeli bir köprü kurar.

---

## 6. İkonografi (Iconography)

* **Tercih Edilen Kütüphane:** **Tabler Icons** (`@tabler/icons-react` / `@tabler/icons-vue`)
* **Çizgi Kalınlığı (Stroke Width):** `1.5px` (Standart UI metinleri için), `1.75px` (Küçük butonlar için)
* **Ölçülendirme:**
  * Küçük aksiyonlar / inline ikonlar: `16px x 16px`
  * Standart buton & form ikonları: `20px x 20px`
  * Kart ve sayfa başlık ikonları: `24px x 24px` ila `32px x 32px`
* **Stil Kuralı:** İçi dolu (solid) ikonlar yerine her zaman **anahat (outline)** tarzı korunur. İkon renkleri zeminle uyumlu olarak `text-teal-700` veya `text-slate-600` ile renklendirilir.

---

## 7. Temel Bileşen Rehberi (Component Specs)

### 7.1 Buton Stilleri

* **Primary CTA (Derin Petrol & Keskin/Yumuşak Denge):**
  * Sınıf: `bg-teal-700 hover:bg-teal-800 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 border border-teal-800`
* **Secondary / Glass Buton (Açık Mavi & Cam):**
  * Sınıf: `bg-white/80 hover:bg-white text-teal-800 border border-sky-200 backdrop-blur-sm px-5 py-2.5 rounded-lg transition-all`
* **Vurgulu / Rozet Buton (Keskin Mimari):**
  * Sınıf: `bg-slate-900 text-emerald-300 font-semibold px-4 py-2 rounded-none tracking-wide text-xs uppercase border-b-2 border-emerald-400`

### 7.2 Kart Standartları (Glass Card)

```html
<div class="bg-white/80 backdrop-blur-md border border-white/60 shadow-lg shadow-slate-200/50 rounded-2xl p-6">
  <!-- Üst Bilgi: Keskin etiket -->
  <div class="flex items-center justify-between mb-4">
    <span class="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold px-2.5 py-1 rounded-none uppercase tracking-wider">
      Akademik Duyuru
    </span>
    <span class="text-xs text-slate-400">18 Kasım 2026</span>
  </div>

  <!-- İçerik -->
  <h3 class="text-lg font-bold text-slate-900 font-sans mb-2">2026 Bahar Dönemi Mezun Mentorluk Eşleşmeleri</h3>
  <p class="text-sm text-slate-600 leading-relaxed mb-4">
    Öğrencilerimiz ile sektörde deneyim kazanmış mezunlarımızı buluşturan mentorluk programı başvuruları açılmıştır.
  </p>

  <!-- Alt Aksiyon -->
  <div class="pt-3 border-t border-slate-100 flex justify-end">
    <button class="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
      Başvuruyu İncele
    </button>
  </div>
</div>
```

---

## 8. Tasarımda Yapılacaklar & Kaçınılacaklar (Do's & Don'ts)

### ✅ Yapılacaklar (Do's)
1. Açık, aydınlık, ferah arka plan hissini koruyun; beyaz zemin üzerine hafif sky blue ve mint yeşili gradyan geçişlerini tercih edin.
2. `rounded-2xl` kartların içerisinde keskin köşeli (`rounded-none`) etiketler ve mimari ayraçlar kullanarak kontrastı hissettirin.
3. 3D süslü fontu (`Righteous` / `font-display-3d`) yalnızca **kutlama, hoş geldiniz ve yüksek motivasyonlu duyurularda** bir imza gibi kullanın.
4. Sistem mesajlarında ve diyaloglarda her zaman saygılı, kurumsal ve net bir ifade kullanın.

### ❌ Kaçınılacaklar (Don'ts)
1. **Aşırı Koyu Gölgeler:** Siyah ve opak gölgelerden kaçının. Her zaman şeffaf ve açık tonlu slate/sky mavi bazlı yumuşak gölgeler kullanın.
2. **Gövde Metninde 3D Font:** 3D veya display fontunu paragraflarda, form etiketlerinde ya da veri tablolarında asla kullanmayın; okunabilirliği düşürür.
3. **Laubali İletişim:** Kullanıcıya "Selam naber", "Süper oldu" gibi aşırı samimi hitaplarda bulunmayın.
4. **Karmaşık İkon Stilleri:** Çift renkli, degrade dolgulu veya karmaşık 3D ikonlar kullanmayın; Tabler'ın saf 1.5px stroke çizgilerini koruyun.

---

*Bu belge, By Us, For Us platformunun tüm görsel ve sözel tasarım kararları için tek doğruluk kaynağı (Single Source of Truth) olarak hazırlanmıştır.*
