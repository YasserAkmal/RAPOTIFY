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
  const p = new URL(req.url).searchParams;
  const code = p.get("code");
  const state = p.get("state");
  const cookies = req.cookies;
  const stateCookie = cookies.get("spotify_state")?.value;
  const redirectUri = cookies.get("spotify_redirect_uri")?.value; // ← sama dgn saat login

  if (!code || !state || state !== stateCookie || !redirectUri) {
    return new NextResponse("Invalid state/redirect", { status: 400 });
  }

  const token = await exchangeCodeForToken(code, redirectUri);
  const res = NextResponse.redirect(new URL("/homepage", req.url));
  // set cookies token… (sama seperti sebelumnya)
  res.cookies.set("spotify_state", "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set("spotify_redirect_uri", "", { ...cookieOpts, maxAge: 0 });
  return res;
}
