/**
 * Application Factory
 * Gercekci (Turkce) aday basvurusu verisi uretir.
 * Farkli basvuru tiplerine (is, staj, gonulluluk, proje) uygun on yazi (cover letter) sablonlari icerir.
 */

const COVER_LETTERS = {
  job: [
    'Merhaba, ilaninizda belirtilen gereksinimler yazilim gelistirme alanindaki hedeflerimle ve universitede gelistirdigim projelerle birebir ortusuyor. Ekibinize katilarak hizlica katma deger saglamak isterim.',
    'Sayin Yetkili, universitemde aldigim yonetim bilisim sistemleri ve yazilim egitimiyle pozisyonunuza hizla adapte olabilecegime inaniyorum. Portfolyomdaki modern web projelerini incelemenizi rica ederim.',
    'Ilaninizi ilgiyle inceledim. Modern web teknolojileriyle gelistirdigim uygulamalar portfolyomda yer almaktadir; detaylari on mulakatta aktarmaktan buyuk memnuniyet duyarim.'
  ],
  internship: [
    'Merhaba, universitemin zorunlu yaz staji kapsaminda sirketinizin dinamik ve yenilikci ekibinde stajyer muhendis olarak yer almak ve pratik tecrube edinmek istiyorum.',
    'Sayin Ilgili, lisans egitimimin son sinifinda uzun donem staj imkanindan yararlanarak gercek dunya projelerinde aktif rol ustlenmek istiyorum.',
    'Merhaba, staj programinizin genc yeteneklere sundugu mentorluk ve teknik gelisim firsatlari beni cok heyecanlandirdi. Basvurumu degerlendirmenizi rica ederim.'
  ],
  volunteer: [
    'Merhaba, mezunlarimizin baslattigi bu acik kaynak gonullu topluluk projesine kodlama, dokumantasyon ve test sureclerinde gonullu olarak destek vermek istiyorum.',
    'Toplulugumuza katki saglayacak bu sosyal fayda odakli calismada gonullu olarak gorev almaktan buyuk mutluluk duyarim.'
  ],
  project: [
    'Merhaba, paylastiginiz mezun projesinin gereksinimlerini inceledim. Mimari tasarim, veri tabani modelleme ve API entegrasyonu kisimlarinda projeye destek olmak istiyorum.',
    'Gelistirilen bu yeni universite-sanayi arastirma ve gelistirme projesinde gonullu proje asistani olarak yer almak istiyorum.'
  ]
};

const STATUSES = ['pending', 'submitted', 'reviewing', 'accepted', 'rejected'];

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
 * Tek bir aday basvurusu nesnesi uretir.
 * @param {number} index
 * @param {Object} overrides
 * @param {number} seed
 */
function make(index = 0, overrides = {}, seed = 202) {
  const rnd = createRng(seed + index * 3137);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  const type = overrides.type || pick(['job', 'internship', 'volunteer', 'project']);
  const letters = COVER_LETTERS[type] || COVER_LETTERS.job;
  const coverLetter = rnd() > 0.15 ? pick(letters) : null;
  const status = pick(STATUSES);

  return {
    job_posting_id: overrides.job_posting_id || 1,
    applicant_user_id: overrides.applicant_user_id || 1,
    type,
    cover_letter: coverLetter,
    status,
    ...overrides
  };
}

function makeMany(count = 5, overrides = {}, seed = 202) {
  return Array.from({ length: count }, (_, i) => make(i, overrides, seed));
}

module.exports = {
  make,
  makeMany,
  COVER_LETTERS,
  STATUSES
};
