import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT_SET",
      XTREAM_API_BASE: process.env.XTREAM_API_BASE || "NOT_SET",
      XTREAM_USERNAME: process.env.XTREAM_USERNAME ? "SET" : "NOT_SET",
      XTREAM_PASSWORD: process.env.XTREAM_PASSWORD ? "SET" : "NOT_SET",
      XTREAM_SESSION_COOKIE: process.env.XTREAM_SESSION_COOKIE ? "SET" : "NOT_SET",
    },
    server: {
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  // Test Xtream API bağlantısı
  let xtreamStatus = "UNKNOWN";
  let xtreamError: string | null = null;

  try {
    const apiBase = process.env.XTREAM_API_BASE;
    const username = process.env.XTREAM_USERNAME;
    const password = process.env.XTREAM_PASSWORD;

    if (!apiBase || !username || !password) {
      xtreamStatus = "CONFIG_MISSING";
      xtreamError = "XTREAM credentials not configured";
    } else {
      const url = new URL(apiBase);
      url.searchParams.set("username", username);
      url.searchParams.set("password", password);
      url.searchParams.set("action", "get_live_categories");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "tr,en-US;q=0.9,en;q=0.8",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        xtreamStatus = "OK";
      } else {
        xtreamStatus = "ERROR";
        xtreamError = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
  } catch (error) {
    xtreamStatus = "ERROR";
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        xtreamError = "Connection timeout (10s)";
      } else {
        xtreamError = error.message;
      }
    } else {
      xtreamError = "Unknown error";
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      diagnostics,
      xtream: {
        status: xtreamStatus,
        error: xtreamError,
      },
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}

