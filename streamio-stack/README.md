# Stremio Stack

Bu Docker Compose yapılandırması, kendi sunucunuzda Stremio'yu host etmenizi sağlar.

## 🚀 Kurulum

```bash
docker-compose up -d
```

## 📱 Erişim

- **Stremio Web (Güvenli)**: http://localhost (nginx proxy ile)
- **Stremio Web (Direkt)**: http://localhost:3579
- **Stremio Server**: http://localhost:11470

## 🔐 Güvenlik

- **IP Whitelist**: Sadece izin verilen IP'ler erişebilir
- **Rate Limiting**: Dakikada 10 istek sınırı
- **Basic Auth**: admin/stremio123 (değiştirin!)
- **Güvenlik Headers**: XSS, CSRF koruması

## 🔌 Eklenti Kurulumu

### Torrentio Eklentisi (Önerilen)
1. https://torrentio.strem.fun/configure adresine gidin
2. Ayarlarınızı yapın:
   - **Real-Debrid API Key**: (opsiyonel, daha hızlı akış için)
   - **Quality**: 1080p, 720p, 480p
   - **Providers**: Tümünü seçin
   - **Sort**: Seeders
3. "Install" butonuna tıklayın

### Diğer Faydalı Eklentiler
- **OpenSubtitles**: https://opensubtitles.strem.fun/manifest.json
- **TMDB**: https://tmdb.strem.fun/manifest.json
- **YouTube**: https://youtube.strem.fun/manifest.json

### Eklenti Kurulum Adımları
1. Stremio'ya http://localhost:3001 adresinden erişin
2. Sol menüden "Addons" sekmesine gidin
3. "Community Addons" bölümünde eklentiyi arayın
4. "Install" butonuna tıklayın

## ⚙️ Yapılandırma

- **Web Port**: 3579 (direkt), 80 (nginx proxy)
- **Server Port**: 11470
- **Cache Size**: 1GB (1073741824 bytes)
- **Volume**: `./stremio-data` klasöründe veriler saklanır
- **Network**: `proxy-network` kullanır

## 💾 Cache Yönetimi

### Cache Boyutu
- **Mevcut**: 1GB
- **Dolma Süresi**: Kullanıma bağlı (genellikle 1-2 hafta)
- **Otomatik Temizlik**: Cache dolduğunda eski dosyalar silinir

### Cache Temizleme
```bash
# Manuel cache temizleme
./scripts/clear-cache.sh

# Veya Docker ile
docker-compose exec stremio rm -rf /root/.stremio-server/cache/*
```

### Cache İzleme
```bash
# Disk kullanımını kontrol et
du -sh ./stremio-data/

# Cache boyutunu kontrol et
du -sh ./stremio-data/cache/
```

## 🔒 Güvenlik

- Sadece yasal içerikler için kullanın
- Telif hakkı ihlali yapmaktan kaçının
- Yerel yasalara uyun
- VPN kullanmanız önerilir

## 🆘 Sorun Giderme

```bash
# Logları kontrol edin
docker-compose logs stremio

# Yeniden başlatın
docker-compose restart stremio

# Tamamen yeniden başlatın
docker-compose down && docker-compose up -d
```

## 💡 İpuçları

- **Real-Debrid**: Daha hızlı ve kesintisiz akış için Real-Debrid kullanın
- **VPN**: Gizliliğinizi korumak için VPN kullanın
- **Kalite**: 1080p için yeterli internet hızınız olduğundan emin olun
