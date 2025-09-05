"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  id: string;
  display_name: string;
  email?: string;
  images?: { url: string }[];
};
type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  duration_ms: number;
};
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Homepage() {
  const [me, setMe] = useState<Me | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMe = async () => {
    setLoading(true);
    try {
      console.log("Fetching /api/me");
      const r = await fetch("/api/me", { credentials: "include" });
      const d = await r.json();
      if (d.retry) {
        console.log("Token expired, refreshing...");
        await fetch("/api/refresh", { method: "POST", credentials: "include" });
        const r2 = await fetch("/api/me", { credentials: "include" });
        const d2 = await r2.json();
        setMe(d2);
        console.log("Fetched user after refresh:", d2);
      } else {
        setMe(d);
        console.log("Fetched user:", d);
      }
    } catch (err) {
      console.error("Error in fetchMe:", err);
    }
    setLoading(false);
  };
  const fetchTopTracks = async () => {
    try {
      console.log("Fetching /api/top-songs");
      let r = await fetch("/api/top-songs", { credentials: "include" });
      if (r.status === 401) {
        console.log("Top songs 401, refreshing token...");
        await fetch("/api/refresh", { method: "POST", credentials: "include" });
        r = await fetch("/api/top-songs", { credentials: "include" });
      }
      if (!r.ok) {
        const errText = await r.text();
        console.error("API top-songs error:", r.status, errText);
        return;
      }
      const d = await r.json();
      setTracks(d.items || []);
      console.log("Fetched top tracks:", d.items);
    } catch (err) {
      console.error("Error in fetchTopTracks:", err);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchTopTracks();
  }, []);
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setMe(null);
    router.push("/"); // balik ke landing tanpa full reload
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      {loading && <p>Loading…</p>}

      {me ? (
        <div className="flex flex-col items-center gap-3">
          <img
            src={me.images?.[0]?.url || "/favicon.ico"}
            alt={me.display_name}
            width={100}
            height={100}
            className=""
          />
          <h2 className="text-2xl font-semibold">{me.display_name}</h2>
          {me.email && <p className="text-gray-600">{me.email}</p>}

          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchMe}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Refresh Profile
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center">
            <p className="mb-3">Kamu belum login.</p>
            <a
              href="/api/login"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Login with Spotify
            </a>
          </div>
        )
      )}
      <div className="flex flex-col gap-3 mt-8 w-full max-w-lg">
        <button
          onClick={fetchTopTracks}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Get Top Tracks
        </button>

        {tracks.map((t) => (
          <li key={t.id} className="flex items-center gap-3">
            <img
              src={t.album.images?.[0]?.url || "/favicon.ico"}
              alt={t.name}
              width={50}
              height={50}
              className="rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-gray-500">
                {t.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
            <span className="text-sm text-gray-400">
              {formatDuration(t.duration_ms)}
            </span>
          </li>
        ))}
      </div>
    </main>
  );
}
