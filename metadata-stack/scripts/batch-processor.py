#!/usr/bin/env python3
"""
🚀 Batch Metadata Processor
Emby/Jellyfin metadata'larını toplu olarak işleyen ana script

Kullanım:
    python batch-processor.py --extract --organize --report
    python batch-processor.py --extract-only
    python batch-processor.py --organize-only --input ./extracted
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
import json

class BatchProcessor:
    """Toplu işlem yöneticisi"""
    
    def __init__(self, config_path: str = ".", output_path: str = "./extracted"):
        self.config_path = Path(config_path)
        self.output_path = Path(output_path)
        # Script dosyalarını kontrol et (mevcut dizinde)
        self.metadata_extractor = Path("metadata-extractor.py")
        self.poster_organizer = Path("poster-organizer.py")
        
        self._validate_scripts()
    
    def _validate_scripts(self):
        """Script dosyalarının varlığını kontrol et"""
        if not self.metadata_extractor.exists():
            raise FileNotFoundError(f"Metadata extractor bulunamadı: {self.metadata_extractor}")
        
        if not self.poster_organizer.exists():
            raise FileNotFoundError(f"Poster organizer bulunamadı: {self.poster_organizer}")
    
    def extract_metadata(self, source: str = 'both', copy_images: bool = True, generate_report: bool = True):
        """Metadata'ları çıkar"""
        print("🎬 Metadata çıkarılıyor...")
        
        cmd = [
            sys.executable,
            str(self.metadata_extractor),
            '--source', source,
            '--config', str(self.config_path),
            '--output', str(self.output_path)
        ]
        
        if copy_images:
            cmd.append('--images')
        
        if generate_report:
            cmd.append('--report')
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
            
            if result.returncode == 0:
                print("✅ Metadata çıkarıldı")
                print(result.stdout)
            else:
                print("❌ Metadata çıkarma hatası:")
                print(result.stderr)
                return False
                
        except Exception as e:
            print(f"❌ Script çalıştırma hatası: {e}")
            return False
        
        return True
    
    def organize_posters(self, source: str = 'both', organize_all: bool = True, generate_report: bool = True):
        """Poster'ları organize et"""
        print("🖼️ Poster'lar organize ediliyor...")
        
        cmd = [
            sys.executable,
            str(self.poster_organizer),
            '--input', str(self.output_path),
            '--output', str(self.output_path / "organized"),
            '--source', source
        ]
        
        if organize_all:
            cmd.append('--all')
        else:
            # Varsayılan organizasyonlar
            cmd.extend(['--by-name', '--by-year', '--by-genre'])
        
        if generate_report:
            cmd.append('--report')
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
            
            if result.returncode == 0:
                print("✅ Poster'lar organize edildi")
                print(result.stdout)
            else:
                print("❌ Poster organizasyon hatası:")
                print(result.stderr)
                return False
                
        except Exception as e:
            print(f"❌ Script çalıştırma hatası: {e}")
            return False
        
        return True
    
    def generate_summary_report(self):
        """Özet rapor oluştur"""
        print("📊 Özet rapor oluşturuluyor...")
        
        report = {
            "processing_date": datetime.now().isoformat(),
            "config_path": str(self.config_path),
            "output_path": str(self.output_path),
            "extracted_files": {},
            "organized_files": {},
            "statistics": {}
        }
        
        # Çıkarılan dosyaları say
        if (self.output_path / "metadata").exists():
            for json_file in (self.output_path / "metadata").glob("*.json"):
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    report["extracted_files"][json_file.name] = len(data)
        
        # Organize edilmiş dosyaları say
        organized_path = self.output_path / "organized"
        if organized_path.exists():
            for org_dir in organized_path.iterdir():
                if org_dir.is_dir():
                    count = len(list(org_dir.rglob("movie_info.json")))
                    report["organized_files"][org_dir.name] = count
        
        # İstatistikleri hesapla
        total_extracted = sum(report["extracted_files"].values())
        total_organized = sum(report["organized_files"].values())
        
        report["statistics"] = {
            "total_extracted_movies": total_extracted,
            "total_organized_movies": total_organized,
            "extraction_sources": list(report["extracted_files"].keys()),
            "organization_types": list(report["organized_files"].keys())
        }
        
        # Raporu kaydet
        report_file = self.output_path / "batch_processing_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # Özet yazdır
        print(f"\n📈 TOPLU İŞLEM ÖZETİ")
        print(f"{'='*50}")
        print(f"İşlem Tarihi: {report['processing_date']}")
        print(f"Toplam Çıkarılan Film: {total_extracted}")
        print(f"Toplam Organize Edilen: {total_organized}")
        print(f"Çıkarılan Kaynaklar: {', '.join(report['extraction_sources'])}")
        print(f"Organizasyon Türleri: {', '.join(report['organization_types'])}")
        print(f"Rapor dosyası: {report_file}")
        
        return report
    
    def cleanup_temp_files(self):
        """Geçici dosyaları temizle"""
        print("🧹 Geçici dosyalar temizleniyor...")
        
        temp_patterns = [
            "*.tmp",
            "*.temp",
            "*.log",
            "__pycache__",
            "*.pyc"
        ]
        
        cleaned_count = 0
        
        for pattern in temp_patterns:
            for file_path in self.output_path.rglob(pattern):
                try:
                    if file_path.is_file():
                        file_path.unlink()
                        cleaned_count += 1
                    elif file_path.is_dir():
                        import shutil
                        shutil.rmtree(file_path)
                        cleaned_count += 1
                except Exception as e:
                    print(f"⚠️ Temizleme hatası: {file_path} - {e}")
        
        print(f"✅ {cleaned_count} geçici dosya temizlendi")
    
    def run_full_pipeline(self, source: str = 'both', copy_images: bool = True, 
                         organize_all: bool = True, cleanup: bool = True):
        """Tam işlem hattını çalıştır"""
        print("🚀 Tam işlem hattı başlatılıyor...")
        print(f"Kaynak: {source}")
        print(f"Görsel Kopyalama: {'Evet' if copy_images else 'Hayır'}")
        print(f"Tam Organizasyon: {'Evet' if organize_all else 'Hayır'}")
        print(f"Temizlik: {'Evet' if cleanup else 'Hayır'}")
        print("="*60)
        
        start_time = datetime.now()
        
        # 1. Metadata çıkar
        if not self.extract_metadata(source, copy_images, True):
            print("❌ Metadata çıkarma başarısız!")
            return False
        
        # 2. Poster'ları organize et
        if not self.organize_posters(source, organize_all, True):
            print("❌ Poster organizasyonu başarısız!")
            return False
        
        # 3. Özet rapor oluştur
        self.generate_summary_report()
        
        # 4. Temizlik
        if cleanup:
            self.cleanup_temp_files()
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        print(f"\n🎉 Tam işlem hattı tamamlandı!")
        print(f"Toplam süre: {duration}")
        print(f"Çıktı klasörü: {self.output_path}")
        
        return True

def main():
    """Ana fonksiyon"""
    parser = argparse.ArgumentParser(description='Batch Metadata Processor')
    parser.add_argument('--config', default='.', help='Config klasörü yolu')
    parser.add_argument('--output', default='./extracted', help='Çıktı klasörü')
    parser.add_argument('--source', choices=['emby', 'jellyfin', 'both'], 
                       default='both', help='Metadata kaynağı')
    
    # İşlem seçenekleri
    parser.add_argument('--extract', action='store_true', help='Metadata çıkar')
    parser.add_argument('--organize', action='store_true', help='Poster organize et')
    parser.add_argument('--report', action='store_true', help='Rapor oluştur')
    parser.add_argument('--cleanup', action='store_true', help='Geçici dosyaları temizle')
    
    # Hızlı seçenekler
    parser.add_argument('--extract-only', action='store_true', help='Sadece metadata çıkar')
    parser.add_argument('--organize-only', action='store_true', help='Sadece organize et')
    parser.add_argument('--full-pipeline', action='store_true', help='Tam işlem hattı')
    
    # Detay seçenekleri
    parser.add_argument('--no-images', action='store_true', help='Görselleri kopyalama')
    parser.add_argument('--no-full-org', action='store_true', help='Tam organizasyon yapma')
    parser.add_argument('--no-cleanup', action='store_true', help='Temizlik yapma')
    
    args = parser.parse_args()
    
    try:
        processor = BatchProcessor(args.config, args.output)
        
        if args.full_pipeline:
            # Tam işlem hattı
            processor.run_full_pipeline(
                source=args.source,
                copy_images=not args.no_images,
                organize_all=not args.no_full_org,
                cleanup=not args.no_cleanup
            )
        
        elif args.extract_only:
            # Sadece metadata çıkar
            processor.extract_metadata(
                source=args.source,
                copy_images=not args.no_images,
                generate_report=True
            )
        
        elif args.organize_only:
            # Sadece organize et
            processor.organize_posters(
                source=args.source,
                organize_all=not args.no_full_org,
                generate_report=True
            )
        
        else:
            # Manuel işlemler
            if args.extract:
                processor.extract_metadata(
                    source=args.source,
                    copy_images=not args.no_images,
                    generate_report=True
                )
            
            if args.organize:
                processor.organize_posters(
                    source=args.source,
                    organize_all=not args.no_full_org,
                    generate_report=True
                )
            
            if args.report:
                processor.generate_summary_report()
            
            if args.cleanup:
                processor.cleanup_temp_files()
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
