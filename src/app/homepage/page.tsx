"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";

type Me = {
  id: string;
  display_name: string;
  email?: string;
  product?: string; // free, premium
  images?: { url: string }[];
};
type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  duration_ms: number;
};
// helpers
function avgDurationMs(list: { duration_ms: number }[]) {
  if (!list.length) return 0;
  return Math.round(list.reduce((s, t) => s + t.duration_ms, 0) / list.length);
}

function gradeByAvg(
  durationMs: number,
  avgMs: number
): "A" | "B" | "C" | "D" | "E" {
  const diffSec = (durationMs - avgMs) / 1000;
  if (diffSec >= 0) return "A";
  if (diffSec >= -10) return "B";
  if (diffSec >= -20) return "C";
  if (diffSec >= -30) return "D";
  return "E";
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [avgMs, setAvgMs] = useState(0);
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

  const fetchTopTracks = async () => {
    let r = await fetch("/api/top-songs", { credentials: "include" });
    if (r.status === 401) {
      await fetch("/api/refresh", { method: "POST", credentials: "include" });
      r = await fetch("/api/top-songs", { credentials: "include" });
    }
    if (!r.ok) return;
    const d = await r.json();
    setTracks(d.items || []);
    setTracks(d.items || []);
    setAvgMs(avgDurationMs(d.items || []));
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setMe(null);
    router.push("/");
  };

  useEffect(() => {
    fetchMe();
    fetchTopTracks();
  }, []);
  async function waitImagesLoaded(node: HTMLElement) {
    const imgs = Array.from(node.querySelectorAll("img"));
    // decode() menunggu gambar render (lebih akurat dari onload)
    await Promise.all(
      imgs.map((img) =>
        img.decode ? img.decode().catch(() => {}) : Promise.resolve()
      )
    );
    // juga tunggu font web
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }
  }
  async function download2x() {
    const node = targetRef.current;
    if (!node) return;

    // Pastikan semua img sudah ke-render
    await waitImagesLoaded(node);

    const dataUrl = await htmlToImage.toPng(node, {
      pixelRatio: 1.5, 
      cacheBust: true,
      style: { transform: "none" },
      filter: (el) => !el.classList?.contains("no-capture"),
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "raport.png";
    a.click();
  }

  return (
    <main className="flex flex-wrap justify-center items-center min-h-screen ">
      <div
        className="w-[720px] h-[1280px] bg-[url(/img/BG.png)] bg-cover flex flex-col items-center py-15"
        ref={targetRef}
      >
        {/* Header Sekolah */}
        <div className="flex w-full items-center justify-center pl-4 border-b-2 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
          >
            <path
              fill="#000"
              d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6c-.15-.5.15-1 .6-1.15c3.55-1.05 9.4-.85 13.1 1.35c.45.25.6.85.35 1.3c-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25c-2.7-1.65-6.8-2.15-9.95-1.15c-.4.1-.85-.1-.95-.5s.1-.85.5-.95c3.65-1.1 8.15-.55 11.25 1.35c.3.15.45.65.2 1m-1.2 2.75c-.2.3-.55.4-.85.2c-2.35-1.45-5.3-1.75-8.8-.95c-.35.1-.65-.15-.75-.45c-.1-.35.15-.65.45-.75c3.8-.85 7.1-.5 9.7 1.1c.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
            />
          </svg>
          <div className="flex flex-col justify-center">
            <h1 className="font-bold text-2xl">SKENA SIMPANG HARU</h1>
            <h1 className="font-bold text-2xl">SMA SPOTIFY UTARA</h1>
            <p>Jl. Skena No. 1, Kec. Epruv, Kab. Indie Utara 1312</p>
          </div>
        </div>

        {/* Profil Peserta Didik */}
        <div className="mt-5 w-full pl-4">
          <h1 className="font-bold text-2xl">A. PROFIL PESERTA DIDIK</h1>
          <div className="flex gap-4 mt-2">
            <img
              src={me?.images?.[1]?.url?.toString()}
              alt="Profil Peserta Didik"
              className="w-[164px] h-[123px]"
            />
            <div className="gap-2">
              <table className="table-auto">
                <tbody>
                  <tr>
                    <td>Nomor Induk Siswa</td>
                    <td>:</td>
                    <td>{me?.id || "-"}</td>
                  </tr>
                  <tr>
                    <td>Nama Lengkap</td>
                    <td>:</td>
                    <td>{me?.display_name || "-"}</td>
                  </tr>
                  <tr>
                    <td>Kelas Siswa</td>
                    <td>:</td>
                    <td>{me?.product || "-"}</td>
                  </tr>
                  <tr>
                    <td>Tanggal Masuk</td>
                    <td>:</td>
                    <td>
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Data Akademik */}
        <div className="w-full px-4">
          <h1 className="font-bold text-2xl mt-5 w-full">B. DATA AKADEMIK</h1>
          <table className="table-auto border-collapse border border-black-400 mt-2 w-full text-center">
            <thead>
              <tr>
                <th className="border border-black-300 px-3">NO</th>
                <th className="border border-black-300 px-3">MATA PELAJARAN</th>
                <th className="border border-black-300 px-3">GURU PENGAMPU</th>
                <th className="border border-black-300 px-3">NILAI</th>
                <th className="border border-black-300 px-3">PREDIKAT</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((t, idx) => (
                <tr key={t.id}>
                  <td className="border border-black-300">{idx + 1}</td>
                  <td className="border border-black-300 text-left pl-3">
                    {t.name}
                  </td>
                  <td className="border border-black-300 text-left pl-3">
                    {t.artists.map((a) => a.name).join(", ")}
                  </td>
                  <td className="border border-black-300">
                    {formatDuration(t.duration_ms)}
                  </td>
                  <td className="border border-black-300">
                    {gradeByAvg(t.duration_ms, avgMs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {avgMs > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Rata-rata durasi: {formatDuration(avgMs)}
            </p>
          )}
        </div>

        {/* Footer tanda tangan */}
        <div className="w-full flex">
          <div className="flex flex-col pl-4">
            <p className="font-bold text-lg">Catatan Khusus :</p>
            <p>
              {tracks.length > 0
                ? "gatau dah, males gw ngisinya. isi aja sendiri ye."
                : "Belum ada data track."}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-center w-full h-full flex-col">
          <p>Mengetahui,</p>
          <div className="flex flex-row w-full justify-between px-20 mt-10">
            <div className="gap-20 flex flex-col items-center bg-[url(/img/ttd-aceng.png)] bg-contain bg-no-repeat bg-center h-full  w-full">
              <p>Kepala Sekolah</p>
              <p>Yasser Thareq Akmal</p>
            </div>
            <div className="gap-20 flex flex-col items-center bg-[url(/img/ttd-mupid.png)] bg-contain bg-no-repeat bg-center h-full w-full">
              <p>Wali Kelas</p>
              <p>Rizki Mufid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col m-4 gap-2">
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
        <button
          onClick={fetchMe}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Refresh
        </button>
        <button
          onClick={fetchTopTracks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Top Track
        </button>
        <button
          className="no-capture px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={download2x}
          disabled={loading}
        >
          Download 1080×1920
        </button>
      </div>
    </main>
  );
}
