import { NextResponse } from "next/server";
import { getCategoriesWithStreams, XtreamApiError } from "@/lib/xtream";

export const revalidate = 60;

export async function GET() {
  try {
    const categories = await getCategoriesWithStreams();

    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=60"
        }
      }
    );
  } catch (error) {
    console.error("Xtream API error", error);

    if (error instanceof XtreamApiError) {
      return NextResponse.json(
        {
          message: "Xtream API verilerine ulasilamadi",
          error: error.message,
          status: error.status
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        message: "Xtream API verilerine ulasilamadi",
        error:
          error instanceof Error
            ? error.message
            : "Beklenmedik bir hata olustu"
      },
      { status: 500 }
    );
  }
}
