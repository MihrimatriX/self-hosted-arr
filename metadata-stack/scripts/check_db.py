#!/usr/bin/env python3
import sqlite3
import sys
from pathlib import Path

def check_emby_db():
    db_path = Path("../emby-config/data/library.db")
    if not db_path.exists():
        print(f"Veritabani bulunamadi: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Tabloları listele
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("Emby veritabani tablolari:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Items tablosunu kontrol et
        if any('Items' in table[0] for table in tables):
            items_table = next(table[0] for table in tables if 'Items' in table[0])
            print(f"\n{items_table} tablosu yapisi:")
            cursor.execute(f"PRAGMA table_info({items_table});")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            
            # Film sayısını kontrol et
            cursor.execute(f"SELECT COUNT(*) FROM {items_table} WHERE Type = 'Movie';")
            movie_count = cursor.fetchone()[0]
            print(f"\nToplam film sayisi: {movie_count}")
            
            # İlk birkaç filmi listele
            cursor.execute(f"SELECT Name, ProductionYear FROM {items_table} WHERE Type = 'Movie' LIMIT 5;")
            movies = cursor.fetchall()
            print("\nİlk 5 film:")
            for movie in movies:
                print(f"  - {movie[0]} ({movie[1]})")
        
        conn.close()
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    check_emby_db()
