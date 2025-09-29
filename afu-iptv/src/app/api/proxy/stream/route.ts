import { NextRequest, NextResponse } from "next/server";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0";

const PASS_THROUGH_HEADERS = new Set([
  "range",
  "if-none-match",
  "if-modified-since"
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

function isPlaylistContentType(contentType?: string | null) {
  if (!contentType) {
    return false;
  }

  const lowered = contentType.toLowerCase();
  return PLAYLIST_CONTENT_TYPES.some((type) => lowered.includes(type));
}

function rewritePlaylistUris(body: string, baseUrl: URL) {
  const newline = body.includes("\r\n") ? "\r\n" : "\n";
  const lines = body.split(/\r?\n/);

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return line;
      }

      try {
        const absolute = new URL(trimmed, baseUrl).toString();
        const proxied = `/api/proxy/stream?url=${encodeURIComponent(absolute)}`;
        return line.startsWith(trimmed) ? proxied : line.replace(trimmed, proxied);
      } catch {
        return line;
      }
    })
    .join(newline);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get("url");

  if (!streamUrl) {
    return NextResponse.json(
      { error: "Stream URL is required" },
      { status: 400 }
    );
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);
    const targetUrl = new URL(decodedUrl);
    const originHint = `${targetUrl.protocol}//${targetUrl.host}`;

    const upstreamHeaders = new Headers({
      "User-Agent": process.env.XTREAM_USER_AGENT ?? DEFAULT_USER_AGENT,
      Accept: request.headers.get("accept") ?? "*/*",
      "Accept-Language":
        request.headers.get("accept-language") ?? "tr,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Referer: originHint,
      Origin: originHint
    });

    for (const header of PASS_THROUGH_HEADERS) {
      const value = request.headers.get(header);
      if (value) {
        upstreamHeaders.set(header, value);
      }
    }

    let response = await fetch(decodedUrl, {
      method: "GET",
      headers: upstreamHeaders,
      redirect: "follow"
    });

    if (response.status === 403) {
      upstreamHeaders.delete("Referer");
      upstreamHeaders.delete("Origin");
      response = await fetch(decodedUrl, {
        method: "GET",
        headers: upstreamHeaders,
        redirect: "follow"
      });
    }

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => undefined);
      console.warn("Proxy upstream error", {
        status: response.status,
        detail: detail?.slice(0, 200)
      });
      return NextResponse.json(
        { error: "Stream not available", status: response.status },
        { status: response.status || 502 }
      );
    }

    const contentType = response.headers.get("content-type");
    const proxyHeaders = new Headers();

    for (const [key, value] of response.headers.entries()) {
      if (SKIPPED_PROXY_HEADERS.has(key.toLowerCase())) {
        continue;
      }
      proxyHeaders.set(key, value);
    }

    proxyHeaders.set(
      "Content-Type",
      contentType ?? "application/octet-stream"
    );
    proxyHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    proxyHeaders.set("Pragma", "no-cache");
    proxyHeaders.set("Expires", "0");
    proxyHeaders.set("Access-Control-Allow-Origin", "*");
    proxyHeaders.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    proxyHeaders.set("Access-Control-Allow-Headers", "Content-Type, Range");

    if (isPlaylistContentType(contentType)) {
      const playlistBody = await response.text();
      const rewrittenBody = rewritePlaylistUris(playlistBody, targetUrl);
      proxyHeaders.delete("content-length");
      return new NextResponse(rewrittenBody, {
        status: response.status,
        headers: proxyHeaders
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: proxyHeaders
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stream" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range"
    }
  });
}
