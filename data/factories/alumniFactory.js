/**
 * Alumni Factory
 * Gercekci (Turkce) sahte mezun verisi uretir. Harici paket gerektirmez.
 * Ayni seed ile ayni veriyi uretir (deterministik), boylece testler tekrarlanabilir.
 */
const FIRST_NAMES = ['Ahmet', 'Ayse', 'Mehmet', 'Zeynep', 'Mustafa', 'Elif', 'Can', 'Selin', 'Burak', 'Deniz', 'Emre', 'Merve', 'Ozan', 'Gizem', 'Kerem'];
const LAST_NAMES = ['Yilmaz', 'Kaya', 'Demir', 'Sahin', 'Celik', 'Yildiz', 'Aydin', 'Ozturk', 'Arslan', 'Dogan', 'Kilic', 'Koc', 'Polat', 'Aksoy'];
const DEPARTMENTS = ['Yonetim Bilisim Sistemleri', 'Bilgisayar Muhendisligi', 'Isletme', 'Endustri Muhendisligi', 'Iktisat', 'Elektrik-Elektronik Muhendisligi'];
const COMPANIES = [
  ['Trendyol', 'Yazilim Muhendisi'], ['Garanti BBVA', 'Is Analisti'], ['SAP', 'Urun Yoneticisi'],
  ['Turkcell', 'Veri Analisti'], ['Getir', 'Backend Gelistirici'], ['Arcelik', 'Proje Muhendisi'],
  ['Koc Holding', 'Danisman'], ['Hepsiburada', 'ERP Uzmani']
];
const CITIES = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Eskisehir', 'Berlin'];

function createRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * @param {number} index  Kayit sirasi (e-posta benzersizligi icin kullanilir)
 * @param {Object} overrides Uretilen alanlari ezen degerler
 * @param {number} seed
 */
function make(index = 0, overrides = {}, seed = 42) {
  const rnd = createRng(seed + index * 7919);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const [company, jobTitle] = pick(COMPANIES);
  const graduationYear = 2010 + Math.floor(rnd() * 16); // 2010-2025
  const phone = '+90 5' + String(Math.floor(rnd() * 90) + 10) + ' ' +
    String(Math.floor(rnd() * 900) + 100) + ' ' + String(Math.floor(rnd() * 9000) + 1000);

  return {
    first_name: firstName,
    last_name: lastName,
    email: `${slug(firstName)}.${slug(lastName)}${index + 1}@mezun.example.com`,
    phone,
    graduation_year: graduationYear,
    department: pick(DEPARTMENTS),
    current_company: company,
    job_title: jobTitle,
    city: pick(CITIES),
    linkedin_url: `https://www.linkedin.com/in/${slug(firstName)}-${slug(lastName)}-${index + 1}`,
    ...overrides
  };
}

function makeMany(count = 10, overrides = {}, seed = 42) {
  return Array.from({ length: count }, (_, i) => make(i, overrides, seed));
}

module.exports = { make, makeMany };
