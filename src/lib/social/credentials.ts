"use server";

import { cookies } from "next/headers";
import type { SocialCredentials, SocialPlatform } from "@/lib/types";
import { sealJson, unsealJson } from "@/lib/security/seal";

const COOKIE_NAME = "social-creds";

function encode(data: SocialCredentials): string {
  try {
    return sealJson(data);
  } catch {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  }
}

function decode(raw: string): SocialCredentials {
  try {
    return unsealJson<SocialCredentials>(raw);
  } catch {
    // Backward compatibility: old payloads were plain base64 JSON.
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  }
}

export async function getSocialCredentials(): Promise<SocialCredentials> {
  try {
    const cookie = cookies().get(COOKIE_NAME);
    if (!cookie?.value) return {};
    return decode(cookie.value);
  } catch {
    return {};
  }
}

export async function saveSocialCredentials(
  creds: SocialCredentials
): Promise<void> {
  const current = await getSocialCredentials();
  const merged = { ...current, ...creds };
  cookies().set(COOKIE_NAME, encode(merged), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function disconnectPlatform(
  platform: SocialPlatform
): Promise<void> {
  const current = await getSocialCredentials();
  delete current[platform];
  cookies().set(COOKIE_NAME, encode(current), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}
