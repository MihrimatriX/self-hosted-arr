# 🎬 Jellyfin Metadata Stack

Bu stack, film koleksiyonunuz için otomatik metadata çekme ve yönetim sağlar.

## 🚀 Kurulum

### 1. Film Klasörünüzü Yapılandırın

`docker-compose.yml` dosyasında şu satırları düzenleyin:

```yaml
volumes:
  - /path/to/your/movies:/data/movies:ro  # Film klasörünüzün yolunu buraya yazın
  - /path/to/your/tv:/data/tvshows:ro     # TV dizileri klasörünüzün yolunu buraya yazın
```

**Windows için örnek:**
```yaml
volumes:
  - C:\Users\AFU\Videos\Movies:/data/movies:ro
  - C:\Users\AFU\Videos\TV:/data/tvshows:ro
```

### 2. Stack'i Başlatın

```bash
cd metadata-stack
docker-compose up -d
```

### 3. Jellyfin'e Erişin

Tarayıcınızda şu adrese gidin: `http://localhost:8096`

## ⚙️ İlk Kurulum

1. **Admin kullanıcısı oluşturun**
2. **Kütüphane ekleyin:**
   - Movies klasörünü seçin
   - Content type: "Movies" seçin
   - Metadata providers: TMDB, IMDb, vb. seçin
3. **Otomatik tarama ayarlarını yapın:**
   - Settings → Library → Enable real-time monitoring
   - Settings → Library → Enable automatic library updates

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

## 🔧 Sorun Giderme

- **Filmler görünmüyor:** Klasör izinlerini kontrol edin
- **Metadata çekilmiyor:** Internet bağlantınızı kontrol edin
- **Yavaş tarama:** Büyük koleksiyonlar için sabırlı olun

## 🌐 Erişim

- **Web UI:** http://localhost:8096
- **HTTPS:** https://localhost:8920
- **Mobile Apps:** Jellyfin uygulamasını indirin
