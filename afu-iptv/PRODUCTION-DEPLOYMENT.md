# Production Deployment Guide

Bu rehber, AFU IPTV uygulamasını production ortamında deploy etmek için gerekli adımları açıklar.

## Ön Gereksinimler

1. **Docker ve Docker Compose** kurulu olmalı
2. **Domain ve SSL sertifikası** (HTTPS gerekli)
3. **Reverse Proxy** (Nginx, Traefik, vb.)

## Environment Variables

`.env` dosyasında aşağıdaki değişkenleri tanımlayın:

```bash
# Xtream API Configuration
XTREAM_API_BASE=http://tgrpro25.xyz:8080/player_api.php
XTREAM_USERNAME=your_username
XTREAM_PASSWORD=your_password
XTREAM_SESSION_COOKIE=optional_session_cookie

# App Configuration
NEXT_PUBLIC_APP_URL=https://teve.ahmetfuzunkaya.com

# Proxy Configuration (Optional)
XTREAM_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0
XTREAM_STREAM_REFERER=
USE_DIRECT_STREAMING=false
```

## Deployment Adımları

### 1. Kodu Güncelle
```bash
git pull origin main
```

### 2. Docker Image'ı Build Et
```bash
docker-compose build --no-cache
```

### 3. Container'ı Yeniden Başlat
```bash
docker-compose down
docker-compose up -d
```

### 4. Logları Kontrol Et
```bash
docker-compose logs -f tv-service
```

## Debug ve Test

### Health Check
```bash
curl https://teve.ahmetfuzunkaya.com/api/health
```

### Proxy Test
```bash
curl "https://teve.ahmetfuzunkaya.com/api/proxy/test?url=http%3A%2F%2Ftgrpro25.xyz%3A8080%2Flive%2FMustafa0301%2F03012025%40xyz%2F433.m3u8"
```

### PowerShell Test Script
```powershell
.\test-production-proxy.ps1
```

## Yaygın Sorunlar ve Çözümleri

### 1. Proxy Hatası (403/404)
- **Sebep**: Xtream servisi Node.js isteklerini engelliyor
- **Çözüm**: 
  - `XTREAM_SESSION_COOKIE` environment variable'ını ayarlayın
  - `XTREAM_USER_AGENT`'ı güncelleyin
  - `USE_DIRECT_STREAMING=true` yaparak proxy'yi bypass edin

### 2. CORS Hatası
- **Sebep**: Browser CORS politikaları
- **Çözüm**: Next.js config'de CORS headers zaten ayarlanmış

### 3. Timeout Hatası
- **Sebep**: Yavaş Xtream servisi
- **Çözüm**: Health check timeout'u 10 saniyeye çıkarıldı

### 4. SSL/HTTPS Sorunları
- **Sebep**: HTTPS gereksinimleri
- **Çözüm**: Reverse proxy ile SSL termination yapın

## Monitoring

### Log Monitoring
```bash
# Real-time logs
docker-compose logs -f tv-service

# Error logs only
docker-compose logs tv-service 2>&1 | grep -i error

# Proxy specific logs
docker-compose logs tv-service 2>&1 | grep -i proxy
```

### Performance Monitoring
- Health check endpoint'i kullanarak uptime monitoring
- Proxy response time'ları için debug headers'ı kontrol edin

## Güvenlik

1. **Environment Variables**: Hassas bilgileri `.env` dosyasında saklayın
2. **Firewall**: Sadece gerekli portları açın (80, 443)
3. **SSL**: Mutlaka HTTPS kullanın
4. **Updates**: Düzenli olarak güncelleme yapın

## Backup

```bash
# Environment backup
cp .env .env.backup

# Docker volumes backup (eğer varsa)
docker run --rm -v tv-service_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

## Rollback

Eğer bir sorun olursa:

```bash
# Önceki versiyona dön
git checkout previous-commit-hash
docker-compose build --no-cache
docker-compose up -d
```

## Support

Sorun yaşarsanız:
1. Logları kontrol edin
2. Health check endpoint'ini test edin
3. Proxy test endpoint'ini kullanın
4. Debug mode'u aktifleştirin (`?debug=1`)
