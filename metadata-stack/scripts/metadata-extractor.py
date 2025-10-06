#!/usr/bin/env python3
"""
FILM Emby/Jellyfin Metadata Extractor
Film metadata'larını ve afişlerini çıkarıp organize eden script

Kullanım:
    python metadata-extractor.py --source emby --output ./extracted
    python metadata-extractor.py --source jellyfin --output ./extracted
    python metadata-extractor.py --source both --output ./extracted
"""

import os
import sys
import sqlite3
import json
import shutil
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import hashlib
from datetime import datetime

@dataclass
class MovieInfo:
    """Film bilgilerini tutan sınıf"""
    id: str
    name: str
    original_title: str
    year: int
    overview: str
    imdb_id: str
    tmdb_id: str
    genres: List[str]
    runtime: int
    rating: float
    poster_path: str
    backdrop_path: str
    logo_path: str
    fanart_path: str
    thumb_path: str
    metadata_hash: str
    file_path: str

class MetadataExtractor:
    """Metadata çıkarıcı ana sınıf"""
    
    def __init__(self, config_path: str, output_path: str):
        self.config_path = Path(config_path)
        self.output_path = Path(output_path)
        self.movies: List[MovieInfo] = []
        
        # Çıktı klasörlerini oluştur
        self.setup_output_directories()
    
    def setup_output_directories(self):
        """Çıktı klasörlerini oluştur"""
        directories = [
            'movies',
            'posters',
            'backdrops', 
            'logos',
            'fanarts',
            'thumbs',
            'metadata',
            'reports'
        ]
        
        for directory in directories:
            (self.output_path / directory).mkdir(parents=True, exist_ok=True)
    
    def extract_from_emby(self) -> List[MovieInfo]:
        """Emby'den metadata çıkar"""
        print("Emby metadata'lari cikariliyor...")
        
        db_path = self.config_path / "emby-config" / "data" / "library.db"
        if not db_path.exists():
            print(f"Emby veritabani bulunamadi: {db_path}")
            return []
        
        movies = []
        
        try:
            conn = sqlite3.connect(str(db_path))
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Film bilgilerini çek
            query = """
            SELECT 
                Id, Name, OriginalTitle, ProductionYear, Overview,
                ProviderIds, RunTimeTicks, CommunityRating,
                Path, DateCreated, DateModified, guid
            FROM MediaItems 
            WHERE (IsMovie = 1 OR type = 8) AND Name NOT LIKE 'Episode%' AND Name NOT LIKE 'BBC%' AND Name NOT LIKE 'The Great%'
            ORDER BY Name
            """
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            for row in rows:
                movie = self._create_movie_from_emby_row(row)
                if movie:
                    movies.append(movie)
                    print(f"OK {movie.name} ({movie.year}) - {movie.metadata_hash}")
            
            conn.close()
            
        except Exception as e:
            print(f"HATA Emby veritabanı hatası: {e}")
        
        return movies
    
    def extract_from_jellyfin(self) -> List[MovieInfo]:
        """Jellyfin'den metadata çıkar"""
        print("FILM Jellyfin metadata'ları çıkarılıyor...")
        
        db_path = self.config_path / "config" / "data" / "library.db"
        if not db_path.exists():
            print(f"HATA Jellyfin veritabanı bulunamadı: {db_path}")
            return []
        
        movies = []
        
        try:
            conn = sqlite3.connect(str(db_path))
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Film bilgilerini çek
            query = """
            SELECT 
                Id, Name, OriginalTitle, ProductionYear, Overview,
                ProviderIds, RunTimeTicks, CommunityRating,
                Path, DateCreated, DateModified, guid
            FROM MediaItems 
            WHERE (IsMovie = 1 OR type = 8) AND Name NOT LIKE 'Episode%' AND Name NOT LIKE 'BBC%' AND Name NOT LIKE 'The Great%'
            ORDER BY Name
            """
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            for row in rows:
                movie = self._create_movie_from_jellyfin_row(row)
                if movie:
                    movies.append(movie)
                    print(f"OK {movie.name} ({movie.year}) - {movie.metadata_hash}")
            
            conn.close()
            
        except Exception as e:
            print(f"HATA Jellyfin veritabanı hatası: {e}")
        
        return movies
    
    def _create_movie_from_emby_row(self, row) -> Optional[MovieInfo]:
        """Emby veritabanı satırından MovieInfo oluştur"""
        try:
            # Metadata hash hesapla (GUID'den)
            metadata_hash = self._calculate_metadata_hash_from_guid(row['guid'])
            
            # Görsel yollarını bul
            poster_path, backdrop_path, logo_path, fanart_path, thumb_path = self._find_emby_images(metadata_hash)
            
            # Türleri çek
            genres = self._get_genres_from_emby(row['Id'])
            
            return MovieInfo(
                id=row['Id'],
                name=row['Name'] or 'Bilinmeyen Film',
                original_title=row['OriginalTitle'] or row['Name'] or 'Bilinmeyen Film',
                year=row['ProductionYear'] or 0,
                overview=row['Overview'] or '',
                imdb_id=self._extract_provider_id(row['ProviderIds'], 'Imdb') or '',
                tmdb_id=self._extract_provider_id(row['ProviderIds'], 'Tmdb') or '',
                genres=genres,
                runtime=int(row['RunTimeTicks'] / 10000000) if row['RunTimeTicks'] else 0,  # Ticks to seconds
                rating=row['CommunityRating'] or 0.0,
                poster_path=poster_path,
                backdrop_path=backdrop_path,
                logo_path=logo_path,
                fanart_path=fanart_path,
                thumb_path=thumb_path,
                metadata_hash=metadata_hash,
                file_path=row['Path'] or ''
            )
        except Exception as e:
            print(f"UYARI Film oluşturma hatası: {e}")
            return None
    
    def _create_movie_from_jellyfin_row(self, row) -> Optional[MovieInfo]:
        """Jellyfin veritabanı satırından MovieInfo oluştur"""
        try:
            # Metadata hash hesapla (GUID'den)
            metadata_hash = self._calculate_metadata_hash_from_guid(row['guid'])
            
            # Görsel yollarını bul
            poster_path, backdrop_path, logo_path, fanart_path, thumb_path = self._find_jellyfin_images(metadata_hash)
            
            # Türleri çek
            genres = self._get_genres_from_jellyfin(row['Id'])
            
            return MovieInfo(
                id=row['Id'],
                name=row['Name'] or 'Bilinmeyen Film',
                original_title=row['OriginalTitle'] or row['Name'] or 'Bilinmeyen Film',
                year=row['ProductionYear'] or 0,
                overview=row['Overview'] or '',
                imdb_id=self._extract_provider_id(row['ProviderIds'], 'Imdb') or '',
                tmdb_id=self._extract_provider_id(row['ProviderIds'], 'Tmdb') or '',
                genres=genres,
                runtime=int(row['RunTimeTicks'] / 10000000) if row['RunTimeTicks'] else 0,
                rating=row['CommunityRating'] or 0.0,
                poster_path=poster_path,
                backdrop_path=backdrop_path,
                logo_path=logo_path,
                fanart_path=fanart_path,
                thumb_path=thumb_path,
                metadata_hash=metadata_hash,
                file_path=row['Path'] or ''
            )
        except Exception as e:
            print(f"UYARI Film oluşturma hatası: {e}")
            return None
    
    def _calculate_metadata_hash_from_guid(self, guid_blob) -> str:
        """GUID blob'undan metadata hash hesapla"""
        try:
            # GUID blob'unu hex string'e çevir
            if guid_blob:
                guid_hex = guid_blob.hex()
                # Emby'nin klasör yapısı: ilk 2 karakter + tam hash
                return guid_hex
            else:
                # GUID yoksa item ID'den hash hesapla
                return ""
        except:
            return ""
    
    def _calculate_metadata_hash(self, item_id) -> str:
        """Item ID'den metadata hash hesapla (fallback)"""
        hash_obj = hashlib.md5(str(item_id).encode('utf-8'))
        return hash_obj.hexdigest()
    
    def _extract_provider_id(self, provider_ids: str, provider: str) -> str:
        """ProviderIds JSON'ından belirli provider ID'sini çıkar"""
        if not provider_ids:
            return ""
        
        try:
            import json
            providers = json.loads(provider_ids)
            return providers.get(provider, "")
        except:
            return ""
    
    def _find_emby_images(self, metadata_hash: str) -> Tuple[str, str, str, str, str]:
        """Emby'de görsel dosyalarını bul"""
        metadata_dir = self.config_path / "emby-config" / "metadata" / "library"
        
        # Hash'in ilk 2 karakterini kullan
        hash_prefix = metadata_hash[:2]
        hash_dir = metadata_dir / hash_prefix / metadata_hash
        
        poster_path = str(hash_dir / "poster.jpg") if (hash_dir / "poster.jpg").exists() else ""
        backdrop_path = str(hash_dir / "backdrop1.jpg") if (hash_dir / "backdrop1.jpg").exists() else ""
        logo_path = str(hash_dir / "logo.png") if (hash_dir / "logo.png").exists() else ""
        fanart_path = str(hash_dir / "fanart.jpg") if (hash_dir / "fanart.jpg").exists() else ""
        thumb_path = str(hash_dir / "thumb.jpg") if (hash_dir / "thumb.jpg").exists() else ""
        
        return poster_path, backdrop_path, logo_path, fanart_path, thumb_path
    
    def _find_jellyfin_images(self, metadata_hash: str) -> Tuple[str, str, str, str, str]:
        """Jellyfin'de görsel dosyalarını bul"""
        metadata_dir = self.config_path / "config" / "metadata" / "library"
        
        # Hash'in ilk 2 karakterini kullan
        hash_prefix = metadata_hash[:2]
        hash_dir = metadata_dir / hash_prefix / metadata_hash
        
        poster_path = str(hash_dir / "poster.jpg") if (hash_dir / "poster.jpg").exists() else ""
        backdrop_path = str(hash_dir / "backdrop1.jpg") if (hash_dir / "backdrop1.jpg").exists() else ""
        logo_path = str(hash_dir / "logo.png") if (hash_dir / "logo.png").exists() else ""
        fanart_path = str(hash_dir / "fanart.jpg") if (hash_dir / "fanart.jpg").exists() else ""
        thumb_path = ""  # Jellyfin'de thumb yok
        
        return poster_path, backdrop_path, logo_path, fanart_path, thumb_path
    
    def _get_genres_from_emby(self, item_id: str) -> List[str]:
        """Emby'den türleri çek"""
        db_path = self.config_path / "emby-config" / "data" / "library.db"
        genres = []
        
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            
            query = """
            SELECT g.Name 
            FROM Genres g
            JOIN ItemGenres ig ON g.Id = ig.GenreId
            WHERE ig.ItemId = ?
            """
            
            cursor.execute(query, (item_id,))
            rows = cursor.fetchall()
            genres = [row[0] for row in rows]
            
            conn.close()
        except Exception as e:
            print(f"UYARI Tür çekme hatası: {e}")
        
        return genres
    
    def _get_genres_from_jellyfin(self, item_id: str) -> List[str]:
        """Jellyfin'den türleri çek"""
        db_path = self.config_path / "config" / "data" / "library.db"
        genres = []
        
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            
            query = """
            SELECT g.Name 
            FROM Genres g
            JOIN ItemGenres ig ON g.Id = ig.GenreId
            WHERE ig.ItemId = ?
            """
            
            cursor.execute(query, (item_id,))
            rows = cursor.fetchall()
            genres = [row[0] for row in rows]
            
            conn.close()
        except Exception as e:
            print(f"UYARI Tür çekme hatası: {e}")
        
        return genres
    
    def copy_images(self, movies: List[MovieInfo], source_type: str):
        """Görselleri kopyala"""
        print(f"RESIM {source_type} görselleri kopyalanıyor...")
        
        copied_count = 0
        
        for movie in movies:
            # Film adını dosya adı için temizle
            safe_name = self._sanitize_filename(f"{movie.name} ({movie.year})")
            
            # Poster kopyala
            if movie.poster_path and Path(movie.poster_path).exists():
                dest_path = self.output_path / "posters" / f"{safe_name}_poster.jpg"
                shutil.copy2(movie.poster_path, dest_path)
                copied_count += 1
            
            # Backdrop kopyala
            if movie.backdrop_path and Path(movie.backdrop_path).exists():
                dest_path = self.output_path / "backdrops" / f"{safe_name}_backdrop.jpg"
                shutil.copy2(movie.backdrop_path, dest_path)
                copied_count += 1
            
            # Logo kopyala
            if movie.logo_path and Path(movie.logo_path).exists():
                dest_path = self.output_path / "logos" / f"{safe_name}_logo.png"
                shutil.copy2(movie.logo_path, dest_path)
                copied_count += 1
            
            # Fanart kopyala
            if movie.fanart_path and Path(movie.fanart_path).exists():
                dest_path = self.output_path / "fanarts" / f"{safe_name}_fanart.jpg"
                shutil.copy2(movie.fanart_path, dest_path)
                copied_count += 1
            
            # Thumb kopyala (sadece Emby)
            if movie.thumb_path and Path(movie.thumb_path).exists():
                dest_path = self.output_path / "thumbs" / f"{safe_name}_thumb.jpg"
                shutil.copy2(movie.thumb_path, dest_path)
                copied_count += 1
        
        print(f"OK {copied_count} görsel kopyalandı")
    
    def save_metadata(self, movies: List[MovieInfo], source_type: str):
        """Metadata'ları JSON olarak kaydet"""
        print(f"KAYDET {source_type} metadata'ları kaydediliyor...")
        
        metadata_list = []
        
        for movie in movies:
            metadata_dict = {
                "id": movie.id,
                "name": movie.name,
                "original_title": movie.original_title,
                "year": movie.year,
                "overview": movie.overview,
                "imdb_id": movie.imdb_id,
                "tmdb_id": movie.tmdb_id,
                "genres": movie.genres,
                "runtime": movie.runtime,
                "rating": movie.rating,
                "metadata_hash": movie.metadata_hash,
                "file_path": movie.file_path,
                "images": {
                    "poster": movie.poster_path,
                    "backdrop": movie.backdrop_path,
                    "logo": movie.logo_path,
                    "fanart": movie.fanart_path,
                    "thumb": movie.thumb_path
                }
            }
            metadata_list.append(metadata_dict)
        
        # JSON dosyasını kaydet
        output_file = self.output_path / "metadata" / f"{source_type}_movies.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(metadata_list, f, ensure_ascii=False, indent=2)
        
        print(f"OK {len(metadata_list)} film metadata'sı kaydedildi: {output_file}")
    
    def generate_report(self, movies: List[MovieInfo], source_type: str):
        """Rapor oluştur"""
        print(f"RAPOR {source_type} raporu oluşturuluyor...")
        
        report = {
            "extraction_date": datetime.now().isoformat(),
            "source": source_type,
            "total_movies": len(movies),
            "movies_with_posters": len([m for m in movies if m.poster_path]),
            "movies_with_backdrops": len([m for m in movies if m.backdrop_path]),
            "movies_with_logos": len([m for m in movies if m.logo_path]),
            "movies_with_fanarts": len([m for m in movies if m.fanart_path]),
            "movies_with_thumbs": len([m for m in movies if m.thumb_path]),
            "genres": {},
            "years": {},
            "movies": []
        }
        
        # İstatistikleri hesapla
        for movie in movies:
            # Türler
            for genre in movie.genres:
                report["genres"][genre] = report["genres"].get(genre, 0) + 1
            
            # Yıllar
            if movie.year > 0:
                report["years"][str(movie.year)] = report["years"].get(str(movie.year), 0) + 1
            
            # Film listesi
            report["movies"].append({
                "name": movie.name,
                "year": movie.year,
                "rating": movie.rating,
                "has_poster": bool(movie.poster_path),
                "has_backdrop": bool(movie.backdrop_path),
                "has_logo": bool(movie.logo_path),
                "has_fanart": bool(movie.fanart_path),
                "has_thumb": bool(movie.thumb_path)
            })
        
        # Raporu kaydet
        report_file = self.output_path / "reports" / f"{source_type}_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # Özet raporu yazdır
        print(f"\n📈 {source_type.upper()} ÖZET RAPORU")
        print(f"{'='*50}")
        print(f"Toplam Film: {report['total_movies']}")
        print(f"Poster'ı Olan: {report['movies_with_posters']}")
        print(f"Backdrop'ı Olan: {report['movies_with_backdrops']}")
        print(f"Logo'su Olan: {report['movies_with_logos']}")
        print(f"Fanart'ı Olan: {report['movies_with_fanarts']}")
        print(f"Thumb'ı Olan: {report['movies_with_thumbs']}")
        print(f"Rapor dosyası: {report_file}")
    
    def _sanitize_filename(self, filename: str) -> str:
        """Dosya adını temizle"""
        # Geçersiz karakterleri kaldır
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        
        # Çok uzun dosya adlarını kısalt
        if len(filename) > 100:
            filename = filename[:100]
        
        return filename.strip()

def main():
    """Ana fonksiyon"""
    parser = argparse.ArgumentParser(description='Emby/Jellyfin Metadata Extractor')
    parser.add_argument('--source', choices=['emby', 'jellyfin', 'both'], 
                       default='both', help='Metadata kaynağı')
    parser.add_argument('--config', default='.', 
                       help='Config klasörü yolu (varsayılan: mevcut dizin)')
    parser.add_argument('--output', default='./extracted', 
                       help='Çıktı klasörü (varsayılan: ./extracted)')
    parser.add_argument('--images', action='store_true', 
                       help='Görselleri de kopyala')
    parser.add_argument('--report', action='store_true', 
                       help='Detaylı rapor oluştur')
    
    args = parser.parse_args()
    
    print("Metadata Extractor Baslatiliyor...")
    print(f"Kaynak: {args.source}")
    print(f"Config: {args.config}")
    print(f"Cikti: {args.output}")
    print(f"Gorseller: {'Evet' if args.images else 'Hayir'}")
    print(f"Rapor: {'Evet' if args.report else 'Hayir'}")
    print("="*60)
    
    extractor = MetadataExtractor(args.config, args.output)
    
    if args.source in ['emby', 'both']:
        emby_movies = extractor.extract_from_emby()
        if emby_movies:
            extractor.save_metadata(emby_movies, 'emby')
            if args.images:
                extractor.copy_images(emby_movies, 'emby')
            if args.report:
                extractor.generate_report(emby_movies, 'emby')
    
    if args.source in ['jellyfin', 'both']:
        jellyfin_movies = extractor.extract_from_jellyfin()
        if jellyfin_movies:
            extractor.save_metadata(jellyfin_movies, 'jellyfin')
            if args.images:
                extractor.copy_images(jellyfin_movies, 'jellyfin')
            if args.report:
                extractor.generate_report(jellyfin_movies, 'jellyfin')
    
    print("\nIslem tamamlandi!")
    print(f"Cikti klasoru: {args.output}")

if __name__ == "__main__":
    main()
