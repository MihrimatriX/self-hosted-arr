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
  "sec-fetch-dest",
]);

const PLAYLIST_CONTENT_TYPES = [
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "application/mpegurl",
  "audio/mpegurl",
];

const SKIPPED_PROXY_HEADERS = new Set([
  "content-security-policy",
  "content-length",
  "transfer-encoding",
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

      let rewrittenLine = line.replace(
        /URI=(['"])(.+?)\1/gi,
        (match, quote, value) => {
          const proxied = buildProxiedUrl(value, baseUrl);
          return proxied ? `URI=${quote}${proxied}${quote}` : match;
        }
      );

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
  const debugEnabled =
    searchParams.get("debug") === "1" ||
    searchParams.get("debug") === "true" ||
    searchParams.has("debug");

  if (debugEnabled) {
    console.log("[Proxy] Request received:", {
      streamUrl,
      refererParam,
      headers: Object.fromEntries(request.headers.entries()),
    });
  }

  if (!streamUrl) {
    return applyCors(
      NextResponse.json({ error: "Stream URL is required" }, { status: 400 })
    );
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);
    const targetUrl = new URL(decodedUrl);

    // Referer belirleme: 1) ?referer= parametresi, 2) URL içindeki referer= param, 3) origin
    let refererHeader = refererParam?.trim();
    if (!refererHeader) {
      const embeddedReferer = targetUrl.searchParams.get("referer");
      if (embeddedReferer) {
        refererHeader = embeddedReferer;
      }
    }
    if (refererHeader) {
      try {
        refererHeader = new URL(refererHeader, targetUrl).toString();
      } catch {
        refererHeader = refererParam ?? targetUrl.origin;
      }
    }

    const upstreamHeaders = new Headers({
      "User-Agent": process.env.XTREAM_USER_AGENT ?? DEFAULT_USER_AGENT,
      Accept: request.headers.get("accept") ?? "*/*",
      "Accept-Language":
        request.headers.get("accept-language") ?? "tr,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });

    if (refererHeader) {
      upstreamHeaders.set("Referer", refererHeader);
    } else {
      upstreamHeaders.set("Referer", `${targetUrl.origin}/`);
    }

    PASS_THROUGH_HEADERS.forEach((header) => {
      if (upstreamHeaders.has(header)) {
        return;
      }

      const value = request.headers.get(header);
      if (value) {
        upstreamHeaders.set(header, value);
      }
    });

    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) upstreamHeaders.set("X-Forwarded-For", forwardedFor);
    const realIp = request.headers.get("x-real-ip");
    if (realIp) upstreamHeaders.set("X-Real-IP", realIp);
    const trueClientIp = request.headers.get("true-client-ip");
    if (trueClientIp) upstreamHeaders.set("True-Client-IP", trueClientIp);
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    if (cfConnectingIp) upstreamHeaders.set("CF-Connecting-IP", cfConnectingIp);
    const forwarded = request.headers.get("forwarded");
    if (forwarded) upstreamHeaders.set("Forwarded", forwarded);

    if (SESSION_COOKIE && !upstreamHeaders.has("cookie")) {
      upstreamHeaders.set("Cookie", SESSION_COOKIE);
    }

    // Tarayıcı benzeri istek bağlamı
    upstreamHeaders.set("Origin", targetUrl.origin);
    if (!upstreamHeaders.has("sec-fetch-mode"))
      upstreamHeaders.set("sec-fetch-mode", "cors");
    if (!upstreamHeaders.has("sec-fetch-site"))
      upstreamHeaders.set("sec-fetch-site", "cross-site");
    if (!upstreamHeaders.has("sec-fetch-dest"))
      upstreamHeaders.set("sec-fetch-dest", "video");

    let retryStage = "initial";
    let upstreamResponse = await fetch(targetUrl, {
      method: "GET",
      headers: upstreamHeaders,
      redirect: "follow",
      signal: request.signal,
      cache: "no-store",
    });

    if (upstreamResponse.status === 403) {
      upstreamHeaders.delete("Referer");
      retryStage = "no-referer";
      upstreamResponse = await fetch(targetUrl, {
        method: "GET",
        headers: upstreamHeaders,
        redirect: "follow",
        signal: request.signal,
        cache: "no-store",
      });
    }

    // 404 durumunda bazı sağlayıcılar yanlış/katı referer bekler.
    // Origin'e indirgenmiş bir referer ile tek seferlik yeniden dene.
    if (upstreamResponse.status === 404) {
      upstreamHeaders.set("Referer", `${targetUrl.origin}/`);
      retryStage = "origin-referer";
      upstreamResponse = await fetch(targetUrl, {
        method: "GET",
        headers: upstreamHeaders,
        redirect: "follow",
        signal: request.signal,
        cache: "no-store",
      });
    }

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const detail = await upstreamResponse.text().catch(() => undefined);
      console.error("[Proxy] Upstream error:", {
        url: targetUrl.toString(),
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        retryStage,
        detail: detail?.slice(0, 200),
        headers: Object.fromEntries(upstreamResponse.headers.entries()),
      });

      const errorResponse = NextResponse.json(
        { error: "Stream not available", status: upstreamResponse.status },
        { status: upstreamResponse.status || 502 }
      );

      if (debugEnabled) {
        errorResponse.headers.set("X-Proxy-Debug", "1");
        errorResponse.headers.set(
          "X-Proxy-Referer",
          refererHeader ?? `${targetUrl.origin}/`
        );
        errorResponse.headers.set("X-Proxy-Origin", targetUrl.origin);
        errorResponse.headers.set(
          "X-Proxy-Sent-Cookie",
          upstreamHeaders.has("Cookie") ? "yes" : "no"
        );
        errorResponse.headers.set("X-Proxy-Retry", retryStage);
        errorResponse.headers.set(
          "X-Proxy-Upstream-Status",
          String(upstreamResponse.status)
        );
        errorResponse.headers.set("X-Proxy-Target-Host", targetUrl.host);
      }

      return applyCors(errorResponse);
    }

    const contentType = upstreamResponse.headers.get("content-type");
    const responseHeaders = new Headers();

    upstreamResponse.headers.forEach((value, key) => {
      if (SKIPPED_PROXY_HEADERS.has(key.toLowerCase())) {
        return;
      }

      responseHeaders.set(key, value);
    });

    responseHeaders.set(
      "Content-Type",
      contentType ?? "application/octet-stream"
    );
    responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");

    const isPlaylistByExt = targetUrl.pathname.toLowerCase().endsWith(".m3u8");

    if (debugEnabled) {
      responseHeaders.set("X-Proxy-Debug", "1");
      responseHeaders.set(
        "X-Proxy-Referer",
        refererHeader ?? `${targetUrl.origin}/`
      );
      responseHeaders.set("X-Proxy-Origin", targetUrl.origin);
      responseHeaders.set(
        "X-Proxy-Sent-Cookie",
        upstreamHeaders.has("Cookie") ? "yes" : "no"
      );
      responseHeaders.set("X-Proxy-Retry", retryStage);
      responseHeaders.set(
        "X-Proxy-Upstream-Status",
        String(upstreamResponse.status)
      );
      responseHeaders.set(
        "X-Proxy-Is-Playlist",
        isPlaylistContentType(contentType) || isPlaylistByExt ? "1" : "0"
      );
      responseHeaders.set("X-Proxy-Target-Host", targetUrl.host);
    }
    if (isPlaylistContentType(contentType) || isPlaylistByExt) {
      const text = await upstreamResponse.text();
      const rewritten = rewritePlaylist(text, targetUrl);
      responseHeaders.delete("content-length");

      return applyCors(
        new NextResponse(rewritten, {
          status: upstreamResponse.status,
          headers: responseHeaders,
        })
      );
    }

    return applyCors(
      new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: responseHeaders,
      })
    );
  } catch (error) {
    console.error("[Proxy] Stream proxy error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      streamUrl,
      refererParam,
    });
    return applyCors(
      NextResponse.json(
        {
          error: "Failed to fetch stream",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 200 }));
}
