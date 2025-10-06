#!/usr/bin/env python3
"""
🖼️ Poster Organizer
Çıkarılan afişleri ve görselleri organize eden script

Kullanım:
    python poster-organizer.py --input ./extracted --output ./organized
    python poster-organizer.py --input ./extracted --output ./organized --by-genre
    python poster-organizer.py --input ./extracted --output ./organized --by-year
"""

import os
import json
import shutil
import argparse
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class OrganizedMovie:
    """Organize edilmiş film bilgisi"""
    name: str
    year: int
    genres: List[str]
    rating: float
    poster_path: str
    backdrop_path: str
    logo_path: str
    fanart_path: str
    thumb_path: str
    source_file: str

class PosterOrganizer:
    """Poster organizatör sınıfı"""
    
    def __init__(self, input_path: str, output_path: str):
        self.input_path = Path(input_path)
        self.output_path = Path(output_path)
        self.movies: List[OrganizedMovie] = []
        
        # Çıktı klasörlerini oluştur
        self.setup_output_directories()
    
    def setup_output_directories(self):
        """Çıktı klasörlerini oluştur"""
        directories = [
            'by-name',
            'by-year',
            'by-genre',
            'by-rating',
            'high-quality',
            'missing-images',
            'reports'
        ]
        
        for directory in directories:
            (self.output_path / directory).mkdir(parents=True, exist_ok=True)
    
    def load_metadata(self, source_type: str = 'both'):
        """Metadata dosyalarını yükle"""
        print(f"METADATA: {source_type} metadata'lari yukleniyor...")
        
        metadata_files = []
        
        if source_type in ['emby', 'both']:
            emby_file = self.input_path / "metadata" / "emby_movies.json"
            if emby_file.exists():
                metadata_files.append(('emby', emby_file))
        
        if source_type in ['jellyfin', 'both']:
            jellyfin_file = self.input_path / "metadata" / "jellyfin_movies.json"
            if jellyfin_file.exists():
                metadata_files.append(('jellyfin', jellyfin_file))
        
        for source, file_path in metadata_files:
            print(f"📖 {source} metadata'sı okunuyor: {file_path}")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                for movie_data in data:
                    movie = self._create_organized_movie(movie_data, source)
                    if movie:
                        self.movies.append(movie)
                
                print(f"OK: {len(data)} film yuklendi ({source})")
                
            except Exception as e:
                print(f"HATA: {source} metadata okuma hatasi: {e}")
        
        print(f"TOPLAM: {len(self.movies)} film yuklendi")
    
    def _create_organized_movie(self, movie_data: dict, source: str) -> Optional[OrganizedMovie]:
        """Metadata'dan OrganizedMovie oluştur"""
        try:
            images = movie_data.get('images', {})
            
            return OrganizedMovie(
                name=movie_data.get('name', 'Bilinmeyen Film'),
                year=movie_data.get('year', 0),
                genres=movie_data.get('genres', []),
                rating=movie_data.get('rating', 0.0),
                poster_path=images.get('poster', ''),
                backdrop_path=images.get('backdrop', ''),
                logo_path=images.get('logo', ''),
                fanart_path=images.get('fanart', ''),
                thumb_path=images.get('thumb', ''),
                source_file=source
            )
        except Exception as e:
            print(f"⚠️ Film oluşturma hatası: {e}")
            return None
    
    def organize_by_name(self):
        """Filmleri isme göre organize et"""
        print("📝 Filmler isme göre organize ediliyor...")
        
        name_dir = self.output_path / "by-name"
        
        for movie in self.movies:
            safe_name = self._sanitize_filename(f"{movie.name} ({movie.year})")
            movie_dir = name_dir / safe_name
            movie_dir.mkdir(exist_ok=True)
            
            self._copy_movie_images(movie, movie_dir)
            self._create_movie_info_file(movie, movie_dir)
    
    def organize_by_year(self):
        """Filmleri yıla göre organize et"""
        print("📅 Filmler yıla göre organize ediliyor...")
        
        year_dir = self.output_path / "by-year"
        
        for movie in self.movies:
            if movie.year > 0:
                year_folder = year_dir / str(movie.year)
                year_folder.mkdir(exist_ok=True)
                
                safe_name = self._sanitize_filename(f"{movie.name} ({movie.year})")
                movie_dir = year_folder / safe_name
                movie_dir.mkdir(exist_ok=True)
                
                self._copy_movie_images(movie, movie_dir)
                self._create_movie_info_file(movie, movie_dir)
    
    def organize_by_genre(self):
        """Filmleri türe göre organize et"""
        print("🎭 Filmler türe göre organize ediliyor...")
        
        genre_dir = self.output_path / "by-genre"
        
        for movie in self.movies:
            if movie.genres:
                for genre in movie.genres:
                    safe_genre = self._sanitize_filename(genre)
                    genre_folder = genre_dir / safe_genre
                    genre_folder.mkdir(exist_ok=True)
                    
                    safe_name = self._sanitize_filename(f"{movie.name} ({movie.year})")
                    movie_dir = genre_folder / safe_name
                    movie_dir.mkdir(exist_ok=True)
                    
                    self._copy_movie_images(movie, movie_dir)
                    self._create_movie_info_file(movie, movie_dir)
            else:
                # Türü olmayan filmler
                unknown_folder = genre_dir / "Bilinmeyen_Tur"
                unknown_folder.mkdir(exist_ok=True)
                
                safe_name = self._sanitize_filename(f"{movie.name} ({movie.year})")
                movie_dir = unknown_folder / safe_name
                movie_dir.mkdir(exist_ok=True)
                
                self._copy_movie_images(movie, movie_dir)
                self._create_movie_info_file(movie, movie_dir)
    
    def organize_by_rating(self):
        """Filmleri puanına göre organize et"""
        print("⭐ Filmler puanına göre organize ediliyor...")
        
        rating_dir = self.output_path / "by-rating"
        
        for movie in self.movies:
            if movie.rating > 0:
                # Puan aralığına göre klasör
                if movie.rating >= 8.0:
                    rating_folder = rating_dir / "8.0-10.0"
                elif movie.rating >= 7.0:
                    rating_folder = rating_dir / "7.0-7.9"
                elif movie.rating >= 6.0:
                    rating_folder = rating_dir / "6.0-6.9"
                elif movie.rating >= 5.0:
                    rating_folder = rating_dir / "5.0-5.9"
                else:
                    rating_folder = rating_dir / "0.0-4.9"
                
                rating_folder.mkdir(exist_ok=True)
                
                safe_name = self._sanitize_filename(f"{movie.name} ({movie.year}) - {movie.rating}")
                movie_dir = rating_folder / safe_name
                movie_dir.mkdir(exist_ok=True)
                
                self._copy_movie_images(movie, movie_dir)
                self._create_movie_info_file(movie, movie_dir)
    
    def extract_high_quality_images(self):
        """Yüksek kaliteli görselleri ayır"""
        print("🎨 Yüksek kaliteli görseller ayırılıyor...")
        
        hq_dir = self.output_path / "high-quality"
        
        for movie in self.movies:
            # Sadece poster ve backdrop'ı olan filmler
            if movie.poster_path and movie.backdrop_path:
                safe_name = self._sanitize_filename(f"{movie.name} ({movie.year})")
                movie_dir = hq_dir / safe_name
                movie_dir.mkdir(exist_ok=True)
                
                self._copy_movie_images(movie, movie_dir)
                self._create_movie_info_file(movie, movie_dir)
    
    def find_missing_images(self):
        """Eksik görselleri bul"""
        print("🔍 Eksik görseller taranıyor...")
        
        missing_dir = self.output_path / "missing-images"
        
        for movie in self.movies:
            missing_types = []
            
            if not movie.poster_path:
                missing_types.append("poster")
            if not movie.backdrop_path:
                missing_types.append("backdrop")
            if not movie.logo_path:
                missing_types.append("logo")
            if not movie.fanart_path:
                missing_types.append("fanart")
            if not movie.thumb_path:
                missing_types.append("thumb")
            
            if missing_types:
                safe_name = self._sanitize_filename(f"{movie.name} ({movie.year})")
                movie_dir = missing_dir / safe_name
                movie_dir.mkdir(exist_ok=True)
                
                # Mevcut görselleri kopyala
                self._copy_movie_images(movie, movie_dir)
                
                # Eksik görsel listesini kaydet
                missing_info = {
                    "name": movie.name,
                    "year": movie.year,
                    "missing_types": missing_types,
                    "has_poster": bool(movie.poster_path),
                    "has_backdrop": bool(movie.backdrop_path),
                    "has_logo": bool(movie.logo_path),
                    "has_fanart": bool(movie.fanart_path),
                    "has_thumb": bool(movie.thumb_path)
                }
                
                missing_file = movie_dir / "missing_images.json"
                with open(missing_file, 'w', encoding='utf-8') as f:
                    json.dump(missing_info, f, ensure_ascii=False, indent=2)
    
    def _copy_movie_images(self, movie: OrganizedMovie, target_dir: Path):
        """Film görsellerini kopyala"""
        image_types = [
            ('poster', movie.poster_path, 'poster.jpg'),
            ('backdrop', movie.backdrop_path, 'backdrop.jpg'),
            ('logo', movie.logo_path, 'logo.png'),
            ('fanart', movie.fanart_path, 'fanart.jpg'),
            ('thumb', movie.thumb_path, 'thumb.jpg')
        ]
        
        for image_type, source_path, target_name in image_types:
            if source_path and Path(source_path).exists():
                target_path = target_dir / target_name
                try:
                    shutil.copy2(source_path, target_path)
                except Exception as e:
                    print(f"⚠️ {image_type} kopyalama hatası: {e}")
    
    def _create_movie_info_file(self, movie: OrganizedMovie, target_dir: Path):
        """Film bilgi dosyası oluştur"""
        info = {
            "name": movie.name,
            "year": movie.year,
            "genres": movie.genres,
            "rating": movie.rating,
            "source": movie.source_file,
            "images": {
                "poster": bool(movie.poster_path),
                "backdrop": bool(movie.backdrop_path),
                "logo": bool(movie.logo_path),
                "fanart": bool(movie.fanart_path),
                "thumb": bool(movie.thumb_path)
            },
            "extracted_date": datetime.now().isoformat()
        }
        
        info_file = target_dir / "movie_info.json"
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump(info, f, ensure_ascii=False, indent=2)
    
    def generate_organization_report(self):
        """Organizasyon raporu oluştur"""
        print("📊 Organizasyon raporu oluşturuluyor...")
        
        report = {
            "organization_date": datetime.now().isoformat(),
            "total_movies": len(self.movies),
            "organization_stats": {
                "by_name": len(list((self.output_path / "by-name").rglob("movie_info.json"))),
                "by_year": len(list((self.output_path / "by-year").rglob("movie_info.json"))),
                "by_genre": len(list((self.output_path / "by-genre").rglob("movie_info.json"))),
                "by_rating": len(list((self.output_path / "by-rating").rglob("movie_info.json"))),
                "high_quality": len(list((self.output_path / "high-quality").rglob("movie_info.json"))),
                "missing_images": len(list((self.output_path / "missing-images").rglob("movie_info.json")))
            },
            "image_stats": {
                "with_poster": len([m for m in self.movies if m.poster_path]),
                "with_backdrop": len([m for m in self.movies if m.backdrop_path]),
                "with_logo": len([m for m in self.movies if m.logo_path]),
                "with_fanart": len([m for m in self.movies if m.fanart_path]),
                "with_thumb": len([m for m in self.movies if m.thumb_path])
            },
            "genre_distribution": {},
            "year_distribution": {},
            "rating_distribution": {}
        }
        
        # İstatistikleri hesapla
        for movie in self.movies:
            # Tür dağılımı
            for genre in movie.genres:
                report["genre_distribution"][genre] = report["genre_distribution"].get(genre, 0) + 1
            
            # Yıl dağılımı
            if movie.year > 0:
                report["year_distribution"][str(movie.year)] = report["year_distribution"].get(str(movie.year), 0) + 1
            
            # Puan dağılımı
            if movie.rating > 0:
                rating_range = f"{int(movie.rating)}.0-{int(movie.rating)}.9"
                report["rating_distribution"][rating_range] = report["rating_distribution"].get(rating_range, 0) + 1
        
        # Raporu kaydet
        report_file = self.output_path / "reports" / "organization_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # Özet raporu yazdır
        print(f"\n📈 ORGANİZASYON RAPORU")
        print(f"{'='*50}")
        print(f"Toplam Film: {report['total_movies']}")
        print(f"İsme Göre: {report['organization_stats']['by_name']}")
        print(f"Yıla Göre: {report['organization_stats']['by_year']}")
        print(f"Türe Göre: {report['organization_stats']['by_genre']}")
        print(f"Puana Göre: {report['organization_stats']['by_rating']}")
        print(f"Yüksek Kalite: {report['organization_stats']['high_quality']}")
        print(f"Eksik Görsel: {report['organization_stats']['missing_images']}")
        print(f"Rapor dosyası: {report_file}")
    
    def _sanitize_filename(self, filename: str) -> str:
        """Dosya adını temizle"""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        
        if len(filename) > 100:
            filename = filename[:100]
        
        return filename.strip()

def main():
    """Ana fonksiyon"""
    parser = argparse.ArgumentParser(description='Poster Organizer')
    parser.add_argument('--input', required=True, help='Metadata çıktı klasörü')
    parser.add_argument('--output', required=True, help='Organize edilmiş çıktı klasörü')
    parser.add_argument('--source', choices=['emby', 'jellyfin', 'both'], 
                       default='both', help='Metadata kaynağı')
    parser.add_argument('--by-name', action='store_true', help='İsme göre organize et')
    parser.add_argument('--by-year', action='store_true', help='Yıla göre organize et')
    parser.add_argument('--by-genre', action='store_true', help='Türe göre organize et')
    parser.add_argument('--by-rating', action='store_true', help='Puana göre organize et')
    parser.add_argument('--high-quality', action='store_true', help='Yüksek kaliteli görselleri ayır')
    parser.add_argument('--missing-images', action='store_true', help='Eksik görselleri bul')
    parser.add_argument('--all', action='store_true', help='Tüm organizasyonları yap')
    parser.add_argument('--report', action='store_true', help='Rapor oluştur')
    
    args = parser.parse_args()
    
    print("Poster Organizer Baslatiliyor...")
    print(f"Giris: {args.input}")
    print(f"Cikti: {args.output}")
    print(f"Kaynak: {args.source}")
    print("="*60)
    
    organizer = PosterOrganizer(args.input, args.output)
    
    # Metadata'ları yükle
    organizer.load_metadata(args.source)
    
    if not organizer.movies:
        print("❌ Yüklenecek film bulunamadı!")
        return
    
    # Organizasyonları yap
    if args.all or args.by_name:
        organizer.organize_by_name()
    
    if args.all or args.by_year:
        organizer.organize_by_year()
    
    if args.all or args.by_genre:
        organizer.organize_by_genre()
    
    if args.all or args.by_rating:
        organizer.organize_by_rating()
    
    if args.all or args.high_quality:
        organizer.extract_high_quality_images()
    
    if args.all or args.missing_images:
        organizer.find_missing_images()
    
    if args.report:
        organizer.generate_organization_report()
    
    print("\n🎉 Organizasyon tamamlandı!")
    print(f"Çıktı klasörü: {args.output}")

if __name__ == "__main__":
    main()
