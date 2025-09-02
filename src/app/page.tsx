import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center gap-5 p-24">
      <h1 className="text-6xl font-bold">Rapotify</h1>

      <div>
        <Link
          href="/api/login" // ← mulai auth di sini
          className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600 transition text-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6c-.15-.5.15-1 .6-1.15c3.55-1.05 9.4-.85 13.1 1.35c.45.25.6.85.35 1.3c-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25c-2.7-1.65-6.8-2.15-9.95-1.15c-.4.1-.85-.1-.95-.5s.1-.85.5-.95c3.65-1.1 8.15-.55 11.25 1.35c.3.15.45.65.2 1m-1.2 2.75c-.2.3-.55.4-.85.2c-2.35-1.45-5.3-1.75-8.8-.95c-.35.1-.65-.15-.75-.45c-.1-.35.15-.65.45-.75c3.8-.85 7.1-.5 9.7 1.1c.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
            />
          </svg>
          Login with Spotify
        </Link>
      </div>

      <h2 className="text-2xl font-medium">
        "Cek nilai ujian spotify kamu di SMA Spotify Utara"
      </h2>

      <footer className="text-center flex items-end">
        <p className="text-sm text-gray-500">
          &copy; 2025 Rapotify. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
