"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SPOTIFY_API_TRACK } from "@/lib/spotify";

type Me = {
  id: string;
  display_name: string;
  email?: string;
  images?: { url: string }[];
};

export default function Homepage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMe = async () => {
    setLoading(true);
    const r = await fetch("/api/me", { credentials: "include" });
    const d = await r.json();
    if (d.retry) {
      await fetch("/api/refresh", { method: "POST", credentials: "include" });
      const r2 = await fetch("/api/me", { credentials: "include" });
      const d2 = await r2.json();
      setMe(d2);
    } else {
      setMe(d);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMe();
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
            className="rounded-full"
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
    </main>
  );
}
