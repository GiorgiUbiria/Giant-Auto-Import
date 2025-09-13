import { NextResponse } from "next/server";

export function addCorsHeaders(response: NextResponse): NextResponse {
  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

export function createCorsResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}

export function handleCorsPreflight(): NextResponse {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}
