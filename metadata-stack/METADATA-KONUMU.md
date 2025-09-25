# 📁 Jellyfin Metadata ve Afiş Konumları

## 🎯 Metadata Dosyalarının Konumu

Jellyfin tüm metadata'ları ve afişleri `./config` klasöründe saklar:

```
metadata-stack/
├── config/
│   ├── cache/                    # Önbellek dosyaları
│   ├── data/                     # Ana metadata veritabanı
│   ├── logs/                     # Log dosyaları
│   ├── metadata/                 # 🎬 BURADA AFİŞ VE COVER'LAR!
│   │   ├── library/              # Kütüphane metadata'ları
│   │   │   ├── movies/           # Film afişleri ve bilgileri
│   │   │   │   ├── [Film ID]/
│   │   │   │   │   ├── poster.jpg        # 🖼️ ANA AFİŞ
│   │   │   │   │   ├── backdrop1.jpg     # 🖼️ ARKA PLAN
│   │   │   │   │   ├── fanart.jpg        # 🖼️ FAN ART
│   │   │   │   │   ├── logo.png          # 🖼️ LOGO
│   │   │   │   │   └── metadata.json     # 📄 Film bilgileri
│   │   │   └── tvshows/          # TV dizisi afişleri
│   │   │       └── [Dizi ID]/
│   │   │           ├── poster.jpg
│   │   │           ├── backdrop1.jpg
│   │   │           └── seasons/
│   │   │               └── [Sezon ID]/
│   │   │                   └── poster.jpg
│   │   └── people/               # Oyuncu fotoğrafları
│   │       └── [Oyuncu ID]/
│   │           └── profile.jpg
│   └── root/                     # Sistem dosyaları
```

## 🖼️ Afiş ve Cover Dosyaları

### Film Afişleri
- **Ana Afiş:** `config/metadata/library/movies/[Film ID]/poster.jpg`
- **Arka Plan:** `config/metadata/library/movies/[Film ID]/backdrop1.jpg`
- **Fan Art:** `config/metadata/library/movies/[Film ID]/fanart.jpg`
- **Logo:** `config/metadata/library/movies/[Film ID]/logo.png`

### TV Dizisi Afişleri
- **Dizi Afişi:** `config/metadata/library/tvshows/[Dizi ID]/poster.jpg`
- **Sezon Afişi:** `config/metadata/library/tvshows/[Dizi ID]/seasons/[Sezon ID]/poster.jpg`

### Oyuncu Fotoğrafları
- **Profil:** `config/metadata/library/people/[Oyuncu ID]/profile.jpg`

## 🔍 Film ID'sini Bulma

### Yöntem 1: Jellyfin Web Arayüzü
1. Jellyfin'e gidin (`http://localhost:8096`)
2. Filme tıklayın
3. URL'deki ID'yi kopyalayın: `http://localhost:8096/web/index.html#!/item.html?id=12345`

### Yöntem 2: Dosya Adından
Film ID'si genellikle dosya adında görünür:
```
config/metadata/library/movies/12345/
```

### Yöntem 3: Metadata JSON'dan
```bash
# Film klasörüne gidin
cd config/metadata/library/movies/

# Her klasörde metadata.json dosyasını kontrol edin
cat */metadata.json | grep "Name"
```

## 📂 Afiş Dosyalarını Kopyalama

### Windows PowerShell ile
```powershell
# Tüm film afişlerini kopyala
Copy-Item "config\metadata\library\movies\*\poster.jpg" -Destination "C:\Afişler\" -Recurse

# Belirli bir filmin afişini kopyala
Copy-Item "config\metadata\library\movies\12345\poster.jpg" -Destination "C:\Afişler\FilmAdi.jpg"
```

### Command Prompt ile
```cmd
# Tüm afişleri kopyala
xcopy "config\metadata\library\movies\*\poster.jpg" "C:\Afişler\" /s

# Belirli afişi kopyala
copy "config\metadata\library\movies\12345\poster.jpg" "C:\Afişler\FilmAdi.jpg"
```

## 🎨 Afiş Dosya Türleri

### Poster (Ana Afiş)
- **Boyut:** Genellikle 1000x1500 piksel
- **Format:** JPG
- **Kullanım:** Ana afiş, küçük resimler

### Backdrop (Arka Plan)
- **Boyut:** Genellikle 1920x1080 piksel
- **Format:** JPG
- **Kullanım:** Arka plan, büyük görüntüler

### Fan Art
- **Boyut:** Değişken
- **Format:** JPG
- **Kullanım:** Özel sanat çalışmaları

### Logo
- **Boyut:** Değişken
- **Format:** PNG (şeffaf arka plan)
- **Kullanım:** Logo, başlık

## 🔧 Metadata Ayarları

Jellyfin'de metadata indirme ayarları:

1. **Settings → Library → Metadata**
2. **Image fetchers** bölümünde:
   - ✅ **TMDB Box Sets** (afişler için)
   - ✅ **TMDB** (ana metadata)
   - ✅ **Fanart.tv** (fan art için)
   - ✅ **OMDb** (ek bilgiler)

## 📱 Mobil Uygulamalar için

Afişleri mobil uygulamalarda kullanmak için:

1. **Boyutları optimize edin:**
   - Poster: 500x750 piksel
   - Backdrop: 1280x720 piksel

2. **Format dönüştürün:**
   - WebP formatı daha küçük dosya boyutu
   - PNG şeffaflık için

## ⚠️ Önemli Notlar

- **Dosya boyutları:** Afişler genellikle 200KB-2MB arası
- **Güncelleme:** Yeni metadata'lar otomatik indirilir
- **Yedekleme:** `config` klasörünü yedekleyin
- **Disk alanı:** Büyük koleksiyonlar için 1-5GB alan gerekebilir

## 🚀 Hızlı Erişim

```bash
# Windows'ta hızlı erişim
cd metadata-stack\config\metadata\library\movies

# Tüm afişleri listele
dir /s poster.jpg

# Belirli boyuttaki afişleri bul
dir /s poster.jpg | findstr "1,000"
```
