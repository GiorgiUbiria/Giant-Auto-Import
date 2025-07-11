import { NextResponse, type NextRequest } from 'next/server';

// Edge middleware to add caching headers to all HTML pages and enable aggressive
// CDN caching for static assets. Adjust TTLs as needed for your use-case.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Skip non-GET requests and Next.js internals that already have proper headers
  if (request.method !== 'GET') return response;

  const { pathname } = request.nextUrl;

  // Cache static assets (JS, CSS, images) for 1 year with immutable
  if (pathname.startsWith('/_next/static') || pathname.startsWith('/_next/image')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // Apply edge caching for pages (ISR / SSR) – 60s fresh, then stale-while-revalidate
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  // Example HTTP/2 server push/preload for the main CSS chunk (browsers treat this as a hint)
  // You may replace the path with a critical asset after inspecting `.next/` build output.
  response.headers.append(
    'Link',
    '</_next/static/css/app.css>; rel=preload; as=style; nopush'
  );

  return response;
}

// Apply to all routes except API routes and static files that are handled above.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};