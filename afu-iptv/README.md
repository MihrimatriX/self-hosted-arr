# AFU IPTV

Modern Next.js tabanli bir IPTV arayuzu. Xtream Codes servisine baglanarak kategori ve kanal listelerini cekip hizlica erisilebilir hale getirir.

## Ozellikler
- Next.js 14 ve App Router ile sunucu tarafli veri cekme
- Xtream API icin dahili proxy (kimlik bilgilerini korur)
- Tailwind CSS ile hazirlanmis koyu tema ve cam efekti
- Kategori bazli filtreleme ve anlik arama
- Kanal logolari ve yayin baglantilarini acma kisayolu
- Tum uygulama kodu `src/` klasoru altinda moduler olarak duzenlenmistir (app, components, lib, types)

## Kurulum
1. Depoyu klonlayin ve `afu-iptv` klasorune gecin.
2. `cp .env.example .env.local` komutu ile ortam degiskenlerini olusturun (Windows icin `copy .env.example .env.local`).
3. Gerekirse `.env.local` icindeki Xtream bilgilerini guncelleyin.
4. Bagimliliklari yukleyin:
   ```bash
   npm install
   ```
5. Gelistirme sunucusunu calistirin:
   ```bash
   npm run dev
   ```
6. Tarayicidan `http://localhost:3000` adresine gidin.

## Yapilandirma
- `XTREAM_API_BASE`: Xtream player_api.php ucu (ornek: `http://tgrpro25.xyz:8080/player_api.php`)
- `XTREAM_USERNAME` ve `XTREAM_PASSWORD`: Servis kullanici bilgileriniz
- `XTREAM_SESSION_COOKIE`: Tarayicidan alinan `capp_name_session` degeri (opsiyonel, erisim kisitlamasini asmak icin)

## Komutlar
- `npm run dev`: Gelistirme modunda calistirir
- `npm run build`: Uretim derlemesi olusturur
- `npm run start`: Uretim derlemesini calistirir
- `npm run lint`: ESLint kontrolu yapar

## Notlar
- API cagrilari Next.js sunucu ortaminda calisir, bilgiler istemciye sizarmaz.
- `src/app/api/xtream/route.ts` ucu, kategori ve kanal verilerini JSON olarak disari sunar.
- Varsayilan olarak veriler 60 saniyede bir tekrar cagrilacak sekilde ayarlandi.
- Uzak Xtream servisleri Node tabanli istekleri kisitlayabileceginden, isteklere tarayici benzeri bir `User-Agent` ve opsiyonel `capp_name_session` çerezi eklenmistir; baglanti sorunlarinda ag erisimi ve kimlik bilgilerinizi dogrulayin.
