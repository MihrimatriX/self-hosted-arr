# 🎬 Metadata Extraction Scripts

Bu klasör, Emby ve Jellyfin'den film metadata'larını ve afişlerini çıkarmak için geliştirilmiş Python scriptlerini içerir.

## 📁 Script Dosyaları

### 1. `metadata-extractor.py`
**Ana metadata çıkarıcı script**

Emby ve Jellyfin veritabanlarından film bilgilerini çıkarır ve JSON formatında kaydeder.

**Özellikler:**
- ✅ Emby ve Jellyfin desteği
- ✅ SQLite veritabanı okuma
- ✅ Film bilgileri (isim, yıl, tür, puan, özet)
- ✅ Görsel dosya yolları (poster, backdrop, logo, fanart, thumb)
- ✅ Metadata hash hesaplama
- ✅ JSON çıktı formatı
- ✅ Detaylı raporlama

**Kullanım:**
```bash
# Emby'den metadata çıkar
python metadata-extractor.py --source emby --output ./extracted --images --report

# Jellyfin'den metadata çıkar
python metadata-extractor.py --source jellyfin --output ./extracted --images --report

# Her ikisinden de çıkar
python metadata-extractor.py --source both --output ./extracted --images --report
```

### 2. `poster-organizer.py`
**Poster organizatör script**

Çıkarılan metadata'ları ve görselleri farklı kriterlere göre organize eder.

**Özellikler:**
- ✅ İsme göre organizasyon
- ✅ Yıla göre organizasyon
- ✅ Türe göre organizasyon
- ✅ Puana göre organizasyon
- ✅ Yüksek kaliteli görselleri ayırma
- ✅ Eksik görselleri bulma
- ✅ Detaylı organizasyon raporu

**Kullanım:**
```bash
# Tüm organizasyonları yap
python poster-organizer.py --input ./extracted --output ./organized --all --report

# Sadece isme göre organize et
python poster-organizer.py --input ./extracted --output ./organized --by-name

# Yüksek kaliteli görselleri ayır
python poster-organizer.py --input ./extracted --output ./organized --high-quality
```

### 3. `batch-processor.py`
**Toplu işlem yöneticisi**

Diğer scriptleri koordine ederek tam bir işlem hattı sağlar.

**Özellikler:**
- ✅ Tam otomatik işlem hattı
- ✅ Metadata çıkarma + organizasyon
- ✅ Hata yönetimi
- ✅ İlerleme takibi
- ✅ Özet raporlama
- ✅ Geçici dosya temizliği

**Kullanım:**
```bash
# Tam işlem hattı (önerilen)
python batch-processor.py --full-pipeline

# Sadece metadata çıkar
python batch-processor.py --extract-only

# Sadece organize et
python batch-processor.py --organize-only --input ./extracted
```

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
```bash
# Python 3.7+ gerekli
python --version

# Gerekli modüller (genellikle Python ile birlikte gelir)
# - sqlite3
# - json
# - pathlib
# - shutil
# - argparse
# - hashlib
# - datetime
```

### 2. Temel Kullanım
```bash
# 1. Scripts klasörüne git
cd metadata-stack/scripts

# 2. Tam işlem hattını çalıştır
python batch-processor.py --full-pipeline

# 3. Sonuçları kontrol et
ls ../extracted/
```

### 3. Çıktı Yapısı
```
extracted/
├── metadata/
│   ├── emby_movies.json      # Emby film bilgileri
│   └── jellyfin_movies.json  # Jellyfin film bilgileri
├── posters/                  # Poster görselleri
├── backdrops/               # Backdrop görselleri
├── logos/                   # Logo görselleri
├── fanarts/                 # Fanart görselleri
├── thumbs/                  # Thumb görselleri (sadece Emby)
├── organized/               # Organize edilmiş dosyalar
│   ├── by-name/            # İsme göre
│   ├── by-year/            # Yıla göre
│   ├── by-genre/           # Türe göre
│   ├── by-rating/          # Puana göre
│   ├── high-quality/       # Yüksek kaliteli
│   └── missing-images/     # Eksik görseller
└── reports/                # Raporlar
    ├── emby_report.json
    ├── jellyfin_report.json
    └── organization_report.json
```

## 📊 Rapor Örnekleri

### Metadata Raporu
```json
{
  "extraction_date": "2024-01-15T10:30:00",
  "source": "emby",
  "total_movies": 150,
  "movies_with_posters": 145,
  "movies_with_backdrops": 140,
  "movies_with_logos": 120,
  "movies_with_fanarts": 130,
  "movies_with_thumbs": 145,
  "genres": {
    "Action": 45,
    "Drama": 30,
    "Comedy": 25
  },
  "years": {
    "2023": 20,
    "2022": 25,
    "2021": 15
  }
}
```

### Organizasyon Raporu
```json
{
  "organization_date": "2024-01-15T10:35:00",
  "total_movies": 150,
  "organization_stats": {
    "by_name": 150,
    "by_year": 150,
    "by_genre": 150,
    "by_rating": 120,
    "high_quality": 140,
    "missing_images": 10
  },
  "image_stats": {
    "with_poster": 145,
    "with_backdrop": 140,
    "with_logo": 120,
    "with_fanart": 130,
    "with_thumb": 145
  }
}
```

## 🔧 Gelişmiş Kullanım

### Sadece Belirli Kaynaklardan Çıkarma
```bash
# Sadece Emby
python metadata-extractor.py --source emby --output ./emby-only

# Sadece Jellyfin
python metadata-extractor.py --source jellyfin --output ./jellyfin-only
```

### Özel Organizasyon
```bash
# Sadece türe göre organize et
python poster-organizer.py --input ./extracted --output ./organized --by-genre

# Eksik görselleri bul
python poster-organizer.py --input ./extracted --output ./organized --missing-images
```

### Toplu İşlem Seçenekleri
```bash
# Görselleri kopyalamadan sadece metadata
python batch-processor.py --extract-only --no-images

# Tam organizasyon yapmadan
python batch-processor.py --full-pipeline --no-full-org

# Temizlik yapmadan
python batch-processor.py --full-pipeline --no-cleanup
```

## 🐛 Sorun Giderme

### "Veritabanı bulunamadı" Hatası
```bash
# Emby veritabanı yolu kontrol et
ls metadata-stack/emby-config/data/library.db

# Jellyfin veritabanı yolu kontrol et
ls metadata-stack/config/data/library.db
```

### "Permission denied" Hatası
```bash
# Windows'ta yönetici olarak çalıştır
# Linux/Mac'te izinleri kontrol et
chmod +x *.py
```

### "Module not found" Hatası
```bash
# Python modüllerini kontrol et
python -c "import sqlite3, json, pathlib, shutil, argparse, hashlib, datetime"
```

### Boş Sonuçlar
- Emby/Jellyfin'in çalıştığından emin olun
- Film kütüphanelerinin tarandığından emin olun
- Veritabanı dosyalarının güncel olduğundan emin olun

## 📝 Notlar

### Performans
- Büyük koleksiyonlar için işlem süresi uzun olabilir
- SSD kullanımı önerilir
- Yeterli disk alanı olduğundan emin olun

### Güvenlik
- Scriptler sadece okuma yapar, orijinal dosyaları değiştirmez
- Yedekleme önerilir
- Güvenilir kaynaklardan çalıştırın

### Uyumluluk
- Python 3.7+ gerekli
- Windows, Linux, macOS desteklenir
- Emby 4.0+ ve Jellyfin 10.0+ test edilmiştir

## 🎯 Kullanım Senaryoları

### 1. Film Koleksiyonu Yedekleme
```bash
# Tüm metadata'ları ve görselleri yedekle
python batch-processor.py --full-pipeline
```

### 2. Eksik Görselleri Bulma
```bash
# Hangi filmlerin eksik görselleri var?
python poster-organizer.py --input ./extracted --output ./organized --missing-images
```

### 3. Türe Göre Organizasyon
```bash
# Filmleri türlerine göre ayır
python poster-organizer.py --input ./extracted --output ./organized --by-genre
```

### 4. Yüksek Kaliteli Görselleri Ayırma
```bash
# En kaliteli görsellere sahip filmleri ayır
python poster-organizer.py --input ./extracted --output ./organized --high-quality
```

### 5. Sadece Metadata Çıkarma
```bash
# Görselleri kopyalamadan sadece bilgileri çıkar
python metadata-extractor.py --source both --output ./metadata-only
```

---

**🎬 İyi eğlenceler! Film koleksiyonunuzun metadata'larını keyifle organize edin!**
