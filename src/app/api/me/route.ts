// src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  try {
    const access = req.cookies.get("spotify_access_token")?.value;
    const exp = Number(req.cookies.get("spotify_expires_at")?.value || 0);
    const now = Math.floor(Date.now() / 1000);

    if (!access || now >= exp) {
      // Minta client retry setelah refresh (biar simpel)
      return NextResponse.json({ retry: true });
    }

    const me = await apiGet("/me", access);
    return NextResponse.json(me);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
