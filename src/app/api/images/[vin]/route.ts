import { NextResponse } from "next/server";
import { fetchImageForDisplay } from "@/lib/actions/bucketActions";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    const data = await fetchImageForDisplay(params.vin);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("/api/images/[vin] GET error:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
