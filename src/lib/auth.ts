"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sealJson } from "@/lib/security/seal";

const loginSchema = z.object({
  apiKey: z.string().min(20, "API key must be at least 20 characters"),
});

function encodeSession(apiKey: string, userId: string): string {
  try {
    return sealJson({ apiKey, userId });
  } catch {
    const payload = JSON.stringify({ apiKey, userId });
    return Buffer.from(payload).toString("base64");
  }
}

export async function loginAction(formData: FormData) {
  const raw = { apiKey: formData.get("apiKey") as string };
  const result = loginSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const userId = `user_${Date.now()}`;
  const token = encodeSession(result.data.apiKey, userId);

  cookies().set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  redirect("/onboarding");
}

export async function logoutAction() {
  cookies().delete("session-token");
  redirect("/login");
}
