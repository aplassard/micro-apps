import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) return NextResponse.next();

  const expected = Buffer.from(`${user}:${pass}`).toString("base64");
  const auth = req.headers.get("authorization") || "";
  if (auth === `Basic ${expected}`) return NextResponse.next();

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="micro-apps"' },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
