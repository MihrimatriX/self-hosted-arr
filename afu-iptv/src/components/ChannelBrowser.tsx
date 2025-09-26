"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Play, Search, Tv, ExternalLink, Menu, X } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
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
  const [selectedStream, setSelectedStream] = useState<ChannelStream | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);

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

    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return selectedCategory.streams;
    }

    return selectedCategory.streams.filter((stream) =>
      stream.name.toLowerCase().includes(term)
    );
  }, [selectedCategory, searchTerm]);

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

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedStream(null);
  };

  return (
    <div className="h-screen w-screen flex bg-slate-950">
      {/* Mobile Menu Buttons */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-black/60 p-3 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <button
        onClick={() => setIsChannelListOpen(!isChannelListOpen)}
        className="fixed top-4 left-20 z-50 lg:hidden rounded-lg bg-black/60 p-3 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
      >
        <Tv className="h-6 w-6" />
      </button>

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
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-md border-r border-white/10 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col p-3">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-2">Kategoriler</h2>
            <div className="flex gap-1 text-xs text-slate-300">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
                <Tv className="h-3 w-3 text-primary" />
                <span className="font-medium text-white">{totals.totalStreams}</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-medium text-white">{totals.totalCategories}</span>
              </div>
            </div>
          </div>
          
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Kanal ara..."
              className="w-full rounded-md border border-white/10 bg-slate-950/60 py-2 pl-7 pr-2 text-xs text-white shadow-inner placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {orderedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setSearchTerm("");
                  setIsSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={clsx(
                  "w-full truncate rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-all",
                  selectedCategory?.id === category.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/60 hover:text-primary"
                )}
                title={category.name}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Channel List Sidebar */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-64 z-50 w-64 bg-slate-900/95 backdrop-blur-md border-r border-white/10 transition-transform duration-300 ease-in-out",
        isChannelListOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col p-3">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-1">
              {selectedCategory?.name || "Kanallar"}
            </h2>
            <p className="text-xs text-slate-300">
              {filteredStreams.length} kanal bulundu
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
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
                />
              ))
            )}
          </div>
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
}

function ChannelListItem({ stream, onPlay }: ChannelListItemProps) {
  const handlePlayClick = () => {
    onPlay(stream);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(stream.streamUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-2 transition-all hover:border-primary/50 hover:bg-white/10">
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
            <span className="text-xs font-semibold uppercase text-white/60">
              {stream.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-xs font-semibold text-white group-hover:text-primary transition-colors">
          {stream.name}
        </h3>
        <p className="text-xs text-slate-400">
          {stream.streamType === "live" ? "Canlı" : stream.streamType}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={handlePlayClick}
          className="group/btn inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-white transition hover:bg-primary/80"
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
