// src/app/api/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/spotify";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(req: NextRequest) {
  const refresh_token = req.cookies.get("spotify_refresh_token")?.value;
  if (!refresh_token) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }
  try {
    const token = await refreshAccessToken(refresh_token);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("spotify_access_token", token.access_token, {
      ...cookieOpts,
      maxAge: token.expires_in,
    });
    res.cookies.set("spotify_expires_at", String(token.expires_at), {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 30,
    }); 
    return res;
  } catch (e) {
    console.error(e);

    return NextResponse.json({ error: "Failed to refresh" }, { status: 500 });
  }
}
