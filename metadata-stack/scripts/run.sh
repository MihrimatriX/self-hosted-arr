#!/bin/bash
# 🎬 Metadata Extraction Scripts - Linux/Mac Shell Runner
# Bu dosya Linux/Mac'te scriptleri kolayca çalıştırmak için kullanılır

echo "🎬 Metadata Extraction Scripts"
echo "================================"

# Python'un yüklü olup olmadığını kontrol et
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 bulunamadı! Lütfen Python 3.7+ yükleyin."
    exit 1
fi

# Mevcut dizini kontrol et
if [ ! -f "metadata-extractor.py" ]; then
    echo "❌ Script dosyaları bulunamadı!"
    echo "Lütfen scripts klasöründe olduğunuzdan emin olun."
    exit 1
fi

echo "✅ Python3 bulundu"
echo "✅ Script dosyaları bulundu"
echo ""

# Menü fonksiyonu
show_menu() {
    echo "🚀 Hangi işlemi yapmak istiyorsunuz?"
    echo ""
    echo "1. Tam İşlem Hattı (Önerilen)"
    echo "2. Sadece Metadata Çıkar"
    echo "3. Sadece Organize Et"
    echo "4. Emby'den Çıkar"
    echo "5. Jellyfin'den Çıkar"
    echo "6. Eksik Görselleri Bul"
    echo "7. Yüksek Kaliteli Görselleri Ayır"
    echo "8. Çıkış"
    echo ""
}

# Tam işlem hattı
full_pipeline() {
    echo ""
    echo "🚀 Tam işlem hattı başlatılıyor..."
    python3 batch-processor.py --full-pipeline
    echo ""
    echo "✅ İşlem tamamlandı!"
    read -p "Devam etmek için Enter'a basın..."
}

# Sadece metadata çıkar
extract_only() {
    echo ""
    echo "🎬 Metadata çıkarılıyor..."
    python3 batch-processor.py --extract-only
    echo ""
    echo "✅ Metadata çıkarıldı!"
    read -p "Devam etmek için Enter'a basın..."
}

# Sadece organize et
organize_only() {
    echo ""
    echo "🖼️ Poster'lar organize ediliyor..."
    python3 batch-processor.py --organize-only
    echo ""
    echo "✅ Poster'lar organize edildi!"
    read -p "Devam etmek için Enter'a basın..."
}

# Emby'den çıkar
extract_emby() {
    echo ""
    echo "🎭 Emby'den metadata çıkarılıyor..."
    python3 metadata-extractor.py --source emby --output ./extracted --images --report
    echo ""
    echo "✅ Emby metadata'sı çıkarıldı!"
    read -p "Devam etmek için Enter'a basın..."
}

# Jellyfin'den çıkar
extract_jellyfin() {
    echo ""
    echo "🎬 Jellyfin'den metadata çıkarılıyor..."
    python3 metadata-extractor.py --source jellyfin --output ./extracted --images --report
    echo ""
    echo "✅ Jellyfin metadata'sı çıkarıldı!"
    read -p "Devam etmek için Enter'a basın..."
}

# Eksik görselleri bul
missing_images() {
    echo ""
    echo "🔍 Eksik görseller taranıyor..."
    python3 poster-organizer.py --input ./extracted --output ./organized --missing-images --report
    echo ""
    echo "✅ Eksik görseller bulundu!"
    read -p "Devam etmek için Enter'a basın..."
}

# Yüksek kaliteli görselleri ayır
high_quality() {
    echo ""
    echo "🎨 Yüksek kaliteli görseller ayırılıyor..."
    python3 poster-organizer.py --input ./extracted --output ./organized --high-quality --report
    echo ""
    echo "✅ Yüksek kaliteli görseller ayırıldı!"
    read -p "Devam etmek için Enter'a basın..."
}

# Ana menü döngüsü
while true; do
    show_menu
    read -p "Seçiminizi yapın (1-8): " choice
    
    case $choice in
        1)
            full_pipeline
            ;;
        2)
            extract_only
            ;;
        3)
            organize_only
            ;;
        4)
            extract_emby
            ;;
        5)
            extract_jellyfin
            ;;
        6)
            missing_images
            ;;
        7)
            high_quality
            ;;
        8)
            echo ""
            echo "👋 Görüşürüz!"
            exit 0
            ;;
        *)
            echo "❌ Geçersiz seçim! Lütfen 1-8 arası bir sayı girin."
            read -p "Devam etmek için Enter'a basın..."
            ;;
    esac
done
