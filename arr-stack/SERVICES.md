# Servis Özeti

Bu depodaki Docker yığını aşağıdaki uygulamalardan oluşur. Her biri medya otomasyonu sürecinin farklı bir adımını üstlenir.

## Homarr
- Amaç: Tüm servisleri tek ekranda toplamak, durumlarını göstermek ve kısayollar sağlamak.
- Öne çıkan özellikler: Özelleştirilebilir paneller, hızlı bağlantılar, API anahtarlarıyla servis sağlığı izlemesi.

## Sonarr
- Amaç: TV dizilerini takip etmek, yeni bölümleri otomatik bulup indirilecek kuyruğa eklemek.
- Öne çıkan özellikler: Sezon veya bölüm yönetimi, kalite profilleri, indirme istemcisi entegrasyonu, otomatik aktarma.

## Radarr
- Amaç: Film arşivini yönetmek, belirlenen kalite ve sürümlerde filmleri arayıp indirmek.
- Öne çıkan özellikler: Özel kalite hedefleri, yeni sürümleri izleme, otomatik indirme ve dosya düzenleme.

## Lidarr
- Amaç: Müzik kütüphanesini sanatçı ve albüm bazında takip ederek yeni yayınları otomatik indirmek.
- Öne çıkan özellikler: Sanatçı takibi, format filtreleri, otomatik metadata güncelleme, albüm koleksiyonu.

## Readarr
- Amaç: Kitap, e-kitap veya audiobook koleksiyonunu yönetip yeni sürümleri otomatik toplamak.
- Öne çıkan özellikler: Yazar serisi takibi, format ve boyut filtreleri, Calibre entegrasyonu, çoklu metadata kaynağı.

## Prowlarr
- Amaç: Sonarr, Radarr, Lidarr ve Readarr için indexer (torrent veya usenet arama kaynağı) bağlantılarını tek noktadan yönetmek.
- Öne çıkan özellikler: Indexer profilleri, uygulama senkronizasyonu, kategori haritalama, API paylaşımı.

## Bazarr
- Amaç: Sonarr veya Radarr kütüphanesindeki içerik için altyazı aramak, indirmek ve güncel tutmak.
- Öne çıkan özellikler: Çoklu dil desteği, sağlayıcı öncelikleri, çift yönlü *arr entegrasyonu.

## qBittorrent
- Amaç: Torrent indirme işlemlerini yürütmek ve *arr uygulamalarının indirme isteklerini yerine getirmek.
- Öne çıkan özellikler: Kategori bazlı etiketleme, web arayüzü, hız ve ratio kısıtlamaları, geniş API desteği.

## Emby
- Amaç: İndirilen medya dosyalarını ev içi veya uzaktan erişilebilen bir medya sunucusunda yayınlamak.
- Öne çıkan özellikler: Kullanıcı profilleri, transcoding, geniş eklenti kataloğu (bazıları Emby Premiere gerektirir).

## Jellyfin
- Amaç: Emby tabanlı, tamamen ücretsiz medya sunucusu sağlamak.
- Öne çıkan özellikler: Premiere gerektirmeyen playback özellikleri, topluluk eklentileri, geniş istemci desteği.

## Plex
- Amaç: Medyayı farklı cihazlara yayınlamak ve paylaşmak; geniş cihaz ekosistemi ve uzaktan erişim sunmak.
- Öne çıkan özellikler: Otomatik metadata, kullanıcı paylaşımı, mobil uygulamalar; bazı gelişmiş seçenekler Plex Pass gerektirir.

## Overseerr
- Amaç: Kullanıcıların film, dizi, müzik ve kitap isteklerini toplayıp onaylandığında ilgili *arr uygulamasına otomatik iletmek.
- Öne çıkan özellikler: Modern istek arayüzü, rol bazlı erişim, otomatik onay kuralları, bildirim entegrasyonları.

## Recyclarr
- Amaç: Sonarr, Radarr ve Lidarr kalite profillerini, sürüm kısıtlarını ve isimlendirme kurallarını merkezi bir YAML dosyasından senkronize etmek.
- Öne çıkan özellikler: Hazır presetler, belirli aralıklarla senkronizasyon, script yazmadan profil yönetimi.

## Portainer
- Amaç: Docker altyapısını kurulum yapmadan web arayüzü ile yönetmek.
- Öne çıkan özellikler: Konteyner, ağ ve volume yönetimi, log görüntüleme, imaj güncelleme sihirbazları.

## Watchtower
- Amaç: Konteyner imajlarını yeni sürümler için izleyip güncellemeleri otomatik uygulamak.
- Öne çıkan özellikler: Esnek cron takvimi, bildirim kanalları, güncelleme sonrası eski imajları temizleme.

## Navidrome
- Amaç: Müzik koleksiyonunu Subsonic uyumlu, hafif bir müzik sunucusu üzerinden paylaşmak.
- Öne çıkan özellikler: Hafif arayüz, Last.fm entegrasyonu, çoklu istemci uyumluluğu, çevrim dışı eşitleme desteği.

## Tautulli
- Amaç: Plex sunucusunun izlenme istatistiklerini ve etkinliğini izlemek.
- Öne çıkan özellikler: Ayrıntılı raporlar, kullanıcı bazlı istatistikler, bildirim ve uyarı otomasyonu, webhook desteği.

## Jellystat
- Amaç: Jellyfin oynatma verilerini toplayıp görselleştirmek.
- Öne çıkan özellikler: Web tabanlı dashboard, Jellyfin API ve webhook entegrasyonu, izlenme grafikleri, kullanıcı raporları.

## Audiobookshelf
- Amaç: Audiobook koleksiyonunu web ve mobil oyuncularla sunmak.
- Öne çıkan özellikler: Çoklu kütüphane desteği, çevrim dışı senkronizasyon, yer imleri ve notlar, modern istemci uygulamaları.
