"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Play, Search, Tv, ExternalLink, Menu, X, ChevronLeft, ChevronRight, Heart, HeartOff, Star, StarOff } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { CascaderMenu } from "./CascaderMenu";
import { useFavorites } from "@/hooks/useFavorites";
import type { ChannelCategory, ChannelStream } from "@/types/xtream";

interface ChannelBrowserProps {
  categories: ChannelCategory[];
}

export function ChannelBrowser({ categories }: ChannelBrowserProps) {
  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, "tr", { sensitivity: "base" })),
    [categories]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    orderedCategories[0]?.id ?? ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showChannelFavorites, setShowChannelFavorites] = useState(false);
  const [selectedStream, setSelectedStream] = useState<ChannelStream | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isChannelPanelCollapsed, setIsChannelPanelCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsChannelListOpen(false);
      }
      return next;
    });
  };

  const toggleChannelList = () => {
    setIsChannelListOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsSidebarOpen(false);
      }
      return next;
    });
  };

  const { 
    isChannelFavorite, 
    toggleChannelFavorite, 
    getFavoriteChannels
  } = useFavorites();

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) {
      return orderedCategories[0];
    }

    return orderedCategories.find((category) => category.id === selectedCategoryId) ?? orderedCategories[0];
  }, [orderedCategories, selectedCategoryId]);

  const filteredStreams = useMemo(() => {
    if (!selectedCategory) {
      return [] as ChannelStream[];
    }

    let streams = selectedCategory.streams;
    const term = searchTerm.trim().toLowerCase();

    // Arama terimi varsa filtrele
    if (term) {
      streams = streams.filter((stream) =>
        stream.name.toLowerCase().includes(term)
      );
    }

    // TR ile başlayanları öncele
    const trStreams = streams.filter(stream => 
      stream.name.toLowerCase().startsWith('tr')
    );
    const otherStreams = streams.filter(stream => 
      !stream.name.toLowerCase().startsWith('tr')
    );

    // Favorileri yukarıda göster
    const favoriteTrStreams = getFavoriteChannels(trStreams);
    const favoriteOtherStreams = getFavoriteChannels(otherStreams);
    const nonFavoriteTrStreams = trStreams.filter(stream => 
      !favoriteTrStreams.some(fav => fav.id === stream.id)
    );
    const nonFavoriteOtherStreams = otherStreams.filter(stream => 
      !favoriteOtherStreams.some(fav => fav.id === stream.id)
    );

    if (showChannelFavorites) {
      return [...favoriteTrStreams, ...favoriteOtherStreams];
    }

    // TR kanalları en başta, sonra diğerleri
    return [
      ...favoriteTrStreams,
      ...nonFavoriteTrStreams,
      ...favoriteOtherStreams,
      ...nonFavoriteOtherStreams
    ];
  }, [selectedCategory, searchTerm, showChannelFavorites, getFavoriteChannels]);

  const activeStreamId = selectedStream?.id ?? null;

  const totals = useMemo(() => {
    const totalStreams = categories.reduce(
      (accumulator, category) => accumulator + category.streams.length,
      0
    );

    return {
      totalStreams,
      totalCategories: categories.length
    };
  }, [categories]);

  const handlePlayStream = (stream: ChannelStream) => {
    setSelectedStream(stream);
    setIsPlayerOpen(true);
    setIsChannelListOpen(false); // Close channel list on mobile when playing
  };

  const handleChannelSelect = (stream: ChannelStream) => {
    handlePlayStream(stream);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedStream(null);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 lg:flex-row">
      {/* Mobile Menu Buttons */}
      <div className="fixed top-4 left-4 z-50 lg:hidden flex gap-2">
        <button
          onClick={toggleSidebar}
          className="rounded-lg bg-black/60 p-2.5 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleChannelList}
          className="rounded-lg bg-black/60 p-2.5 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
        >
          <Tv className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {(isSidebarOpen || isChannelListOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsChannelListOpen(false);
          }}
        />
      )}

      {/* Categories Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 bg-slate-900/95 backdrop-blur-md border-r border-white/10 transition-transform duration-300 ease-in-out shadow-2xl shadow-black/40 lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isMenuCollapsed ? "w-12" : "w-[85vw] max-w-sm sm:w-80 lg:w-72"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Collapse Toggle */}
          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-white/10">
            {!isMenuCollapsed && (
              <div className="flex gap-1 text-xs text-slate-300">
                <div className="flex items-center gap-1 rounded-full bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <Tv className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                  <span className="font-medium text-white text-xs">{totals.totalStreams}</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-medium text-white text-xs">{totals.totalCategories}</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
              className="rounded-md p-1 sm:p-1.5 text-slate-400 hover:text-white transition-colors"
              title={isMenuCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            >
              {isMenuCollapsed ? <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
            </button>
          </div>

          {/* Menu Content */}
          {!isMenuCollapsed && (
            <div className="flex-1 min-h-0 p-2 sm:p-3">
              <CascaderMenu
                categories={orderedCategories}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={(categoryId) => {
                  setSelectedCategoryId(categoryId);
                  setSearchTerm("");
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          )}

          {/* Collapsed Menu Icons */}
          {isMenuCollapsed && (
            <div className="flex-1 flex flex-col items-center py-4 space-y-2">
              <div className="rounded-md p-2 bg-white/5 text-slate-400">
                <Tv className="h-4 w-4" />
              </div>
              <div className="rounded-md p-2 bg-white/5 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Channel List Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-l border-white/10 transition-transform duration-300 ease-in-out shadow-2xl shadow-black/40 lg:shadow-none",
          isChannelListOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          isChannelPanelCollapsed ? "w-12" : "w-[85vw] max-w-sm sm:w-80 lg:w-72"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Channel Panel Header */}
          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-white/10">
            {!isChannelPanelCollapsed && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    {selectedCategory?.name || "Kanallar"}
                  </h2>
                  <button
                    onClick={() => setShowChannelFavorites(!showChannelFavorites)}
                    className={clsx(
                      "rounded-md p-1 sm:p-1.5 transition-colors",
                      showChannelFavorites 
                        ? "bg-yellow-500/20 text-yellow-400" 
                        : "bg-white/5 text-slate-400 hover:text-white"
                    )}
                    title={showChannelFavorites ? "Tüm kanalları göster" : "Sadece favorileri göster"}
                  >
                    {showChannelFavorites ? <Star className="h-3 w-3 sm:h-4 sm:w-4" /> : <StarOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </button>
                </div>
                
                {/* Channel Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-500" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kanal ara..."
                    className="w-full rounded-md border border-white/10 bg-slate-950/60 py-1.5 sm:py-2 pl-7 pr-2 text-xs text-white shadow-inner placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                
                <p className="text-xs text-slate-300 mt-1">
                  {filteredStreams.length} kanal bulundu
                </p>
              </div>
            )}
            <button
              onClick={() => setIsChannelPanelCollapsed(!isChannelPanelCollapsed)}
              className="rounded-md p-1 sm:p-1.5 text-slate-400 hover:text-white transition-colors"
              title={isChannelPanelCollapsed ? "Panel genişlet" : "Panel daralt"}
            >
              {isChannelPanelCollapsed ? <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
            </button>
          </div>

          {/* Channel List Content */}
          {!isChannelPanelCollapsed && (
            <div className="flex-1 min-h-0 p-2 sm:p-3">
              <div className="h-full overflow-y-auto space-y-1 pr-2 scrollbar-thin">
                {filteredStreams.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-center text-slate-400">
                    <p className="text-xs">Seçili kategori için kanal bulunamadı.</p>
                  </div>
                ) : (
                  filteredStreams.map((stream) => (
                    <ChannelListItem
                      key={stream.id}
                      stream={stream}
                      onPlay={handlePlayStream}
                      isFavorite={isChannelFavorite(stream.id)}
                      onToggleFavorite={() => toggleChannelFavorite(stream.id)}
                      isActive={activeStreamId === stream.id}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Collapsed Panel Icons */}
          {isChannelPanelCollapsed && (
            <div className="flex-1 flex flex-col items-center py-4 space-y-2">
              <div className="rounded-md p-2 bg-white/5 text-slate-400">
                <Tv className="h-4 w-4" />
              </div>
              <div className="text-xs text-slate-500 text-center">
                {filteredStreams.length}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Video Player Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedStream && isPlayerOpen ? (
          <div className="h-full w-full bg-black">
            <VideoPlayer
              streamUrl={selectedStream.streamUrl}
              channelName={selectedStream.name}
              isOpen={true}
              onClose={handleClosePlayer}
              isEmbedded={true}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900/50">
            <div className="text-center text-slate-400">
              <Tv className="h-16 w-16 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-semibold mb-2">Video Oynatıcı</h3>
              <p className="text-sm">Bir kanal seçin ve oynatın</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

interface ChannelListItemProps {
  stream: ChannelStream;
  onPlay: (stream: ChannelStream) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isActive: boolean;
}


function ChannelListItem({ stream, onPlay, isFavorite, onToggleFavorite, isActive }: ChannelListItemProps) {
  const handlePlayClick = () => {
    onPlay(stream);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(stream.streamUrl, "_blank", "noopener,noreferrer");
  };

  const containerClasses = clsx(
    "group flex items-center gap-2 rounded-md p-2 transition-all hover:border-primary/50 hover:bg-white/10",
    isActive ? "border-primary bg-primary/20 shadow-lg shadow-primary/20" : "border-white/10 bg-white/5"
  );

  const titleClasses = clsx(
    "truncate text-xs font-semibold transition-colors",
    isActive ? "text-white" : "text-white group-hover:text-primary"
  );

  const subtitleClasses = clsx(
    "text-xs",
    isActive ? "text-white/80" : "text-slate-400"
  );

  const initialClasses = clsx(
    "text-xs font-semibold uppercase",
    isActive ? "text-white/80" : "text-white/60"
  );

  return (
    <div className={containerClasses}>
      {/* Channel Logo */}
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-gradient-to-tr from-slate-800 to-slate-700">
        {stream.streamIcon ? (
          <Image
            src={stream.streamIcon}
            alt={stream.name}
            fill
            sizes="32px"
            className="object-contain object-center p-0.5"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className={initialClasses}>
              {stream.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0">
        <h3 className={titleClasses}>
          {stream.name}
        </h3>
        <p className={subtitleClasses}>
          {stream.streamType === "live" ? "Canlı" : stream.streamType}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={clsx(
            "group/btn inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition",
            isFavorite
              ? "text-red-400 hover:text-red-300"
              : "text-slate-500 hover:text-slate-300"
          )}
          title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          {isFavorite ? <Heart className="h-3 w-3" /> : <HeartOff className="h-3 w-3" />}
        </button>
        <button
          onClick={handlePlayClick}
          className={clsx(
            "group/btn inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-white transition hover:bg-primary/80",
            isActive && "ring-2 ring-primary/60 ring-offset-1 ring-offset-slate-900"
          )}
        >
          <Play className="h-3 w-3 transition-transform group-hover/btn:scale-110" />
        </button>
        <button
          onClick={handleExternalClick}
          className="group/btn inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/5 px-1.5 py-1 text-xs font-medium text-white transition hover:bg-white/10"
          title="Yeni sekmede aç"
        >
          <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:scale-110" />
        </button>
      </div>
    </div>
  );
}





















