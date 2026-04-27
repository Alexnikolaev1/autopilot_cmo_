import { cookies } from "next/headers";
import type { Session } from "@/lib/types";
import { unsealJson } from "@/lib/security/seal";

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session-token");

    if (!token?.value) return null;

    let parsed: { apiKey?: string; userId?: string };
    try {
      parsed = unsealJson<{ apiKey?: string; userId?: string }>(token.value);
    } catch {
      // Backward compatibility for old base64 session cookies.
      const decoded = Buffer.from(token.value, "base64").toString("utf-8");
      parsed = JSON.parse(decoded) as { apiKey?: string; userId?: string };
    }

    if (!parsed.apiKey || !parsed.userId) return null;

    return {
      userId: parsed.userId,
      geminiApiKey: parsed.apiKey,
    };
  } catch {
    return null;
  }
}
