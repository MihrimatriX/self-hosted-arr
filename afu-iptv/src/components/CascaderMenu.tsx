"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { ChevronRight, ChevronDown, Heart, HeartOff, Star, StarOff } from "lucide-react";
import type { ChannelCategory, ChannelStream } from "@/types/xtream";
import { useFavorites } from "@/hooks/useFavorites";

interface CascaderMenuProps {
  categories: ChannelCategory[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  onChannelSelect: (channel: ChannelStream) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function CascaderMenu({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  onChannelSelect,
  searchTerm,
  onSearchChange 
}: CascaderMenuProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const { 
    isCategoryFavorite, 
    isChannelFavorite, 
    toggleCategoryFavorite, 
    toggleChannelFavorite,
    getFavoriteCategories,
    getFavoriteChannels 
  } = useFavorites();

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, "tr", { sensitivity: "base" })),
    [categories]
  );

  const favoriteCategories = useMemo(
    () => getFavoriteCategories(orderedCategories),
    [orderedCategories, getFavoriteCategories]
  );

  const displayCategories = showFavorites ? favoriteCategories : orderedCategories;

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    toggleCategoryExpansion(categoryId);
    onCategorySelect(categoryId);
  };

  const filteredStreams = useMemo(() => {
    if (!selectedCategoryId) return [];
    
    const category = orderedCategories.find(cat => cat.id === selectedCategoryId);
    if (!category) return [];

    const term = searchTerm.trim().toLowerCase();
    if (!term) return category.streams;

    return category.streams.filter(stream =>
      stream.name.toLowerCase().includes(term)
    );
  }, [selectedCategoryId, orderedCategories, searchTerm]);

  const favoriteStreams = useMemo(
    () => getFavoriteChannels(filteredStreams),
    [filteredStreams, getFavoriteChannels]
  );

  const displayStreams = showFavorites ? favoriteStreams : filteredStreams;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Kategoriler</h2>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={clsx(
              "rounded-md p-1.5 transition-colors",
              showFavorites 
                ? "bg-yellow-500/20 text-yellow-400" 
                : "bg-white/5 text-slate-400 hover:text-white"
            )}
            title={showFavorites ? "Tüm kategorileri göster" : "Sadece favorileri göster"}
          >
            {showFavorites ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Search */}
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Kanal ara..."
          className="w-full rounded-md border border-white/10 bg-slate-950/60 py-2 px-3 text-xs text-white shadow-inner placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {displayCategories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-center text-slate-400">
            <p className="text-xs">
              {showFavorites ? "Henüz favori kategori yok" : "Kategori bulunamadı"}
            </p>
          </div>
        ) : (
          displayCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const isSelected = selectedCategoryId === category.id;
            const isFavorite = isCategoryFavorite(category.id);

            return (
              <div key={category.id} className="space-y-1">
                {/* Category Item */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={clsx(
                      "flex-1 flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-all",
                      isSelected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/60 hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <span className="truncate">{category.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-auto">
                      ({category.streams.length})
                    </span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategoryFavorite(category.id);
                    }}
                    className={clsx(
                      "rounded-md p-1 transition-colors",
                      isFavorite 
                        ? "text-red-400 hover:text-red-300" 
                        : "text-slate-500 hover:text-slate-300"
                    )}
                    title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                  >
                    {isFavorite ? <Heart className="h-3 w-3" /> : <HeartOff className="h-3 w-3" />}
                  </button>
                </div>

                {/* Channels List */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {category.streams.slice(0, 10).map((stream) => {
                      const isStreamFavorite = isChannelFavorite(stream.id);
                      
                      return (
                        <div key={stream.id} className="flex items-center gap-1">
                          <button
                            onClick={() => onChannelSelect(stream)}
                            className="flex-1 flex items-center gap-2 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-left text-xs text-slate-300 hover:border-primary/40 hover:text-primary transition-all"
                          >
                            <span className="truncate">{stream.name}</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChannelFavorite(stream.id);
                            }}
                            className={clsx(
                              "rounded-md p-1 transition-colors",
                              isStreamFavorite 
                                ? "text-red-400 hover:text-red-300" 
                                : "text-slate-500 hover:text-slate-300"
                            )}
                            title={isStreamFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                          >
                            {isStreamFavorite ? <Heart className="h-3 w-3" /> : <HeartOff className="h-3 w-3" />}
                          </button>
                        </div>
                      );
                    })}
                    
                    {category.streams.length > 10 && (
                      <div className="text-xs text-slate-500 px-2 py-1">
                        +{category.streams.length - 10} daha...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Category Channels */}
      {selectedCategoryId && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="text-sm font-semibold text-white mb-2">
            {showFavorites ? "Favori Kanallar" : "Kanallar"} 
            ({displayStreams.length})
          </h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {displayStreams.slice(0, 20).map((stream) => {
              const isStreamFavorite = isChannelFavorite(stream.id);
              
              return (
                <div key={stream.id} className="flex items-center gap-1">
                  <button
                    onClick={() => onChannelSelect(stream)}
                    className="flex-1 flex items-center gap-2 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-left text-xs text-slate-300 hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <span className="truncate">{stream.name}</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChannelFavorite(stream.id);
                    }}
                    className={clsx(
                      "rounded-md p-1 transition-colors",
                      isStreamFavorite 
                        ? "text-red-400 hover:text-red-300" 
                        : "text-slate-500 hover:text-slate-300"
                    )}
                    title={isStreamFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                  >
                    {isStreamFavorite ? <Heart className="h-3 w-3" /> : <HeartOff className="h-3 w-3" />}
                  </button>
                </div>
              );
            })}
            
            {displayStreams.length > 20 && (
              <div className="text-xs text-slate-500 px-2 py-1">
                +{displayStreams.length - 20} daha...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
