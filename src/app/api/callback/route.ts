// src/app/api/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/spotify";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const stateCookie = req.cookies.get("spotify_state")?.value;
  const redirectCookie = req.cookies.get("spotify_redirect_uri")?.value;
  const fallbackRedirect = `${req.nextUrl.origin}/api/callback`;
  const redirectUri = redirectCookie ?? fallbackRedirect;

  if (!code || !state || state !== stateCookie) {
    return new NextResponse("Invalid state/redirect", { status: 400 });
  }

  const token = await exchangeCodeForToken(code, redirectUri);

  const res = NextResponse.redirect(new URL("/homepage", req.url));
  res.cookies.set("spotify_access_token", token.access_token, {
    ...cookieOpts,
    maxAge: token.expires_in,
  });
  res.cookies.set("spotify_refresh_token", token.refresh_token, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set("spotify_expires_at", String(token.expires_at), {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set("spotify_state", "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set("spotify_redirect_uri", "", { ...cookieOpts, maxAge: 0 });
  return res;
}
