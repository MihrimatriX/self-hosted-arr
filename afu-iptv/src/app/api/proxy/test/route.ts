import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const testUrl = searchParams.get("url");
  
  if (!testUrl) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(testUrl);
    const targetUrl = new URL(decodedUrl);
    
    console.log("[Proxy Test] Testing URL:", {
      original: testUrl,
      decoded: decodedUrl,
      host: targetUrl.host,
      pathname: targetUrl.pathname,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye timeout

    const response = await fetch(decodedUrl, {
      method: "HEAD", // Sadece header'ları al
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        "Accept": "*/*",
        "Accept-Language": "tr,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": `${targetUrl.origin}/`
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: decodedUrl,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    console.log("[Proxy Test] Result:", result);

    return NextResponse.json(result, {
      status: response.ok ? 200 : 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });

  } catch (error) {
    const errorInfo = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError",
      url: testUrl,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    console.error("[Proxy Test] Error:", errorInfo);

    return NextResponse.json(errorInfo, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
