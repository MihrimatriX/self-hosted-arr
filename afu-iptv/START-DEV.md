# 🚀 Development Sunucusunu Başlatma

## Adım Adım Talimatlar

### 1. Doğru Dizine Gidin
```powershell
cd C:\Users\AFU\Desktop\self-hosted-arr\afu-iptv
```

### 2. Önbelleği Temizleyin (İsteğe Bağlı)
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### 3. Development Sunucusunu Başlatın
```powershell
npm run dev
```

### 4. Tarayıcıda Açın
```
http://localhost:3000
```

## Sorun Giderme

### Eğer "@tailwindcss/postcss" Hatası Alırsanız

1. **Paketlerin yüklü olduğunu kontrol edin:**
   ```powershell
   npm list @tailwindcss/postcss
   ```

2. **Eğer yüklü değilse, yeniden yükleyin:**
   ```powershell
   npm install
   ```

3. **Önbelleği temizleyin:**
   ```powershell
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

### Eğer Port 3000 Kullanımda İse

```powershell
# Farklı bir port kullanın
npm run dev -- -p 3001
```

### Node Modules Sorunları

Eğer garip hatalar alıyorsanız, tam temizlik yapın:

```powershell
# node_modules ve lock dosyasını silin
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Yeniden yükleyin
npm install
npm run dev
```

## Production Build

Sunucuya deploy etmeden önce test edin:

```powershell
# Build yapın
npm run build

# Production modda çalıştırın
npm run start
```

## Docker ile Çalıştırma

```powershell
# Build edin
docker compose build --no-cache

# Başlatın
docker compose up -d

# Logları görüntüleyin
docker compose logs -f tv-service
```

## Port ve URL Yapılandırması

Development'ta varsayılan port: **3000**
Production'da Docker port: **3444** (dışarıdan)

`.env` dosyanızda:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000    # Development
NEXT_PUBLIC_APP_URL=https://teve.ahmetfuzunkaya.com  # Production
```

## Hızlı Komutlar

```powershell
# Development
cd afu-iptv && npm run dev

# Build & Test
cd afu-iptv && npm run build && npm run start

# Docker Build
cd afu-iptv && docker compose build --no-cache

# Docker Start
cd afu-iptv && docker compose up -d

# Docker Logs
cd afu-iptv && docker compose logs -f

# Docker Stop
cd afu-iptv && docker compose down
```

