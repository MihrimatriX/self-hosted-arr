#!/usr/bin/env python3
import sqlite3
import json
from pathlib import Path

def add_test_movie():
    db_path = Path("../emby-config/data/library.db")
    if not db_path.exists():
        print("Veritabani bulunamadi")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Test filmi ekle
        provider_ids = json.dumps({
            "Imdb": "tt0111161",
            "Tmdb": "278"
        })
        
        cursor.execute("""
            INSERT INTO MediaItems (
                Id, Name, OriginalTitle, ProductionYear, Overview,
                ProviderIds, RunTimeTicks, CommunityRating,
                Path, DateCreated, DateModified, IsMovie, type
            ) VALUES (
                999, 'The Shawshank Redemption', 'The Shawshank Redemption', 1994,
                'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                ?, 92400000000, 9.3,
                '/data/movies/The Shawshank Redemption (1994)/The Shawshank Redemption (1994).mkv',
                strftime('%s', 'now'), strftime('%s', 'now'), 1, 8
            )
        """, (provider_ids,))
        
        conn.commit()
        conn.close()
        
        print("Test filmi eklendi: The Shawshank Redemption (1994)")
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    add_test_movie()
