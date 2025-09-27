import { ChannelBrowser } from "@/components/ChannelBrowser";
import { getCategoriesWithStreams, XtreamApiError } from "@/lib/xtream";
import type { ChannelCategory } from "@/types/xtream";
import { AuthWrapper } from "@/components/AuthWrapper";

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
    <main className="h-screen w-screen overflow-hidden">
      <AuthWrapper>
        {errorMessage ? (
          <div className="flex h-full items-center justify-center">
            <section className="card-glass flex flex-col items-center gap-4 rounded-3xl border border-red-500/40 bg-red-500/10 p-10 text-center text-red-200">
              <h2 className="text-xl font-semibold">Xtream verileri su anda yuklenemedi</h2>
              <p className="max-w-2xl text-sm text-red-100/80">{errorMessage}</p>
              <p className="text-xs text-red-100/70">
                Sorun devam ederse Xtream servis durumunu ve env ayarlarinizi kontrol edin.
              </p>
            </section>
          </div>
        ) : (
          <ChannelBrowser categories={categories} />
        )}
      </AuthWrapper>
    </main>
  );
}

