# 🎬 Jellyfin Metadata Stack - Kurulum Rehberi

## 📁 Windows Harddisk Yolları

### 1. `.env` Dosyası Oluşturun

`metadata-stack` klasöründe `.env` dosyası oluşturun ve şu içeriği ekleyin:

```env
# Film klasörünüzün tam yolu (Windows için)
MOVIES_PATH=C:\Users\AFU\Videos\Movies

# TV dizileri klasörünüzün tam yolu (Windows için)  
TV_PATH=C:\Users\AFU\Videos\TV

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

### 2. Windows Harddisk Yolları

#### 🔍 Harddisk Yolunuzu Bulun

**Yöntem 1: Dosya Gezgini**
1. Film klasörünüze gidin
2. Adres çubuğuna tıklayın
3. Tam yolu kopyalayın (örnek: `C:\Users\AFU\Videos\Movies`)

**Yöntem 2: PowerShell**
```powershell
# Mevcut dizini göster
pwd

# Belirli bir klasörün yolunu göster
Get-Location
```

#### 📂 Yaygın Windows Yolları

```env
# C: sürücüsünde
MOVIES_PATH=C:\Movies
MOVIES_PATH=C:\Users\AFU\Videos\Movies
MOVIES_PATH=C:\Users\AFU\Desktop\Movies

# D: sürücüsünde
MOVIES_PATH=D:\Movies
MOVIES_PATH=D:\Videos\Movies
MOVIES_PATH=D:\Media\Movies

# E: sürücüsünde
MOVIES_PATH=E:\Movies
MOVIES_PATH=E:\Entertainment\Movies
```

### 3. Docker Desktop Ayarları

**Önemli:** Docker Desktop'ta klasör paylaşımını aktif edin:

1. Docker Desktop'ı açın
2. Settings → Resources → File Sharing
3. Film klasörünüzün bulunduğu sürücüyü seçin
4. "Apply & Restart" butonuna tıklayın

### 4. Stack'i Başlatın

```bash
cd metadata-stack
docker-compose up -d
```

### 5. Jellyfin'e Erişin

Tarayıcınızda: `http://localhost:8096`

## ⚠️ Önemli Notlar

### Windows Yol Formatı
- ✅ Doğru: `C:\Users\AFU\Videos\Movies`
- ❌ Yanlış: `C:/Users/AFU/Videos/Movies`
- ❌ Yanlış: `/c/Users/AFU/Videos/Movies`

### Klasör İzinleri
- Film klasörünüzün Docker tarafından okunabilir olduğundan emin olun
- Gerekirse klasöre sağ tıklayın → Properties → Security → Edit

### Network Ayarları
- Eğer `proxy-network` bulunamıyor hatası alırsanız:
```bash
docker network create proxy-network
```

## 🎯 İlk Kurulum Sonrası

1. **Admin kullanıcısı oluşturun**
2. **Kütüphane ekleyin:**
   - Movies klasörünü seçin (`/data/movies`)
   - Content type: "Movies" seçin
   - Metadata providers: TMDB, IMDb seçin
3. **Otomatik tarama ayarları:**
   - Settings → Library → Enable real-time monitoring
   - Settings → Library → Enable automatic library updates

## 🔧 Sorun Giderme

### "Path not found" Hatası
- `.env` dosyasındaki yolları kontrol edin
- Docker Desktop'ta sürücü paylaşımını kontrol edin

### "Permission denied" Hatası
- Klasör izinlerini kontrol edin
- Docker Desktop'ı yönetici olarak çalıştırın

### Filmler Görünmüyor
- Klasör yapısını kontrol edin
- Jellyfin'de "Scan Library" butonuna tıklayın
