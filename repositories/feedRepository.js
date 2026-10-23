const fs = require('fs');
const path = require('path');

const FEED_FILE = path.join(__dirname, '..', 'data', 'feed.json');

const INITIAL_POSTS = [
  {
    id: 1,
    authorName: 'Ayşe Yılmaz',
    authorTitle: 'Senior Software Engineer @ Trendyol • YBS \'18 Mezunu',
    authorAvatar: 'AY',
    authorBadge: '🎓 Mezun',
    category: 'career',
    content: 'Trendyol Core Payment ekibimizde yetiştirilmek üzere Junior Backend Developer ve Yazılım Stajyeri arıyoruz! 🚀\n\nÜniversitemiz mezun ve son sınıf öğrencilerine şirket içi referans olmak isterim. Go ve Node.js ekosistemine meraklı, mikroservis mimarileriyle çalışmak isteyen arkadaşlar doğrudan bana mesaj atabilir veya CV\'lerini iletebilir.\n\nBaşarılar dilerim! 💻✨ #Kariyer #Trendyol #YazilimGelistirme #AlumniReferral',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likesCount: 38,
    isLiked: false,
    likedBy: [],
    imageUrl: '',
    linkUrl: '/jobs',
    linkTitle: '💼 Trendyol - Junior Backend Geliştirici İlanını İncele',
    comments: [
      {
        id: 101,
        authorName: 'Mehmet Demir',
        authorTitle: 'Ürün Yöneticisi @ SAP',
        authorAvatar: 'MD',
        text: 'Harika bir fırsat Ayşe! Yeni mezun olacak arkadaşlarımız mutlaka değerlendirmeli.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 102,
        authorName: 'Beyza Anacoğlu',
        authorTitle: 'Platform Yöneticisi • YBS Öğrencisi',
        authorAvatar: 'BA',
        text: 'Paylaşım için teşekkürler Ayşe Hanım, CV\'mi ilettim!',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 2,
    authorName: 'Mehmet Demir',
    authorTitle: 'Ürün Yöneticisi @ SAP (Berlin) • YBS \'15 Mezunu',
    authorAvatar: 'MD',
    authorBadge: '🌍 Global Mezun',
    category: 'story',
    content: 'Yurt dışında kariyer hedefleyen mezun ve öğrenci arkadaşlarımız için önümüzdeki hafta Zoom üzerinden \'Avrupa\'da Teknoloji Kariyeri, Vize ve Mülakat Süreçleri\' başlıklı bir mezun söyleşisi düzenliyoruz. 🌍🇩🇪\n\nKendi Berlin deneyimimi ve kurumsal teknoloji şirketlerinin beklentilerini paylaşacağım. Katılmak ve soru sormak isteyenler yorumlarda belirtebilir, toplantı linkini ileteceğim!',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likesCount: 54,
    isLiked: false,
    likedBy: [],
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '',
    linkTitle: '',
    comments: [
      {
        id: 201,
        authorName: 'Elif Kaya',
        authorTitle: 'İş Analisti @ Garanti BBVA',
        authorAvatar: 'EK',
        text: 'Harika bir inisiyatif Mehmet! Ben de katılmayı çok isterim.',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 3,
    authorName: 'Rektörlük & Mezunlar Koordinatörlüğü',
    authorTitle: 'Üniversite Kariyer & Mezun İlişkileri Ofisi',
    authorAvatar: '🏛️',
    authorBadge: '📢 Resmi Kurum',
    category: 'announcement',
    content: '📢 2026 Güz Dönemi Mezun & Öğrenci Buluşması Tarihleri Açıklandı!\n\nKampüsümüzde düzenlenecek networking gününde 40\'tan fazla teknoloji, finans ve danışmanlık firması stant açacak. Kariyer merkezimiz gün boyunca ücretsiz CV inceleme ve simülasyon mülakatı desteği sağlayacak. Tüm mezun ve öğrencilerimiz davetlidir!\n\nAyrıntılı program ve salon bilgisi için Duyurular sekmesini ziyaret edebilirsiniz. 🎓✨ #MezunBulusmasi #KariyerGunu #Etkinlik',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likesCount: 92,
    isLiked: false,
    likedBy: [],
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/announcements',
    linkTitle: '📢 Resmi Etkinlik Duyurusunu Görüntüle',
    comments: []
  },
  {
    id: 4,
    authorName: 'Elif Kaya',
    authorTitle: 'Kıdemli İş Analisti @ Garanti BBVA • İşletme \'20 Mezunu',
    authorAvatar: 'EK',
    authorBadge: '🎓 Mezun',
    category: 'advice',
    content: 'Bugün mezun ağımız üzerinden tanıştığım Yönetim Bilişim Sistemleri 3. sınıf öğrencisi bir arkadaşımızla ilk mentorluk seansımızı tamamladık. 📊\n\nFintek sektöründe iş analitiği, SQL becerileri ve agile metodolojiler üzerine konuştuk. Mezun olduğum okulun öğrencilerine birikimlerimi aktarabilmek ve mezun dayanışmasının gücünü görmek gerçekten gurur verici! 👏🤝 #Mentorluk #MezunDayanismasi #Fintek #VeriAnalitigi',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likesCount: 47,
    isLiked: false,
    likedBy: [],
    imageUrl: '',
    linkUrl: '',
    linkTitle: '',
    comments: []
  }
];

function ensureFile() {
  const dir = path.dirname(FEED_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FEED_FILE)) {
    fs.writeFileSync(FEED_FILE, JSON.stringify(INITIAL_POSTS, null, 2), 'utf8');
  }
}

function readAll() {
  ensureFile();
  try {
    const raw = fs.readFileSync(FEED_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : INITIAL_POSTS;
  } catch (err) {
    return INITIAL_POSTS;
  }
}

function writeAll(posts) {
  ensureFile();
  fs.writeFileSync(FEED_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

const feedRepository = {
  getAll(category = null) {
    const posts = readAll();
    if (!category || category === 'all') {
      return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return posts
      .filter(p => p.category === category)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  findById(id) {
    const posts = readAll();
    return posts.find(p => p.id === Number(id)) || null;
  },

  create(postData) {
    const posts = readAll();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    const newPost = {
      id: newId,
      authorName: postData.authorName || 'Beyza Anacoğlu',
      authorTitle: postData.authorTitle || 'Platform Yöneticisi • YBS Mezun Ağı',
      authorAvatar: postData.authorAvatar || 'BA',
      authorBadge: postData.authorBadge || '🎓 Mezun',
      category: postData.category || 'general',
      content: postData.content || '',
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
      likedBy: [],
      imageUrl: postData.imageUrl || '',
      linkUrl: postData.linkUrl || '',
      linkTitle: postData.linkTitle || '',
      comments: []
    };
    posts.unshift(newPost);
    writeAll(posts);
    return newPost;
  },

  toggleLike(id, userName = 'Beyza Anacoğlu') {
    const posts = readAll();
    const post = posts.find(p => p.id === Number(id));
    if (!post) return null;

    if (!Array.isArray(post.likedBy)) post.likedBy = [];
    const idx = post.likedBy.indexOf(userName);
    if (idx >= 0) {
      post.likedBy.splice(idx, 1);
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
      post.isLiked = false;
    } else {
      post.likedBy.push(userName);
      post.likesCount = (post.likesCount || 0) + 1;
      post.isLiked = true;
    }
    writeAll(posts);
    return post;
  },

  addComment(id, commentData) {
    const posts = readAll();
    const post = posts.find(p => p.id === Number(id));
    if (!post) return null;

    if (!Array.isArray(post.comments)) post.comments = [];
    const newComment = {
      id: Date.now(),
      authorName: commentData.authorName || 'Beyza Anacoğlu',
      authorTitle: commentData.authorTitle || 'Platform Yöneticisi',
      authorAvatar: commentData.authorAvatar || 'BA',
      text: commentData.text || '',
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    writeAll(posts);
    return { post, newComment };
  }
};

module.exports = feedRepository;
