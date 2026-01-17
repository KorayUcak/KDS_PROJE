 KDS - Küresel Pazar Araştırması Karar Destek Sistemi

Bu proje, Yönetim Bilişim Sistemleri dersi kapsamında geliştirilmiş; MVC mimarisine ve RESTful API prensiplerine tam uyumlu, kapsamlı bir web tabanlı Karar Destek Sistemidir (KDS).

 🎯 Proje Kapsamı ve Karar Destek Yetenekleri

Bu sistem, ihracat yapmak isteyen firmaların veya pazar araştırması yapan analistlerin, hedef ülke ve sektör seçimlerinde veri odaklı stratejik kararlar almasını sağlar. Sistem, farklı veri kaynaklarından (Makroekonomik, Lojistik, Sektörel) gelen verileri işleyerek karmaşık problemleri anlamlı skorlara dönüştürür.

 Karar Vericiler İçin Sağlanan İçgörüler
Sistemin algoritmaları ve veri yapısı sayesinde yöneticiler şu sorulara yanıt bulabilir:

1. Pazar Çekiciliği Analizi:
   - "Hangi ülke hedef sektörüm için en yüksek potansiyele sahip?"
   - Sistem; GSYİH büyüklüğü, büyüme oranları ve sektörel ithalat hacimlerini ağırlıklandırarak 0-100 arası bir Pazar Skoru üretir.

2. Risk ve Stabilite Değerlendirmesi:
   - "Hedef pazardaki ekonomik riskler nelerdir?"
   - Enflasyon oranları ve ülke risk notları analiz edilerek, yüksek kâr potansiyeli olsa bile riskli pazarlar (yüksek enflasyon, düşük üretim karşılama oranı) tespit edilebilir.

3. Lojistik ve Operasyonel Fizibilite:
   - "Ürünlerimi bu ülkeye ne kadar kolay ve ucuza gönderebilirim?"
   - Lojistik Performans Endeksi (LPI), gümrük bekleme süreleri ve konteyner maliyetleri karşılaştırılarak operasyonel zorluklar önceden görülür.

4. Rekabet ve Doygunluk Analizi:
   - "Pazar doymuş mu yoksa fırsat var mı?"
   - Yerli üretim karşılama oranlarına bakılarak, ithalat açığı olan (yerli üretimin talebi karşılayamadığı) pazarlar önceliklendirilir.

 🛠️ Proje Geliştirme Adımları

Proje hayata geçirilirken aşağıdaki teknik geliştirme süreçleri izlenmiştir:

1. Analiz ve Tasarım: İş probleminin tanımlanması ve Veritabanı (ER) şemasının tasarlanması.
2. Altyapı Kurulumu: Node.js ortamının hazırlanması ve gerekli paketlerin (Express, MySQL2) yüklenmesi.
3. MVC Mimarisi: Proje klasör yapısının Model, View ve Controller olarak ayrıştırılması.
4. Veritabanı Entegrasyonu: MySQL bağlantısının sağlanması ve temel CRUD (Ekle/Sil/Güncelle) fonksiyonlarının yazılması.
5. Arayüz Kodlaması: EJS şablon motoru ile kullanıcı arayüzlerinin ve formların tasarlanması.
6. İş Mantığı Geliştirme: Pazar puanlama algoritması ve karar destek mekanizmalarının kodlanması.
7. RESTful Dönüşümü: API yapısının standart HTTP metotlarına (PUT, DELETE) uygun hale getirilmesi.
8. Güvenlik ve Kontrol: Mükerrer kayıt engeli gibi özel iş kurallarının sisteme entegre edilmesi.

 🛡️ Özel İş Kuralları (Senaryolar)
Projede veri bütünlüğünü ve iş mantığını korumak için MVC yapısı içerisinde Controller katmanında 2 kritik iş kuralı kodlanmıştır:

1. Mükerrer Kayıt Engeli:
   - Senaryo: Bir kullanıcı aynı gün içinde aynı ülke-sektör çifti için birden fazla analiz oluşturamaz. Bu kontrol veritabanı şişkinliğini önler ve raporlama disiplini sağlar.
   - Konum: analysisController.js > createAnalysis

2. Silme Koruması (Audit Protection):
   - Senaryo: Skor hesaplaması tamamlanmış, sonuç üretilmiş ve Onaylı durumdaki analizler şirket hafızası ve yasal dayanaklar sebebiyle silinemez. Sadece taslak aşamasındaki analizler silinebilir.
   - Konum: analysisController.js > deleteAnalysis

 🌐 HTTP Metotları ve REST Mimarisi
Proje, kaynak yönetimi için standart HTTP fiillerini (verbs) anlamsal olarak doğru kullanan RESTful bir yapı üzerine kurulmuştur. Tarayıcıların form desteği sınırlı olduğu için method-override kütüphanesi kullanılarak tam REST desteği sağlanmıştır.

- GET (Okuma): Sunucudan veri çekmek ve sayfaları görüntülemek için kullanılır. Veritabanında hiçbir değişiklik yapmaz. (Örn: Analiz listesini getirme, Detay sayfasını açma)
- POST (Oluşturma): Sunucuda yeni bir kaynak (Analiz, Kullanıcı vb.) oluşturmak için kullanılır. (Örn: Yeni bir pazar analizi başlatma)
- PUT (Güncelleme): Mevcut bir kaynağın verilerini değiştirmek için kullanılır. İlgili ID'ye sahip kaydı günceller. (Örn: Lojistik verisindeki gümrük süresini değiştirme)
- DELETE (Silme): Sunucudaki bir kaynağı kalıcı olarak kaldırmak için kullanılır. (Örn: Hatalı girilmiş bir anlaşma tipini silme)

 🔗 API Endpoint Listesi

| Metot | Endpoint | Açıklama |
|-------|----------|-----------|
| GET | /analyses | Tüm analizleri ve özetlerini listeler |
| POST | /analyses | Yeni bir pazar analizi oluşturur |
| GET | /analyses/:id | Belirli bir analizin detaylarını getirir |
| PUT | /logistics/:id | Lojistik verisini günceller (ID'ye göre) |
| DELETE | /logistics/:id | Lojistik verisini siler |
| PUT | /agreements/:id | Uluslararası anlaşma tipini günceller |
| DELETE | /agreements/:id | Uluslararası anlaşma tipini siler |
| GET | /dashboard | Sektörel genel bakış ekranını getirir |

 🏗️ Kullanılan Teknolojiler
- Backend: Node.js, Express.js
- Mimari: MVC (Model-View-Controller)
- Veritabanı: MySQL (İlişkisel Veritabanı)
- Frontend: EJS (Embedded JavaScript Templates), CSS3
- Araçlar: Method-Override, Dotenv

