import { Sparkles, Wand2 } from "lucide-react";
import { ChannelBrowser } from "@/components/ChannelBrowser";
import { getCategoriesWithStreams, XtreamApiError } from "@/lib/xtream";
import type { ChannelCategory } from "@/types/xtream";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: ChannelCategory[] = [];
  let errorMessage: string | null = null;

  try {
    categories = await getCategoriesWithStreams();
  } catch (error) {
    console.error("Xtream verileri cekilirken hata olustu", error);

    if (error instanceof XtreamApiError) {
      if (error.status === 401 || error.status === 403) {
        errorMessage = "Xtream kimlik bilgileri dogrulanamadi. Lutfen .env ayarlarinizi kontrol edin.";
      } else if (error.status >= 500) {
        errorMessage = "Xtream servisi su anda yanit vermiyor. Lutfen bir sure sonra tekrar deneyin.";
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "Xtream verileri yuklenirken beklenmeyen bir hata olustu.";
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-emerald-400/20 opacity-80" />
        <div className="absolute -right-40 -top-40 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 text-white md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs uppercase tracking-widest text-white/70">
              <Sparkles className="h-4 w-4" /> Xtream Codes entegrasyonu
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              AFU IPTV ile kategorileri kesfedin,
              <br />
              yayinlara tek tikla erisin.
            </h1>
            <p className="mt-4 text-base text-slate-200">
              Xtream servinizden canli kategorileri ve kanallari cekerek modern, hizli ve sik bir kullanici deneyimi sunar. Kategoriler arasinda gezinin, favori kanalinizi bulun ve yayin baglantisini dogrudan acin.
            </p>
          </div>
          <div className="card-glass max-w-sm rounded-2xl p-6 text-sm text-slate-200">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
              <Wand2 className="h-6 w-6 text-primary" />
              Akilli Filtreleme
            </div>
            <p className="mt-3 text-slate-300">
              Arama kutusunu kullanarak kategori icinde hizlica kanal arayin. Kalan listeler aninda guncellenir.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li>- Kategorileri tek tikla degistirin</li>
              <li>- Canli yayin baglantisini yeni sekmede baslatin</li>
              <li>- Kanal logolarini otomatik olarak goruntuleyin</li>
            </ul>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <section className="card-glass flex flex-col items-center gap-4 rounded-3xl border border-red-500/40 bg-red-500/10 p-10 text-center text-red-200">
          <h2 className="text-xl font-semibold">Xtream verileri su anda yuklenemedi</h2>
          <p className="max-w-2xl text-sm text-red-100/80">{errorMessage}</p>
          <p className="text-xs text-red-100/70">
            Sorun devam ederse Xtream servis durumunu ve env ayarlarinizi kontrol edin.
          </p>
        </section>
      ) : (
        <ChannelBrowser categories={categories} />
      )}
    </main>
  );
}
