@echo off
REM 🎬 Metadata Extraction Scripts - Windows Batch Runner
REM Bu dosya Windows'ta scriptleri kolayca çalıştırmak için kullanılır

echo 🎬 Metadata Extraction Scripts
echo ================================

REM Python'un yüklü olup olmadığını kontrol et
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python bulunamadı! Lütfen Python 3.7+ yükleyin.
    pause
    exit /b 1
)

REM Mevcut dizini kontrol et
if not exist "metadata-extractor.py" (
    echo ❌ Script dosyaları bulunamadı!
    echo Lütfen scripts klasöründe olduğunuzdan emin olun.
    pause
    exit /b 1
)

echo ✅ Python bulundu
echo ✅ Script dosyaları bulundu
echo.

:MENU
echo 🚀 Hangi işlemi yapmak istiyorsunuz?
echo.
echo 1. Tam İşlem Hattı (Önerilen)
echo 2. Sadece Metadata Çıkar
echo 3. Sadece Organize Et
echo 4. Emby'den Çıkar
echo 5. Jellyfin'den Çıkar
echo 6. Eksik Görselleri Bul
echo 7. Yüksek Kaliteli Görselleri Ayır
echo 8. Çıkış
echo.
set /p choice="Seçiminizi yapın (1-8): "

if "%choice%"=="1" goto FULL_PIPELINE
if "%choice%"=="2" goto EXTRACT_ONLY
if "%choice%"=="3" goto ORGANIZE_ONLY
if "%choice%"=="4" goto EXTRACT_EMBY
if "%choice%"=="5" goto EXTRACT_JELLYFIN
if "%choice%"=="6" goto MISSING_IMAGES
if "%choice%"=="7" goto HIGH_QUALITY
if "%choice%"=="8" goto EXIT
goto MENU

:FULL_PIPELINE
echo.
echo 🚀 Tam işlem hattı başlatılıyor...
python batch-processor.py --full-pipeline
echo.
echo ✅ İşlem tamamlandı!
pause
goto MENU

:EXTRACT_ONLY
echo.
echo 🎬 Metadata çıkarılıyor...
python batch-processor.py --extract-only
echo.
echo ✅ Metadata çıkarıldı!
pause
goto MENU

:ORGANIZE_ONLY
echo.
echo 🖼️ Poster'lar organize ediliyor...
python batch-processor.py --organize-only
echo.
echo ✅ Poster'lar organize edildi!
pause
goto MENU

:EXTRACT_EMBY
echo.
echo 🎭 Emby'den metadata çıkarılıyor...
python metadata-extractor.py --source emby --output ./extracted --images --report
echo.
echo ✅ Emby metadata'sı çıkarıldı!
pause
goto MENU

:EXTRACT_JELLYFIN
echo.
echo 🎬 Jellyfin'den metadata çıkarılıyor...
python metadata-extractor.py --source jellyfin --output ./extracted --images --report
echo.
echo ✅ Jellyfin metadata'sı çıkarıldı!
pause
goto MENU

:MISSING_IMAGES
echo.
echo 🔍 Eksik görseller taranıyor...
python poster-organizer.py --input ./extracted --output ./organized --missing-images --report
echo.
echo ✅ Eksik görseller bulundu!
pause
goto MENU

:HIGH_QUALITY
echo.
echo 🎨 Yüksek kaliteli görseller ayırılıyor...
python poster-organizer.py --input ./extracted --output ./organized --high-quality --report
echo.
echo ✅ Yüksek kaliteli görseller ayırıldı!
pause
goto MENU

:EXIT
echo.
echo 👋 Görüşürüz!
exit /b 0
