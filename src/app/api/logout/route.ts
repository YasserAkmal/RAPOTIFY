import { NextRequest, NextResponse } from "next/server";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function clearAuthCookies(res: NextResponse) {
  [
    "spotify_access_token",
    "spotify_refresh_token",
    "spotify_expires_at",
    "spotify_state",
  ].forEach((name) => res.cookies.set(name, "", { ...cookieOpts, maxAge: 0 }));
}

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url)); // balik ke landing
  clearAuthCookies(res);
  return res;
}

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearAuthCookies(res);
  return res;
}
