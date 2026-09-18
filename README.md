Alumni Tracking System

Bu proje, Yönetim Bilişim Sistemleri (YBS) bölümü Web Programlama dersi kapsamında geliştirilmiş bir Mezun Takip Sistemi'dir. Uygulama, mezunların iletişim bilgilerini ve kariyer durumlarını merkezi bir veritabanında güvenli bir şekilde tutmayı ve yönetmeyi amaçlamaktadır.

🚀 Geliştirici

Beyza Anaçoğlu

🛠 Kullanılan Teknolojiler

Backend: PHP, Laravel

Veritabanı: MySQL

Frontend: Laravel Blade Templates, HTML, CSS

⚙️ Kurulum Adımları (Local Development)

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayın:

Repoyu Klonlayın:
git clone https://github.com/beyzaanacoglu/Alumni.git
cd Alumni

Gerekli Bağımlılıkları Yükleyin:
composer install
npm install
npm run build

Çevre (Environment) Değişkenlerini Ayarlayın:
cp .env.example .env

Veritabanı Bağlantısını Yapılandırın:
Bilgisayarınızda (XAMPP, MAMP, Laragon vb. üzerinden) "alumni" adında boş bir MySQL veritabanı oluşturun. Ardından projedeki .env dosyasını açarak veritabanı ayarlarını şu şekilde güncelleyin:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alumni
DB_USERNAME=root
DB_PASSWORD=

Application Key Oluşturun:
php artisan key:generate

Veritabanı Tablolarını Oluşturun (Migrations):
php artisan migrate

Projeyi Çalıştırın:
php artisan serve

Uygulama artık http://localhost:8000 adresinde yayındadır.

🗄️ Temel Veritabanı Tabloları

users: Sisteme giriş yapan yetkili kullanıcıları ve rolleri tutar.

alumni: Mezunların kişisel detaylarını, iletişim bilgilerini ve mesleki durumlarını içerir.
