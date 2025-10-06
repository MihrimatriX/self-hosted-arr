# 🎬 Metadata Stack - Jellyfin & Emby

Bu stack, film koleksiyonunuz için otomatik metadata çekme ve yönetim sağlar. Hem **Jellyfin** hem de **Emby** desteği sunar.

## 📋 İçindekiler

- [🚀 Hızlı Başlangıç](#-hızlı-başlangıç)
- [📁 Windows Harddisk Yolları](#-windows-harddisk-yolları)
- [🎬 Jellyfin Kurulumu](#-jellyfin-kurulumu)
- [🎭 Emby Kurulumu](#-emby-kurulumu)
- [🆚 Jellyfin vs Emby](#-jellyfin-vs-emby)
- [📁 Metadata ve Afiş Konumları](#-metadata-ve-afiş-konumları)
- [🔧 Sorun Giderme](#-sorun-giderme)
- [📱 Mobil Uygulamalar](#-mobil-uygulamalar)

## 🚀 Hızlı Başlangıç

### 1. Film Klasörlerinizi Hazırlayın

```env
# G: sürücüsünde film klasörleriniz
MOVIES_PATH=G:\MOVIE
TV_PATH=G:\SERIES
```

### 2. Docker Desktop Ayarları

1. Docker Desktop'ı açın
2. **Settings** → **Resources** → **File Sharing**
3. **G:** sürücüsünü ekleyin
4. **Apply & Restart** butonuna tıklayın

### 3. Stack'i Başlatın

```bash
# Jellyfin için
docker-compose up -d

# Emby için
docker-compose -f emby-docker-compose.yml up -d
```

### 4. Erişim

- **Jellyfin:** http://localhost:8096
- **Emby:** http://localhost:8097

## 📁 Windows Harddisk Yolları

### 🔍 Harddisk Yolunuzu Bulun

**Yöntem 1: Dosya Gezgini**
1. Film klasörünüze gidin
2. Adres çubuğuna tıklayın
3. Tam yolu kopyalayın (örnek: `G:\MOVIE`)

**Yöntem 2: PowerShell**
```powershell
# Mevcut dizini göster
pwd

# Belirli bir klasörün yolunu göster
Get-Location
```

### 📂 Yaygın Windows Yolları

```env
# G: sürücüsünde
MOVIES_PATH=G:\MOVIE
MOVIES_PATH=G:\Movies
MOVIES_PATH=G:\Videos\Movies

# TV dizileri için
TV_PATH=G:\SERIES
TV_PATH=G:\TV
TV_PATH=G:\Videos\TV

# C: sürücüsünde
MOVIES_PATH=C:\Movies
MOVIES_PATH=C:\Users\AFU\Videos\Movies

# D: sürücüsünde
MOVIES_PATH=D:\Movies
MOVIES_PATH=D:\Videos\Movies
```

### ⚠️ Windows Yol Formatı

- ✅ **Doğru:** `G:\MOVIE`
- ❌ **Yanlış:** `G:/MOVIE`
- ❌ **Yanlış:** `/g/MOVIE`

## 🎬 Jellyfin Kurulumu

### 1. `.env` Dosyası Oluşturun

`metadata-stack` klasöründe `.env` dosyası oluşturun:

```env
# Film klasörünüzün tam yolu (Windows için)
MOVIES_PATH=G:\MOVIE

# TV dizileri klasörünüzün tam yolu (Windows için)  
TV_PATH=G:\SERIES

# Jellyfin portları
JELLYFIN_HTTP_PORT=8096
JELLYFIN_HTTPS_PORT=8920

# Kullanıcı ID'leri (Windows için genellikle 1000)
PUID=1000
PGID=1000

# Zaman dilimi
TZ=Europe/Istanbul

# Jellyfin yayın URL'si
JELLYFIN_PUBLISHED_SERVER_URL=http://localhost:8096
```

### 2. Jellyfin'i Başlatın

```bash
cd metadata-stack
docker-compose up -d
```

### 3. Jellyfin'e Erişin

Tarayıcınızda: `http://localhost:8096`

### 4. İlk Kurulum

1. **Admin kullanıcısı oluşturun**
2. **Kütüphane ekleyin:**
   - Movies klasörünü seçin (`/data/movies`)
   - Content type: "Movies" seçin
   - Metadata providers: TMDB, IMDb seçin
3. **Otomatik tarama ayarları:**
   - Settings → Library → Enable real-time monitoring
   - Settings → Library → Enable automatic library updates

## 🎭 Emby Kurulumu

### 1. `.env` Dosyası Oluşturun

`metadata-stack` klasöründe `.env` dosyası oluşturun:

```env
# Film klasörünüzün tam yolu (Windows için)
MOVIES_PATH=G:\MOVIE

# TV dizileri klasörünüzün tam yolu (Windows için)  
TV_PATH=G:\SERIES

# Emby portları (Jellyfin'den farklı portlar)
EMBY_HTTP_PORT=8097
EMBY_HTTPS_PORT=8921

# Kullanıcı ID'leri (Windows için genellikle 1000)
PUID=1000
PGID=1000

# Zaman dilimi
TZ=Europe/Istanbul

# Emby yayın URL'si
EMBY_PUBLISHED_SERVER_URL=http://localhost:8097
```

### 2. Emby'yi Başlatın

```bash
cd metadata-stack
docker-compose -f emby-docker-compose.yml up -d
```

### 3. Emby'e Erişin

Tarayıcınızda: `http://localhost:8097`

### 4. İlk Kurulum

1. **Admin kullanıcısı oluşturun**
2. **Kütüphane ekleyin:**
   - Movies klasörünü seçin (`/data/movies`)
   - Content type: "Movies" seçin
   - Metadata providers: TMDB, IMDb seçin
3. **Otomatik tarama ayarları:**
   - Settings → Library → Enable real-time monitoring
   - Settings → Library → Enable automatic library updates

## 🆚 Jellyfin vs Emby

| Özellik | Jellyfin | Emby |
|---------|----------|------|
| **Port (HTTP)** | 8096 | 8097 |
| **Port (HTTPS)** | 8920 | 8921 |
| **Config Klasörü** | `./config` | `./emby-config` |
| **Ücretsiz** | ✅ Tamamen | ⚠️ Sınırlı |
| **Premium** | ❌ Yok | ✅ Emby Premiere |
| **Thumb Dosyası** | ❌ Yok | ✅ Var |
| **Metadata Format** | JSON | JSON |
| **Afiş Kalitesi** | Yüksek | Yüksek |
| **Otomatik İndirme** | ✅ | ✅ |

### 🚀 Hızlı Başlatma Komutları

```bash
# Jellyfin'i başlat
docker-compose up -d

# Jellyfin'i durdur
docker-compose down

# Emby'yi başlat
docker-compose -f emby-docker-compose.yml up -d

# Emby'yi durdur
docker-compose -f emby-docker-compose.yml down

# Logları görüntüle
docker-compose logs -f
docker-compose -f emby-docker-compose.yml logs -f
```

## 📁 Metadata ve Afiş Konumları

### 🎯 Jellyfin Metadata Konumu

Jellyfin tüm metadata'ları `./config` klasöründe saklar:

```
metadata-stack/
├── config/
│   ├── metadata/
│   │   ├── library/
│   │   │   ├── movies/[Film ID]/
│   │   │   │   ├── poster.jpg        # 🖼️ ANA AFİŞ
│   │   │   │   ├── backdrop1.jpg     # 🖼️ ARKA PLAN
│   │   │   │   ├── fanart.jpg        # 🖼️ FAN ART
│   │   │   │   ├── logo.png          # 🖼️ LOGO
│   │   │   │   └── metadata.json     # 📄 Film bilgileri
│   │   │   └── tvshows/[Dizi ID]/
│   │   └── people/[Oyuncu ID]/
```

### 🎯 Emby Metadata Konumu

Emby tüm metadata'ları `./emby-config` klasöründe saklar:

```
metadata-stack/
├── emby-config/
│   ├── metadata/
│   │   ├── library/
│   │   │   ├── movies/[Film ID]/
│   │   │   │   ├── poster.jpg        # 🖼️ ANA AFİŞ
│   │   │   │   ├── backdrop1.jpg     # 🖼️ ARKA PLAN
│   │   │   │   ├── fanart.jpg        # 🖼️ FAN ART
│   │   │   │   ├── logo.png          # 🖼️ LOGO
│   │   │   │   ├── thumb.jpg         # 🖼️ KÜÇÜK RESİM
│   │   │   │   └── metadata.json     # 📄 Film bilgileri
│   │   │   └── tvshows/[Dizi ID]/
│   │   └── people/[Oyuncu ID]/
```

### 🔍 Film ID'sini Bulma

**Yöntem 1: Web Arayüzü**
1. Jellyfin/Emby'e gidin
2. Filme tıklayın
3. URL'deki ID'yi kopyalayın

**Yöntem 2: Dosya Adından**
```
config/metadata/library/movies/12345/
emby-config/metadata/library/movies/12345/
```

### 📂 Afiş Dosyalarını Kopyalama

**Windows PowerShell ile:**
```powershell
# Jellyfin afişlerini kopyala
Copy-Item "config\metadata\library\movies\*\poster.jpg" -Destination "C:\Afişler\" -Recurse

# Emby afişlerini kopyala
Copy-Item "emby-config\metadata\library\movies\*\poster.jpg" -Destination "C:\Afişler\" -Recurse

# Belirli bir filmin afişini kopyala
Copy-Item "config\metadata\library\movies\12345\poster.jpg" -Destination "C:\Afişler\FilmAdi.jpg"
```

**Command Prompt ile:**
```cmd
# Tüm afişleri kopyala
xcopy "config\metadata\library\movies\*\poster.jpg" "C:\Afişler\" /s
xcopy "emby-config\metadata\library\movies\*\poster.jpg" "C:\Afişler\" /s
```

### 🎨 Afiş Dosya Türleri

| Dosya Türü | Boyut | Format | Kullanım |
|------------|-------|--------|----------|
| **Poster** | 1000x1500 | JPG | Ana afiş, küçük resimler |
| **Backdrop** | 1920x1080 | JPG | Arka plan, büyük görüntüler |
| **Fan Art** | Değişken | JPG | Özel sanat çalışmaları |
| **Logo** | Değişken | PNG | Logo, başlık |
| **Thumb** | 300x450 | JPG | Hızlı yükleme (sadece Emby) |

## 🔧 Sorun Giderme

### "Path not found" Hatası
- `.env` dosyasındaki yolları kontrol edin
- Docker Desktop'ta sürücü paylaşımını kontrol edin

### "Permission denied" Hatası
- Klasör izinlerini kontrol edin
- Docker Desktop'ı yönetici olarak çalıştırın

### Filmler Görünmüyor
- Klasör yapısını kontrol edin
- Jellyfin/Emby'de "Scan Library" butonuna tıklayın

### Port Çakışması
- Jellyfin: 8096, Emby: 8097
- Her iki servis aynı anda çalışabilir

### Network Ayarları
```bash
# Eğer proxy-network bulunamıyor hatası alırsanız
docker network create proxy-network
```

### Klasör İzinleri
- Film klasörünüzün Docker tarafından okunabilir olduğundan emin olun
- Gerekirse klasöre sağ tıklayın → Properties → Security → Edit

## 📱 Mobil Uygulamalar

### Jellyfin
- **Android:** Google Play Store'dan indirin
- **iOS:** App Store'dan indirin
- **Web:** http://localhost:8096

### Emby
- **Android:** Google Play Store'dan indirin
- **iOS:** App Store'dan indirin
- **Web:** http://localhost:8097

### Afiş Optimizasyonu

Mobil uygulamalar için afişleri optimize edin:

1. **Boyutları optimize edin:**
   - Poster: 500x750 piksel
   - Backdrop: 1280x720 piksel
   - Thumb: 200x300 piksel (Emby)

2. **Format dönüştürün:**
   - WebP formatı daha küçük dosya boyutu
   - PNG şeffaflık için

## 🎯 Metadata Özellikleri

- ✅ **Otomatik film tanıma**
- ✅ **Poster, backdrop, fanart indirme**
- ✅ **Film bilgileri (yönetmen, oyuncular, özet)**
- ✅ **IMDb, TMDB, TVDB entegrasyonu**
- ✅ **Türkçe dil desteği**
- ✅ **Otomatik güncelleme**

## 📁 Klasör Yapısı

Filmlerinizi şu formatta organize edin:

```
Movies/
├── Film Adı (Yıl)/
│   ├── Film Adı (Yıl).mkv
│   └── Film Adı (Yıl).srt
├── Başka Film (2023)/
│   └── Başka Film (2023).mp4
```

## 🌐 Erişim

### Jellyfin
- **Web UI:** http://localhost:8096
- **HTTPS:** https://localhost:8920
- **Mobile Apps:** Jellyfin uygulamasını indirin

### Emby
- **Web UI:** http://localhost:8097
- **HTTPS:** https://localhost:8921
- **Mobile Apps:** Emby uygulamasını indirin

## ⚠️ Önemli Notlar

- **Dosya boyutları:** Afişler genellikle 200KB-2MB arası
- **Güncelleme:** Yeni metadata'lar otomatik indirilir
- **Yedekleme:** `config` ve `emby-config` klasörlerini yedekleyin
- **Disk alanı:** Büyük koleksiyonlar için 1-5GB alan gerekebilir
- **Thumb dosyaları:** Emby'de ek olarak thumb.jpg dosyaları bulunur

## 🚀 Hızlı Erişim

```bash
# Windows'ta hızlı erişim
cd metadata-stack\config\metadata\library\movies
cd metadata-stack\emby-config\metadata\library\movies

# Tüm afişleri listele
dir /s poster.jpg

# Belirli boyuttaki afişleri bul
dir /s poster.jpg | findstr "1,000"

# Thumb dosyalarını listele (sadece Emby)
dir /s thumb.jpg
```

## 🔄 Jellyfin'den Emby'ye Geçiş

Eğer Jellyfin'den Emby'ye geçiyorsanız:

1. **Metadata'ları kopyalayın:**
```bash
# Jellyfin metadata'larını Emby'ye kopyala
xcopy "config\metadata" "emby-config\metadata\" /e /i
```

2. **Dosya yollarını güncelleyin:**
   - Emby'de kütüphaneleri yeniden ekleyin
   - Aynı klasör yapısını kullanın

3. **Metadata'ları yeniden tarayın:**
   - Emby'de "Scan Library" butonuna tıklayın
   - Eksik metadata'lar otomatik indirilir

---

**🎬 İyi eğlenceler! Film koleksiyonunuzun keyfini çıkarın!**