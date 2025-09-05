// src/lib/spotify.ts
import axios from "axios";
import { getEnv } from "./env";

export const SPOTIFY_CLIENT_ID = getEnv("SPOTIFY_CLIENT_ID");
export const SPOTIFY_CLIENT_SECRET = getEnv("SPOTIFY_CLIENT_SECRET");
export const SPOTIFY_REDIRECT_URI = getEnv("SPOTIFY_REDIRECT_URI");
export const SPOTIFY_AUTHORIZE = getEnv("SPOTIFY_AUTHORIZE");
export const SPOTIFY_TOKEN_ENDPOINT = getEnv("SPOTIFY_TOKEN_ENDPOINT");
export const SPOTIFY_API = getEnv("SPOTIFY_API");
export const SPOTIFY_API_TRACK = getEnv("SPOTIFY_API_TRACK");

export const scopes = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "user-read-recently-played",
  "user-top-read",
].join(" ");

export function buildAuthorizeUrl(state: string, redirectUri: string) {
  const url = new URL(process.env.SPOTIFY_AUTHORIZE!);
  url.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await axios.post(SPOTIFY_TOKEN_ENDPOINT, body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
    },
  });

  const expires_at = Math.floor(Date.now() / 1000) + res.data.expires_in;
  return { ...res.data, expires_at } as {
    access_token: string;
    refresh_token: string;
    token_type: "Bearer";
    expires_in: number;
    scope: string;
    expires_at: number;
  };
}

export async function refreshAccessToken(refresh_token: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token,
  });

  const res = await axios.post(SPOTIFY_TOKEN_ENDPOINT, body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
    },
  });

  const expires_at = Math.floor(Date.now() / 1000) + res.data.expires_in;
  return {
    access_token: res.data.access_token,
    refresh_token: res.data.refresh_token ?? refresh_token,
    expires_at,
    expires_in: res.data.expires_in,
  };
}

export async function apiGet<T = any>(path: string, access_token: string) {
  console.log("🚀 ~ apiGet ~ access_token:", access_token);
  const res = await axios.get<T>(`${SPOTIFY_API}${path}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
}
