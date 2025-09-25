# Arr Stack Kurulumu

Bu klasör, Homarr + Sonarr + Radarr + Lidarr + Readarr + Prowlarr + Bazarr + qBittorrent + Emby + Jellyfin + Plex + Overseerr + Recyclarr + Portainer + Watchtower + Navidrome + Tautulli + Jellystat + Audiobookshelf yığınını Docker ile ayağa kaldırmak için hazırlandı.

Servislerin detaylı görevleri için `SERVICES.md` dosyasına bakabilirsiniz.

## Servislerin rolleri (kısa özet)
- Homarr: Tüm servisleri tek panelde gösteren ve hızlı erişim sağlayan dashboard.
- Sonarr: TV ve dizi içeriklerini takip eder, arar ve indirme veya aktarma sürecini otomatikleştirir.
- Radarr: Film koleksiyonunu yönetir, kalite şartlarına göre yeni sürümleri takip eder ve indirir.
- Lidarr: Müzik albümlerini sanatçı bazında izler ve yeni yayınları indirir.
- Readarr: Kitap, e-kitap veya audiobook koleksiyonunu yönetir ve yeni yayınları otomatik ekler.
- Prowlarr: Indexer yönetimini merkezi hale getirir; tüm *arr uygulamalarının arama kaynaklarını senkronize eder.
- Bazarr: Sonarr ve Radarr kütüphanesi için altyazı arar, indirir ve güncel tutar.
- qBittorrent: Torrent istemcisi; *arr uygulamalarının indirme işlemlerini yürütür.
- Emby: Medyayı çeşitli cihazlara yayınlayan freemium medya sunucusu.
- Jellyfin: Emby tabanlı, tamamen ücretsiz ve açık kaynak medya sunucusu.
- Plex: Geniş cihaz ekosistemine sahip medya sunucusu; bazı gelişmiş özellikler Plex Pass gerektirir.
- Overseerr: Kullanıcıların film, dizi, müzik ve kitap isteklerini toplayıp ilgili *arr uygulamasına iletir.
- Recyclarr: Sonarr, Radarr ve Lidarr kalite profillerini merkezi bir yapılandırmadan senkronize eder.
- Portainer: Docker konteynerlerini ve imajlarını web arayüzünden yönetmenizi sağlar.
- Watchtower: Konteyner imajlarını tarayıp güncellemeleri otomatik uygular.
- Navidrome: Müzik koleksiyonunu Spotify benzeri arayüzle stream eder.
- Tautulli: Plex izleme istatistiklerini raporlar ve bildirimler gönderir.
- Jellystat: Jellyfin oynatma verilerini toplar ve dashboard sağlar.
- Audiobookshelf: Audiobook kütüphanesini modern web ve mobil istemcilerle sunar.

## Ön koşullar
- Docker Desktop kurulu olmalı ve WSL 2 backend açık olmalı.
- `docker compose` komutu PATH içinde erişilebilir olmalı (Docker Desktop 4.24+ ile varsayılan olarak geliyor).
- Proje klasörünü NTFS diskinde tutun ve Windows kullanıcınızın tam erişimi olduğundan emin olun.

## .env dosyası (varsayılan değerler)
```
PUID=1000
PGID=1000
TZ=Europe/Istanbul

HOMARR_PORT=7575
SONARR_PORT=8989
RADARR_PORT=7878
LIDARR_PORT=8686
READARR_PORT=8787
PROWLARR_PORT=9696
BAZARR_PORT=6767
QBITTORRENT_WEBUI_PORT=8080
QBITTORRENT_BT_PORT=6881
EMBY_HTTP_PORT=8096
JELLYFIN_HTTP_PORT=8097
PLEX_HTTP_PORT=32400
OVERSEERR_PORT=5055
NAVIDROME_PORT=4533
TAUTULLI_PORT=8181
JELLYSTAT_PORT=3000
AUDIOBOOKSHELF_HTTP_PORT=13378
AUDIOBOOKSHELF_HTTPS_PORT=13379
PORTAINER_PORT=9443

CONFIG_ROOT=./config
MEDIA_MOVIES_DIR=./media/movies
MEDIA_TV_DIR=./media/tv
MEDIA_MUSIC_DIR=./media/music
MEDIA_BOOKS_DIR=./media/books
MEDIA_AUDIOBOOKS_DIR=./media/audiobooks
DOWNLOADS_ROOT=./downloads
PLEX_CLAIM=
PORTAINER_DATA=./config/portainer
NAVIDROME_DATA=./config/navidrome
NAVIDROME_MUSIC=./media/music
NAVIDROME_CACHE=./config/navidrome/cache
TAUTULLI_DATA=./config/tautulli
JELLYSTAT_DATA=./config/jellystat
AUDIOBOOKSHELF_CONFIG=./config/audiobookshelf/config
AUDIOBOOKSHELF_METADATA=./config/audiobookshelf/metadata
AUDIOBOOKSHELF_AUDIOBOOKS=./media/audiobooks
WATCHTOWER_NOTIFICATIONS=
```

> Notlar:
> - Tüm yollar proje klasörüne göre relatif tanımlandı. Docker Compose bu yolları host üzerinde mutlak pathe çevirir.
> - `PUID` ve `PGID` değerleri konteyner içindeki kullanıcı hesaplarını temsil eder; WSL içinde `id -u` ve `id -g` komutları ile doğrulayabilirsiniz.
> - Plex kurulumu için [plex.tv/claim](https://plex.tv/claim) adresinden kısa süre geçerli bir token alıp `PLEX_CLAIM` değerini doldurabilirsiniz (boş bırakırsanız oturum açarak da kurulum yapılabilir).
> - Watchtower bildirimlerini etkinleştirmek için `WATCHTOWER_NOTIFICATIONS` alanına Slack, Discord veya diğer desteklenen URL biçimlerini ekleyebilirsiniz.

## Klasör yapısı
```
arr-stack/
├── config/
│   ├── audiobookshelf/
│   │   ├── config/
│   │   └── metadata/
│   ├── bazarr/
│   ├── emby/
│   ├── homarr/
│   ├── jellyfin/
│   ├── jellystat/
│   ├── lidarr/
│   ├── navidrome/
│   │   └── cache/
│   ├── overseerr/
│   ├── plex/
│   ├── portainer/
│   ├── prowlarr/
│   ├── qbittorrent/
│   ├── radarr/
│   ├── readarr/
│   ├── recyclarr/
│   ├── sonarr/
│   └── tautulli/
├── downloads/
├── media/
│   ├── audiobooks/
│   ├── books/
│   ├── movies/
│   ├── music/
│   └── tv/
├── SERVICES.md
├── .env
└── docker-compose.yml
```

## Yığını başlatma
```powershell
Get-Content .env

docker compose config

docker compose up -d

docker compose logs -f --tail=100
```

İlk çalıştırmada imajların indirilmesi birkaç dakika sürebilir.

## Servis adresleri
- Homarr: `http://localhost:${HOMARR_PORT}`
- Sonarr: `http://localhost:${SONARR_PORT}`
- Radarr: `http://localhost:${RADARR_PORT}`
- Lidarr: `http://localhost:${LIDARR_PORT}`
- Readarr: `http://localhost:${READARR_PORT}`
- Prowlarr: `http://localhost:${PROWLARR_PORT}`
- Bazarr: `http://localhost:${BAZARR_PORT}`
- qBittorrent WebUI: `http://localhost:${QBITTORRENT_WEBUI_PORT}`
- Emby: `http://localhost:${EMBY_HTTP_PORT}`
- Jellyfin: `http://localhost:${JELLYFIN_HTTP_PORT}`
- Plex: `http://localhost:${PLEX_HTTP_PORT}`
- Overseerr: `http://localhost:${OVERSEERR_PORT}`
- Portainer: `https://localhost:${PORTAINER_PORT}`
- Watchtower: arka planda çalışır, web arayüzü yoktur.
- Navidrome: `http://localhost:${NAVIDROME_PORT}`
- Tautulli: `http://localhost:${TAUTULLI_PORT}`
- Jellystat: `http://localhost:${JELLYSTAT_PORT}`
- Audiobookshelf: `http://localhost:${AUDIOBOOKSHELF_HTTP_PORT}`

qBittorrent varsayılan giriş bilgileri `admin` / `adminadmin` (ilk oturumda değiştirin).

## İlk yapılandırma adımları

### qBittorrent
1. `Tools > Options > Web UI` menüsünden yönetici parolasını değiştirin.
2. `Tools > Options > Downloads` altında `Default Save Path` değerini `${DOWNLOADS_ROOT}` olarak ayarlayın.
3. `Categories` bölümünde `sonarr`, `radarr`, `lidarr`, `readarr` gibi etiketler tanımlayın.
4. `Options > BitTorrent` kısmında `Enable Auto Torrent Management` açık ise kategoriler otomatik uygulanır.

### Sonarr
1. Dil, kalite ve metadata profillerini gözden geçirin.
2. `Settings > Download Clients` bölümünden qBittorrent ekleyin ve kategori `sonarr` seçin.
3. `Series > Add Root Folder` ile konteyner içinde `/tv` yolunu seçin (host tarafında `${MEDIA_TV_DIR}`).

### Radarr
1. Kalite profillerini ihtiyaçlarınıza göre düzenleyin.
2. qBittorrent istemcisini kategori `radarr` ile ekleyin.
3. `Movies > Add Root Folder` menüsünden `/movies` yolunu seçin (host tarafında `${MEDIA_MOVIES_DIR}`).

### Lidarr
1. `Settings > Media Management` bölümünden dosya isimlendirmesini ayarlayın.
2. qBittorrent istemcisini kategori `lidarr` ile ekleyin.
3. `Settings > Root Folders` alanına `/music` yolunu ekleyin (host tarafında `${MEDIA_MUSIC_DIR}`).

### Readarr
1.  `Settings > Media Management` ve `Profiles` alanlarını düzenleyin. 
2. qBittorrent istemcisini kategori  `readarr` ile ekleyin. 
3. Kütüphane eklerken  `/books` yolunu seçin (host tarafında `${MEDIA_BOOKS_DIR}`). 
4. Bu stack Readarr için hotio imajının nightly sürümünü kullanır; güncel kalması için  `docker compose pull readarr` komutunu ara sıra çalıştırın. 

### Prowlarr
1. `Settings > General` bölümünden API anahtarı oluşturun.
2. İstediğiniz indexerları ekleyin.
3. `Apps > Add Application` bölümünde Sonarr, Radarr, Lidarr ve Readarr bağlantılarını kurulup `Sync Level` değerini `Full Sync` yapın.

### Bazarr
1. `Settings > Media Managers` kısmında Sonarr ve Radarr bağlantılarını girin.
2. `Languages` bölümünden tercih ettiğiniz altyazı dillerini ve sağlayıcılarını seçin.

### Emby
1. Kurulum sihirbazında `/data/movies` ve `/data/tvshows` klasörlerini ekleyin.
2. Donanım hızlandırma gerekiyorsa ekstra cihazları Docker Compose dosyasına ekleyin.

### Jellyfin
1. Yönetici hesabını oluşturun.
2. Kütüphane eklerken `/data/movies` ve `/data/tvshows` klasörlerini tanımlayın.
3. `Dashboard > Plugins` bölümünden istediğiniz eklentileri seçin.

### Plex
1. `PLEX_CLAIM` değeri girildiyse sunucu otomatik claim edilir, aksi halde web arayüzünden hesabınıza bağlayın.
2. Film ve dizi kütüphanelerini `/data/movies` ve `/data/tvshows` yolları ile ekleyin.
3. Uzaktan erişim gerekiyorsa `Settings > Remote Access` menüsünü kontrol edin.

### Homarr
1. Dashboard düzenleyicisini açıp tüm servisler için kartlar oluşturun.
2. API anahtarları ile Sonarr, Radarr, Lidarr vb durum bilgilerini gösterebilirsiniz.

### Overseerr
1. Yönetici hesabını oluşturun.
2. `Settings > Services` bölümünde Sonarr, Radarr, Lidarr ve Readarr bağlantılarını kurun.
3. İsteklerin otomatik onay kurallarını tanımlayın.

### Recyclarr
1. `config/recyclarr/config.yml` dosyasını oluşturup kullanmak istediğiniz presetleri ekleyin.
2. Daemon modu belirlediğiniz aralıklarla profilleri günceller; logları `docker compose logs recyclarr` komutu ile inceleyin.

### Portainer
1. `https://localhost:${PORTAINER_PORT}` adresinden admin hesabını oluşturun.
2. `local` endpoint üzerinden konteynerleri yönetebilir, log ve imaj güncellemelerini takip edebilirsiniz.

### Watchtower
1. Varsayılan cron ifadesi `0 30 4 * * *` olup her sabah 04:30 civarında güncelleme kontrolü yapar.
2. Belirli servisleri hariç tutmak veya bildirim göndermek için Watchtower dokümantasyonuna göre komut parametrelerini güncelleyebilirsiniz.

### Navidrome
1. `http://localhost:${NAVIDROME_PORT}` adresinden ilk admin oturumunu açın (varsayılan kullanıcı `admin`, parola `admin`).
2. `Settings > Music Library` altında `/music` klasörünü taratın.
3. İsteğe bağlı olarak Last.fm veya Subsonic istemcilerini Navidrome üzerinden yetkilendirebilirsiniz.

### Tautulli
1. İlk kurulumda Plex sunucusuna bağlanın ve Plex tokeninizi girin veya otomatik keşfi kullanın.
2. `Settings > Notifications` bölümünde Discord, Telegram gibi ajanlar ekleyerek izleme raporlarını paylaşabilirsiniz.

### Jellystat
1. `http://localhost:${JELLYSTAT_PORT}` adresinden hesap oluşturun.
2. `Settings` bölümünde Jellyfin API anahtarını girerek sunucuyu bağlayın.
3. Webhook desteği ile oynatma olaylarını gerçek zamanlı takip edebilirsiniz.

### Audiobookshelf
1. `http://localhost:${AUDIOBOOKSHELF_HTTP_PORT}` adresinden admin hesabını oluşturun.
2. `Libraries` bölümüne `/audiobooks` klasörünü ekleyin (host tarafında `${MEDIA_AUDIOBOOKS_DIR}`).
3. Mobil uygulamalar ile aynı kredilerle giriş yaparak offline senkronizasyon yapabilirsiniz.

## Ek otomasyon fikirleri
- Sonarr, Radarr, Lidarr ve Readarr içinde Discord, Telegram veya Gotify bildirimlerini `Connect` sekmesinden tanımlayabilirsiniz.
- Homarr içinde konteynerleri yeniden başlatan butonlar için `Actions` özelliklerini kullanın.
- Emby, Jellyfin veya Plex webhooks ile yüksek CPU veya transcode kuyruk durumlarını izleyebilir ve otomatik bildirimler gönderebilirsiniz.
- Watchtower güncellemelerinden sonra `docker compose up -d` komutu ile stacki hızlıca yeniden inşa etmek için Homarr üzerinde kısa yollar oluşturabilirsiniz.

## Güncelleme ve bakım
```powershell
docker compose pull

docker compose up -d

docker compose down
```

Tüm yapılandırmalar ve indirmeler bu dizin yapısında saklanır; projeyi başka bir makineye kopyalayıp `.env` ve `docker-compose.yml` ile birlikte `docker compose up -d` komutunu çalıştırmanız yeterlidir.


