// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { buildAuthorizeUrl } from "@/lib/spotify";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function GET(req: NextRequest) {
  const state = crypto.randomBytes(16).toString("hex");

  const redirectUri = `https://rapotify.vercel.app/api/callback`;

  const url = buildAuthorizeUrl(state, redirectUri);

  const res = NextResponse.redirect(url);
  res.cookies.set("spotify_state", state, { ...cookieOpts, maxAge: 300 });
  res.cookies.set("spotify_redirect_uri", redirectUri, {
    ...cookieOpts,
    maxAge: 300,
  });
  return res;
}
