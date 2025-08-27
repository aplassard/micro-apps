import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER = process.env.BASIC_AUTH_USER!;
const PASS = process.env.BASIC_AUTH_PASS!;
const EXPECTED = Buffer.from(`${USER}:${PASS}`).toString("base64");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow static assets/unprotected paths
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization") || "";
  if (auth === `Basic ${EXPECTED}`) return NextResponse.next();

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="micro-apps"' },
  });
}

// protect everything except Next static assets
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
