import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to static files and public assets
  if (
    pathname.startsWith("/_next/") || // Next.js assets
    pathname.startsWith("/static/") || // Static files
    pathname.startsWith("/favicon.ico") || // Favicon
    pathname.endsWith(".js") // JavaScript files
  ) {
    return NextResponse.next();
  }

  // Allow access to the password page
  if (pathname === "/password") {
    return NextResponse.next();
  }

  // Check if the user has access
  const accessGranted = req.cookies.get("accessGranted")?.value;

  if (accessGranted === "true") {
    return NextResponse.next(); // User is authenticated
  }

  // Redirect to the password page if access is not granted
  return NextResponse.redirect(new URL("/password", req.url));
}

// Apply middleware to all routes
export const config = {
  matcher: "/:path*",
};
