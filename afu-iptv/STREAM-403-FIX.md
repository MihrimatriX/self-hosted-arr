# 🔧 403 Forbidden Sorunu - Video Segment'leri

## 🔍 Sorunun Analizi

**Durum:**
- ✅ M3U8 playlist dosyaları çalışıyor (200 OK)
- ❌ TS segment dosyaları 403 alıyor (Forbidden)

**Debug Log'larından:**
```
retryStage: 'no-referer'
status: 403
server: cloudflare -> nginx/1.26.2
```

## 🎯 Olası Sebepler

### 1. Token Expiry (En Muhtemel)
URL'deki `token` ve `lvtoken` parametreleri süreli. Token expire olduğunda segment'ler 403 döner.

**Çözüm:**
- Yeni bir m3u8 playlist çekin (tokenlar yenilenir)
- Direkt Xtream API'den stream URL'i alın

### 2. Cloudflare Rate Limiting
Cloudflare arkasında olduğu için rate limiting yapıyor olabilir.

**Çözüm:**
- Request'ler arası delay ekleyin
- Cache mekanizması ekleyin

### 3. Hotlink Protection
Nginx'te hotlink protection aktif olabilir.

**Çözüm:**
- Doğru Referer header gönderin
- Cookie ekleyin (session)

### 4. IP/Location Kontrolü
Upstream sunucu IP veya location kontrolü yapıyor olabilir.

**Çözüm:**
- VPN/Proxy kullanın
- Farklı User-Agent deneyin

## 🔧 Hızlı Testler

### Test 1: Direkt Tarayıcıda Açın
```
http://tgrpro25.xyz:8080/live/Mustafa0301/03012025@xyz/307968.m3u8
```

1. Bu URL'i Chrome'da açın
2. Developer Tools > Network > Media sekmesi
3. TS segment'lerini izleyin - 403 alıyor mu?
4. Eğer tarayıcıda çalışıyorsa, **Request Headers**'ı kopyalayın

### Test 2: Yeni Token Alın
```bash
# Yeni bir stream URL'i alın
curl "http://tgrpro25.xyz:8080/player_api.php?username=Mustafa0301&password=03012025@xyz&action=get_live_streams&category_id=CATEGORY_ID"
```

### Test 3: Session Cookie Ekleyin

1. **Tarayıcıda stream'i açın** (çalışıyorsa)
2. **Developer Tools > Application > Cookies**
3. **`tgrpro25.xyz` için tüm cookie'leri kopyalayın**
4. **`.env` dosyasına ekleyin:**

```env
XTREAM_SESSION_COOKIE=capp_name_session=YOUR_COOKIE_VALUE_HERE
```

### Test 4: Curl ile Doğrudan Test

```bash
# TS segment'i direkt curl ile test edin
curl -v "http://tgrpro25.xyz:8080/play/hls-nginx/.../file.ts?token=..." \
  -H "User-Agent: Mozilla/5.0 ..." \
  -H "Referer: http://tgrpro25.xyz:8080/"
```

## 🚀 Önerilen Çözümler

### Çözüm 1: Token Yenileme Mekanizması (En İyi)

Proxy'de token expire olduğunu algılayın ve yenileyin:

```typescript
// src/app/api/proxy/stream/route.ts
if (upstreamResponse.status === 403) {
  // Token expire olmuş olabilir
  // Yeni m3u8 playlist alıp token'ı yenile
  console.log("Token may be expired, consider refreshing");
}
```

### Çözüm 2: Cookie Forwarding

`.env` dosyanıza session cookie ekleyin:

```env
XTREAM_SESSION_COOKIE=capp_name_session=YOUR_VALUE; other_cookie=value
```

### Çözüm 3: Direct Streaming (Proxy Bypass)

Proxy'yi bypass edin, direkt Xtream'den stream edin:

```typescript
// VideoPlayer.tsx
const directStreamUrl = `http://tgrpro25.xyz:8080/live/${username}/${password}/${streamId}.m3u8`;
```

### Çözüm 4: Upstream Headers İyileştirme

Proxy'de daha fazla header forward edin:

```typescript
// Referer'ı origin'e ayarla
upstreamHeaders.set("Referer", targetUrl.origin + "/");

// Host header
upstreamHeaders.set("Host", targetUrl.host);

// Connection
upstreamHeaders.set("Connection", "keep-alive");
```

## 📝 Debug Adımları

### 1. .env Dosyası Oluşturun

```env
XTREAM_API_BASE=http://tgrpro25.xyz:8080/player_api.php
XTREAM_USERNAME=Mustafa0301
XTREAM_PASSWORD=03012025@xyz
XTREAM_SESSION_COOKIE=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Sunucuyu Yeniden Başlatın

```bash
cd afu-iptv
npm run dev
```

### 3. Health Check

```
http://localhost:3002/api/health
```

### 4. Proxy Test

```
http://localhost:3002/api/proxy/stream?url=STREAM_URL&debug=1
```

## 🎯 Sonuç

**Ana Sorun:** Video segment'leri için token expire oluyor veya ek güvenlik kontrolü yapılıyor.

**En İyi Çözüm:** 
1. Yeni token almak için playlist'i yenileyin
2. Session cookie ekleyin (tarayıcıdan kopyalayın)
3. Direkt streaming'e geçin (proxy bypass)

## 🆘 Hala Çalışmıyor mu?

1. Tarayıcıda stream URL'ini açın
2. Developer Tools > Network > Copy as cURL
3. cURL komutunu bana gönderin
4. Hangi headers ile çalıştığını görelim

