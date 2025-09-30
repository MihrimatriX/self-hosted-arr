import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0";

const PASS_THROUGH_HEADERS = new Set([
  "range",
  "if-none-match",
  "if-modified-since",
  "accept",
  "accept-encoding",
  "accept-language",
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-dest"
]);

const PLAYLIST_CONTENT_TYPES = [
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "application/mpegurl",
  "audio/mpegurl"
];

const SKIPPED_PROXY_HEADERS = new Set([
  "content-security-policy",
  "content-length",
  "transfer-encoding"
]);

const PROXY_PATH = "/api/proxy/stream";
const SESSION_COOKIE = process.env.XTREAM_SESSION_COOKIE ?? null;

function isPlaylistContentType(contentType?: string | null) {
  if (!contentType) {
    return false;
  }

  const lowered = contentType.toLowerCase();
  return PLAYLIST_CONTENT_TYPES.some((type) => lowered.includes(type));
}

function buildProxiedUrl(resource: string, baseUrl: URL): string | null {
  if (!resource) {
    return null;
  }

  try {
    const absolute = new URL(resource, baseUrl);

    if (absolute.pathname.startsWith(PROXY_PATH)) {
      return resource;
    }

    const params = new URLSearchParams({ url: absolute.toString() });
    params.set("referer", baseUrl.toString());

    return `${PROXY_PATH}?${params.toString()}`;
  } catch {
    return null;
  }
}

function rewritePlaylist(body: string, baseUrl: URL) {
  const newline = body.includes("\r\n") ? "\r\n" : "\n";
  const lines = body.split(/\r?\n/);

  return lines
    .map((line) => {
      if (!line) {
        return line;
      }

      let rewrittenLine = line.replace(/URI=(['"])(.+?)\1/gi, (match, quote, value) => {
        const proxied = buildProxiedUrl(value, baseUrl);
        return proxied ? `URI=${quote}${proxied}${quote}` : match;
      });

      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return rewrittenLine;
      }

      const proxied = buildProxiedUrl(trimmed, baseUrl);
      if (!proxied) {
        return rewrittenLine;
      }

      return rewrittenLine.replace(trimmed, proxied);
    })
    .join(newline);
}

function applyCors<T extends Response | NextResponse>(response: T): T {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Range, Accept, Origin, Referer"
  );
  response.headers.set(
    "Access-Control-Expose-Headers",
    "Accept-Ranges, Content-Length, Content-Range"
  );
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const streamUrl = searchParams.get("url");
  const refererParam = searchParams.get("referer");

  if (!streamUrl) {
    return applyCors(
      NextResponse.json({ error: "Stream URL is required" }, { status: 400 })
    );
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);
    const targetUrl = new URL(decodedUrl);

    let refererHeader = refererParam?.trim();
    if (refererHeader) {
      try {
        refererHeader = new URL(refererHeader, targetUrl).toString();
      } catch {
        refererHeader = refererParam;
      }
    }

    const upstreamHeaders = new Headers({
      "User-Agent": process.env.XTREAM_USER_AGENT ?? DEFAULT_USER_AGENT,
      Accept: request.headers.get("accept") ?? "*/*",
      "Accept-Language":
        request.headers.get("accept-language") ?? "tr,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache"
    });

    if (refererHeader) {
      upstreamHeaders.set("Referer", refererHeader);
    } else {
      upstreamHeaders.set("Referer", `${targetUrl.origin}/`);
    }

    for (const header of PASS_THROUGH_HEADERS) {
      if (upstreamHeaders.has(header)) {
        continue;
      }

      const value = request.headers.get(header);
      if (value) {
        upstreamHeaders.set(header, value);
      }
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
      upstreamHeaders.set("X-Forwarded-For", forwardedFor);
    }

    if (SESSION_COOKIE && !upstreamHeaders.has("cookie")) {
      upstreamHeaders.set("Cookie", SESSION_COOKIE);
    }

    let upstreamResponse = await fetch(targetUrl, {
      method: "GET",
      headers: upstreamHeaders,
      redirect: "follow",
      signal: request.signal,
      cache: "no-store"
    });

    if (upstreamResponse.status === 403) {
      upstreamHeaders.delete("Referer");
      upstreamResponse = await fetch(targetUrl, {
        method: "GET",
        headers: upstreamHeaders,
        redirect: "follow",
        signal: request.signal,
        cache: "no-store"
      });
    }

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const detail = await upstreamResponse.text().catch(() => undefined);
      console.warn("Proxy upstream error", {
        status: upstreamResponse.status,
        detail: detail?.slice(0, 200)
      });

      return applyCors(
        NextResponse.json(
          { error: "Stream not available", status: upstreamResponse.status },
          { status: upstreamResponse.status || 502 }
        )
      );
    }

    const contentType = upstreamResponse.headers.get("content-type");
    const responseHeaders = new Headers();

    for (const [key, value] of upstreamResponse.headers.entries()) {
      if (SKIPPED_PROXY_HEADERS.has(key.toLowerCase())) {
        continue;
      }

      responseHeaders.set(key, value);
    }

    responseHeaders.set(
      "Content-Type",
      contentType ?? "application/octet-stream"
    );
    responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");

    if (isPlaylistContentType(contentType)) {
      const text = await upstreamResponse.text();
      const rewritten = rewritePlaylist(text, targetUrl);
      responseHeaders.delete("content-length");

      return applyCors(
        new NextResponse(rewritten, {
          status: upstreamResponse.status,
          headers: responseHeaders
        })
      );
    }

    return applyCors(
      new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: responseHeaders
      })
    );
  } catch (error) {
    console.error("Stream proxy error", error);
    return applyCors(
      NextResponse.json({ error: "Failed to fetch stream" }, { status: 500 })
    );
  }
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 200 }));
}
