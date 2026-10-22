/**
 * Job Posting Factory
 * Gercekci (Turkce) sahte is, staj, gonullu ve proje ilani verisi uretir.
 * Deterministik RNG kullanarak testlerin ve seeder'larin tekrarlanabilir olmasini saglar.
 */

const COMPANIES = [
  'Trendyol', 'Hepsiburada', 'Garanti BBVA', 'SAP', 'Turkcell',
  'Getir', 'Arcelik', 'Koc Holding', 'Insider', 'Papara',
  'Mezunlar Bilisim ve Inovasyon Kulubu', 'Acik Kaynak Toplulugu'
];

const POSTING_TEMPLATES = [
  {
    title: 'Junior Backend Gelistirici (Node.js & PostgreSQL)',
    employment_type: 'full_time',
    experience_level: 'entry',
    skills: 'Node.js, PostgreSQL, REST API, Git',
    description: 'Mezun takip sistemi ve buyuyen mikroservis mimarimizde gorev alacak, takim calismasina yatkin junior backend gelistirici araniyor.'
  },
  {
    title: 'Frontend React Gelistirici',
    employment_type: 'full_time',
    experience_level: 'mid',
    skills: 'React, TypeScript, CSS3, Redux / Zustand',
    description: 'Kullanici deneyimini en ust seviyeye tasiyacak, modern ve responsive web arayuzleri gelistirecek takim arkadasi ariyoruz.'
  },
  {
    title: 'Yonetim Bilisim Sistemleri Yaz Stajyeri',
    employment_type: 'internship',
    experience_level: 'entry',
    skills: 'SQL, Is Analizi, Excel, Problem Cozme',
    description: 'YBS ogrencileri icin 8 haftalik yaz staj programi. Is sureclerinin dijitallesmesi ve veri akislarinin modellenmesinde aktif rol alacaksiniz.'
  },
  {
    title: 'Veri Analitigi ve Is Zekasi Uzun Donem Stajyeri',
    employment_type: 'internship',
    experience_level: 'entry',
    skills: 'Python, SQL, Power BI, Istatistik',
    description: 'Haftada en az 3 gun katilim saglayabilecek, veri gorsellestirme ve raporlama uzerine calisacak stajyer ariyoruz.'
  },
  {
    title: 'Mezunlar Web Portali Acik Kaynak Gonullu Gelistirici',
    employment_type: 'volunteer',
    experience_level: null,
    skills: 'JavaScript, HTML5, CSS3, Git, Topluluk Katilimi',
    description: 'Universitemiz mezun agi tarafindan gelistirilen acik kaynakli web uygulamasina gonullu olarak katkida bulunacak gelistiriciler araniyor.'
  },
  {
    title: 'Sosyal Sorumluluk: Liselilere Kodlama Egitimi Projesi',
    employment_type: 'project',
    experience_level: null,
    skills: 'Temel Algoritma, Python, Iletisim Becerileri',
    description: 'Lise ogrencilerine temel programlama mantigini aktaracak sosyal sorumluluk ve mentorluk projemizde gorev alacak gonullu egitmenler.'
  },
  {
    title: 'Universite-Sanayi Isbirligi Ar-Ge Proje Asistani',
    employment_type: 'project',
    experience_level: 'entry',
    skills: 'Arastirma Raporlama, Veri Toplama, Dokumantasyon',
    description: 'Tubitak destekli universite-sanayi Ar-Ge projesinde veri analizi ve raporlama sureclerini yurutmek uzere part-time proje asistani.'
  },
  {
    title: 'Part-Time DevOps ve Sistem Destek Asistani',
    employment_type: 'part_time',
    experience_level: 'entry',
    skills: 'Linux, Docker, CI/CD, Bash',
    description: 'Haftada 20 saat esnek calisma modeliyle sunucu altyapilari, log takibi ve konteynerizasyon sureclerinde destek saglayacak takim arkadasi.'
  },
  {
    title: 'Kidemli Veritabani Yoneticisi (DBA)',
    employment_type: 'contract',
    experience_level: 'senior',
    skills: 'PostgreSQL, Performance Tuning, Replikasyon, SQL',
    description: 'Yuksek trafikli veritabani mimarimizin optimizasyonu ve guvenligi konusunda danismanlik yapacak deneyimli DBA.'
  },
  {
    title: 'Mobil Uygulama Test & QA Stajyeri',
    employment_type: 'internship',
    experience_level: 'entry',
    skills: 'Test Senaryolari, Postman, Manuel Test, Jira',
    description: 'Mobil ve web uygulamalarimizin kalite kontrol testlerini gerceklestirecek merakli ve dikkatli stajyer ogrenciler.'
  }
];

const CITIES = [
  { city: 'Istanbul', country: 'TR', lat: 41.0138, lng: 28.9497 },
  { city: 'Ankara', country: 'TR', lat: 39.9334, lng: 32.8597 },
  { city: 'Izmir', country: 'TR', lat: 38.4237, lng: 27.1428 },
  { city: 'Bursa', country: 'TR', lat: 40.1885, lng: 29.0610 },
  { city: 'Berlin', country: 'DE', lat: 52.5200, lng: 13.4050 }
];

const WORK_MODES = ['hybrid', 'onsite', 'remote'];

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

/**
 * Tek bir is/staj/proje ilani uretir.
 * @param {number} index
 * @param {Object} overrides
 * @param {number} seed
 */
function make(index = 0, overrides = {}, seed = 101) {
  const rnd = createRng(seed + index * 5431);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  const tpl = POSTING_TEMPLATES[index % POSTING_TEMPLATES.length];
  const company = pick(COMPANIES);
  const location = pick(CITIES);
  const workMode = pick(WORK_MODES);

  // Staj, gonullu ve projelerde dahili basvuru (external_application_link = null) tercih edilir
  const isInternal = ['internship', 'volunteer', 'project'].includes(tpl.employment_type) || rnd() < 0.6;
  const externalLink = isInternal ? null : `https://careers.example.com/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}/job-${1000 + index}`;

  // Gelecek son basvuru tarihi (2 hafta ile 4 ay arasi)
  const daysAhead = 14 + Math.floor(rnd() * 110);
  const deadlineDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const applicationDeadline = deadlineDate.toISOString().split('T')[0];

  const withCoords = rnd() > 0.2;

  return {
    alumni_id: 1, // seeder icinde mevcut mezun id'lerine gore set edilir
    title: tpl.title,
    description: tpl.description,
    company_name: company,
    city: location.city,
    country: location.country,
    employment_type: tpl.employment_type,
    work_mode: workMode,
    experience_level: tpl.experience_level,
    required_skills: tpl.skills,
    contact_email: rnd() > 0.3 ? `kariyer@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com` : null,
    external_application_link: externalLink,
    application_deadline: rnd() > 0.15 ? applicationDeadline : null,
    status: 'open',
    latitude: withCoords ? location.lat : null,
    longitude: withCoords ? location.lng : null,
    ...overrides
  };
}

function makeMany(count = 10, overrides = {}, seed = 101) {
  return Array.from({ length: count }, (_, i) => make(i, overrides, seed));
}

module.exports = {
  make,
  makeMany,
  POSTING_TEMPLATES,
  COMPANIES,
  CITIES
};
