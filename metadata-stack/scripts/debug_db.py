#!/usr/bin/env python3
import sqlite3
from pathlib import Path

def debug_emby_db():
    db_path = Path("../emby-config/data/library.db")
    print(f"Veritabani var mi: {db_path.exists()}")
    
    if not db_path.exists():
        print("Veritabani bulunamadi!")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Tüm tabloları listele
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tablolar: {[t[0] for t in tables]}")
        
        # MediaItems tablosundaki tüm kayıtları kontrol et
        cursor.execute("SELECT COUNT(*) FROM MediaItems")
        total = cursor.fetchone()[0]
        print(f"Toplam MediaItems: {total}")
        
        # Farklı türleri kontrol et
        cursor.execute("SELECT DISTINCT type FROM MediaItems")
        types = cursor.fetchall()
        print(f"Item türleri: {[t[0] for t in types]}")
        
        # IsMovie = 1 olanları kontrol et
        cursor.execute("SELECT COUNT(*) FROM MediaItems WHERE IsMovie = 1")
        movies = cursor.fetchone()[0]
        print(f"IsMovie = 1 olanlar: {movies}")
        
        # type = 8 olanları kontrol et (film türü)
        cursor.execute("SELECT COUNT(*) FROM MediaItems WHERE type = 8")
        type8 = cursor.fetchone()[0]
        print(f"type = 8 olanlar: {type8}")
        
        # İlk birkaç kaydı listele
        cursor.execute("SELECT Id, Name, type, IsMovie, IsSeries FROM MediaItems LIMIT 10")
        items = cursor.fetchall()
        print("İlk 10 kayıt:")
        for item in items:
            print(f"  ID: {item[0]}, Ad: {item[1]}, type: {item[2]}, IsMovie: {item[3]}, IsSeries: {item[4]}")
        
        # Film olabilecek kayıtları kontrol et
        cursor.execute("SELECT Id, Name, type, IsMovie, IsSeries FROM MediaItems WHERE type = 8 OR IsMovie = 1 LIMIT 10")
        movie_items = cursor.fetchall()
        print("Film olabilecek kayıtlar:")
        for item in movie_items:
            print(f"  ID: {item[0]}, Ad: {item[1]}, type: {item[2]}, IsMovie: {item[3]}, IsSeries: {item[4]}")
        
        conn.close()
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    debug_emby_db()
