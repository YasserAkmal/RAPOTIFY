// src/app/api/top-songs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("spotify_access_token")?.value;
  if (!token) return NextResponse.json({ retry: true }, { status: 401 });

  try {
    // ganti limit/time_range sesuai selera
    const data = await apiGet(
      "/me/top/tracks?limit=10&time_range=medium_term",
      token
    );
    return NextResponse.json(data);
  } catch (e) {
    console.error("Spotify API error", e);
    return NextResponse.json(
      { error: "Failed to fetch top songs" },
      { status: 500 }
    );
  }
}
