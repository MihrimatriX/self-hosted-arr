"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { Play, Search, Tv } from "lucide-react";
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

  return (
    <section className="card-glass rounded-3xl p-8 shadow-2xl">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Canli Kanal Rehberi
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Xtream Codes servinizdeki kategorileri kesfedin, kanal listelerinde arama yapin
            ve tek tikla yayin adresine ulasin.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <Tv className="h-4 w-4 text-primary" />
            <span className="font-medium text-white">{totals.totalStreams}</span>
            <span>kanal</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span className="font-medium text-white">{totals.totalCategories}</span>
            <span>kategori</span>
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Kanal ara..."
            className="w-full rounded-full border border-white/10 bg-slate-950/60 py-3 pl-12 pr-4 text-sm text-white shadow-inner placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <nav className="scrollbar-thin -mx-2 flex gap-3 overflow-x-auto pb-2">
          {orderedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategoryId(category.id);
                setSearchTerm("");
              }}
              className={clsx(
                "shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition-all",
                selectedCategory?.id === category.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/60 hover:text-primary"
              )}
            >
              {category.name}
            </button>
          ))}
        </nav>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredStreams.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
              Secili kategori icin kanal bulunamadi.
            </div>
          ) : (
            filteredStreams.map((stream) => <ChannelCard key={stream.id} stream={stream} />)
          )}
        </div>
      </div>
    </section>
  );
}

function ChannelCard({ stream }: { stream: ChannelStream }) {
  return (
    <article className="card-glass flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800">
        {stream.streamIcon ? (
          <Image
            src={stream.streamIcon}
            alt={stream.name}
            fill
            sizes="200px"
            className="object-contain object-center p-4"
          />
        ) : (
          <span className="text-4xl font-semibold uppercase tracking-widest text-white/40">
            {stream.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{stream.name}</h3>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {stream.streamType === "live" ? "Canli" : stream.streamType}
          </p>
        </div>
        <Link
          href={stream.streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
        >
          <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
          Yayini Ac
        </Link>
      </div>
    </article>
  );
}
