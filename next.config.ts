import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // pilih salah satu: domains ATAU remotePatterns
    domains: [
      "i.scdn.co",
      "profile-images.scdn.co",
      "image-cdn-fa.spotifycdn.com",
      "mosaic.scdn.co",
      "platform-lookaside.fbsbx.com", // kadang foto lewat FB
    ],
    // remotePatterns: [
    //   { protocol: "https", hostname: "i.scdn.co" },
    //   { protocol: "https", hostname: "profile-images.scdn.co" },
    //   { protocol: "https", hostname: "image-cdn-fa.spotifycdn.com" },
    //   { protocol: "https", hostname: "mosaic.scdn.co" },
    //   { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
    // ],
  },
};

export default nextConfig;
