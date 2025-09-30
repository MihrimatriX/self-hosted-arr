import "server-only";
import type {
  ChannelCategory,
  ChannelStream,
  XtreamCategory,
  XtreamStream
} from "@/types/xtream";

export class XtreamApiError extends Error {
  status: number;
  body?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "XtreamApiError";
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, XtreamApiError.prototype);
  }
}

const DEFAULT_API_BASE = "http://tgrpro25.xyz:8080/player_api.php";
const XTREAM_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0";

const API_BASE = process.env.XTREAM_API_BASE ?? DEFAULT_API_BASE;
const USERNAME = process.env.XTREAM_USERNAME;
const PASSWORD = process.env.XTREAM_PASSWORD;
const SESSION_COOKIE = process.env.XTREAM_SESSION_COOKIE;

const XTREAM_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "tr,en-US;q=0.9,en;q=0.8",
  "Cache-Control": "max-age=0",
  Connection: "keep-alive",
  DNT: "1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": XTREAM_USER_AGENT
} as const;

function ensureCredentials() {
  if (!USERNAME || !PASSWORD) {
    throw new Error(
      "Xtream servis bilgileri eksik. Lutfen XTREAM_USERNAME ve XTREAM_PASSWORD environment degiskenlerini tanimlayin."
    );
  }
}

function buildXtreamUrl(searchParams: Record<string, string | number>) {
  ensureCredentials();

  const url = new URL(API_BASE);
  const params = new URLSearchParams({
    username: USERNAME!,
    password: PASSWORD!,
    ...Object.fromEntries(
      Object.entries(searchParams).map(([key, value]) => [key, String(value)])
    )
  });

  url.search = params.toString();
  return url;
}

async function xtreamRequest<T>(params: Record<string, string | number>): Promise<T> {
  const url = buildXtreamUrl(params);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        ...XTREAM_HEADERS,
        ...(SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {})
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? `Xtream API cagrisinda baglanti kurulamadi: ${error.message}`
        : "Xtream API cagrisinda baglanti kurulamadi.";

    throw new XtreamApiError(message, 503);
  }

  const rawBody = await response.text();

  if (!response.ok) {
    throw new XtreamApiError(
      `Xtream API istegi basarisiz oldu (${response.status})`,
      response.status,
      rawBody.slice(0, 500)
    );
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch (error) {
    throw new XtreamApiError(
      "Xtream API beklenmedik bir yanit dondurdu.",
      502,
      rawBody.slice(0, 500)
    );
  }
}

function normaliseStreams(streams: XtreamStream[]): ChannelStream[] {
  const baseUrl = new URL(API_BASE);
  const origin = `${baseUrl.protocol}//${baseUrl.host}`;

  return streams
    .map((stream) => {
      const streamType = stream.stream_type?.toLowerCase() ?? "live";
      const extension = streamType === "live" ? "m3u8" : "mp4";
      const folder = streamType === "live" ? "live" : "movie";

      // Orijinal stream URL'i
      const originalStreamUrl = `${origin}/${folder}/${USERNAME}/${PASSWORD}/${stream.stream_id}.${extension}`;
      
      // Proxy URL'sini olustur - base URL varsa onu kullan, yoksa relative path
      const proxyBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
      const streamRefererRaw =
        process.env.XTREAM_STREAM_REFERER?.trim() ?? originalStreamUrl;
      let resolvedStreamReferer: string | null = streamRefererRaw;

      if (resolvedStreamReferer) {
        try {
          resolvedStreamReferer = new URL(resolvedStreamReferer).toString();
        } catch {
          resolvedStreamReferer = originalStreamUrl;
        }
      }

      const proxyParams = new URLSearchParams({ url: originalStreamUrl });

      if (resolvedStreamReferer) {
        proxyParams.set("referer", resolvedStreamReferer);
      }

      const proxyPath = `/api/proxy/stream?${proxyParams.toString()}`;
      const proxyUrl = proxyBaseUrl ? `${proxyBaseUrl}${proxyPath}` : proxyPath;

      const normalised: ChannelStream = {
        id: stream.stream_id,
        name: stream.name,
        streamType,
        streamIcon: stream.stream_icon ?? null,
        added: stream.added,
        streamUrl: proxyUrl
      };

      return normalised;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "tr", { sensitivity: "base" }));
}

async function getLiveCategories(): Promise<XtreamCategory[]> {
  return xtreamRequest<XtreamCategory[]>({ action: "get_live_categories" });
}

async function getLiveStreamsByCategory(categoryId: string): Promise<XtreamStream[]> {
  return xtreamRequest<XtreamStream[]>({
    action: "get_live_streams",
    category_id: categoryId
  });
}

export async function getCategoriesWithStreams(): Promise<ChannelCategory[]> {
  ensureCredentials();

  const categories = await getLiveCategories();
  const categoriesWithStreams: ChannelCategory[] = [];

  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];
    try {
      const streams = await getLiveStreamsByCategory(category.category_id);

      const normalisedCategory: ChannelCategory = {
        id: category.category_id,
        name: category.category_name,
        parentId: category.parent_id,
        order: Number.parseInt(category.category_id, 10) || index,
        streams: normaliseStreams(streams)
      };

      if (normalisedCategory.streams.length > 0) {
        categoriesWithStreams.push(normalisedCategory);
      }
    } catch (error) {
      console.warn(
        `Kategori streamleri alinamadi (${category.category_name} - ${category.category_id})`,
        error
      );
    }
  }

  return categoriesWithStreams.sort((a, b) =>
    a.name.localeCompare(b.name, "tr", { sensitivity: "base" })
  );
}

export type { ChannelCategory, ChannelStream };
