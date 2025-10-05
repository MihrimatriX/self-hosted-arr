# 🔧 Sorun Giderme Kılavuzu

## Sunucuda Çalışmıyor?

### 1. Environment Variables Kontrolü

**Önce bu endpoint'i tarayıcınızda açın:**
```
https://teve.ahmetfuzunkaya.com/api/health
```

Bu size şunları gösterecek:
- Environment variables doğru ayarlanmış mı?
- Xtream API'ye erişilebiliyor mu?
- Sunucu yapılandırması doğru mu?

**Beklenen çıktı:**
```json
{
  "status": "ok",
  "diagnostics": {
    "environment": {
      "NODE_ENV": "production",
      "NEXT_PUBLIC_APP_URL": "https://teve.ahmetfuzunkaya.com",
      "XTREAM_API_BASE": "http://tgrpro25.xyz:8080/player_api.php",
      "XTREAM_USERNAME": "SET",
      "XTREAM_PASSWORD": "SET"
    }
  },
  "xtream": {
    "status": "OK"
  }
}
```

### 2. .env Dosyası Kontrol Listesi

Sunucuda `.env` dosyanızı kontrol edin:

```bash
cd /path/to/afu-iptv
cat .env
```

**Olması gereken değerler:**
```env
# Xtream API bilgileri
XTREAM_API_BASE=http://tgrpro25.xyz:8080/player_api.php
XTREAM_USERNAME=kullanici_adiniz
XTREAM_PASSWORD=sifreniz
XTREAM_SESSION_COOKIE=

# ÇOK ÖNEMLİ: Sunucu URL'iniz (https:// ile başlamalı)
NEXT_PUBLIC_APP_URL=https://teve.ahmetfuzunkaya.com

NODE_ENV=production
```

### 3. Docker Container'ı Yeniden Build Edin

Environment variables'ı güncellediyseniz **mutlaka** yeniden build yapmalısınız:

```bash
cd /path/to/afu-iptv

# Container'ı durdurun
docker compose down

# Image'ı temizleyin
docker rmi afu-iptv-tv-service

# Yeniden build ve başlatın
docker compose build --no-cache
docker compose up -d
```

### 4. Log'ları Kontrol Edin

```bash
# Container log'larını görüntüleyin
docker compose logs -f tv-service

# Specific hata mesajlarını arayın
docker compose logs tv-service | grep -i error
docker compose logs tv-service | grep -i "\[Proxy\]"
```

### 5. Debug Mode'u Aktif Edin

Development mode'da çalıştırarak daha fazla bilgi alın:

```bash
# docker-compose.yml'de NODE_ENV'i geçici olarak development yapın
# Sonra:
docker compose down
docker compose up -d
docker compose logs -f
```

### 6. Stream URL'lerini Test Edin

Tarayıcınızda bir stream URL'ini test edin:

```
https://teve.ahmetfuzunkaya.com/api/proxy/stream?url=http://tgrpro25.xyz:8080/live/USERNAME/PASSWORD/STREAM_ID.m3u8&debug=1
```

Bu size detaylı debug bilgileri verecek.

## Yaygın Sorunlar ve Çözümleri

### ❌ Sorun: "Stream not available"
**Çözüm:**
1. Xtream API bilgilerinizi kontrol edin
2. Sunucunuzun Xtream servisine erişebildiğinden emin olun
3. Firewall kurallarını kontrol edin

### ❌ Sorun: "CORS Error"
**Çözüm:**
- `NEXT_PUBLIC_APP_URL` değişkeninin **tam URL** olarak ayarlandığından emin olun
- Container'ı yeniden build edin

### ❌ Sorun: Kanallar yükleniyor ama oynatılmıyor
**Çözüm:**
1. Browser Console'u açın (F12)
2. Network tabını kontrol edin
3. `/api/proxy/stream` endpoint'ine yapılan isteklerin durumunu kontrol edin
4. Hata mesajlarını okuyun

### ❌ Sorun: "Connection refused" veya "ECONNREFUSED"
**Çözüm:**
- Sunucunuzun internete çıkışı var mı kontrol edin
- Xtream servisinin çalışır durumda olduğundan emin olun
- DNS çözümlemesi çalışıyor mu test edin:
  ```bash
  docker exec tv-service ping -c 3 tgrpro25.xyz
  ```

### ❌ Sorun: Build zamanında environment variables okunmuyor
**Çözüm:**
- `NEXT_PUBLIC_` ile başlayan değişkenler build zamanında embed edilir
- Değiştirdiyseniz **mutlaka** yeniden build yapmalısınız:
  ```bash
  docker compose build --no-cache
  ```

## Detaylı Test Komutları

### Container içinde test:
```bash
# Container'a girin
docker exec -it tv-service sh

# Environment variables'ı kontrol edin
printenv | grep XTREAM
printenv | grep NEXT_PUBLIC

# Network testi
ping -c 3 tgrpro25.xyz
wget -O- http://tgrpro25.xyz:8080/player_api.php?username=X&password=X&action=get_live_categories
```

### Dışarıdan test:
```bash
# Health check
curl https://teve.ahmetfuzunkaya.com/api/health

# Xtream API endpoint test
curl https://teve.ahmetfuzunkaya.com/api/xtream

# Proxy test (gerçek değerlerle değiştirin)
curl "https://teve.ahmetfuzunkaya.com/api/proxy/stream?url=http://tgrpro25.xyz:8080/live/USER/PASS/123.m3u8&debug=1"
```

## Yardım Alın

Sorun devam ediyorsa:

1. `/api/health` endpoint'inin çıktısını kaydedin
2. Docker logs çıktısını kaydedin: `docker compose logs > logs.txt`
3. Browser console'daki hataları screenshot alın
4. Yukarıdaki bilgilerle destek isteyin

## Güvenlik Uyarıları

⚠️ **DİKKAT:**
- `.env` dosyanızı asla paylaşmayın
- Debug mode'u production'da aktif bırakmayın
- Log dosyalarında kullanıcı adı/şifre aramalarını gizleyin

