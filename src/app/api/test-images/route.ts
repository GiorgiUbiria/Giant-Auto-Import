import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering since we need request URL
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get("vin");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

    if (!vin) {
      return NextResponse.json({ error: "VIN parameter required" }, { status: 400 });
    }

    // Fetch images directly from the images API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const imagesResponse = await fetch(
      `${baseUrl}/api/images/${vin}?${new URLSearchParams({
        type: type || "",
        page: page.toString(),
        pageSize: pageSize.toString(),
      }).toString()}`
    );

    if (!imagesResponse.ok) {
      throw new Error(`Failed to fetch images: ${imagesResponse.statusText}`);
    }

    const result = await imagesResponse.json();

    // Add cache headers for better performance
    const response = NextResponse.json({
      images: result.images,
      count: result.count,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });

    // Set cache headers for ISR
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    response.headers.set("CDN-Cache-Control", "public, s-maxage=60");
    response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=60");

    return response;
  } catch (error) {
    console.error("API Route: Error fetching images:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
