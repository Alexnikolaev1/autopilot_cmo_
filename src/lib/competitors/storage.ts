import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { sealJson, unsealJson } from "@/lib/security/seal";
import type { Competitor } from "@/lib/competitors/types";
import { z } from "zod";
import type { Platform } from "@/lib/types";
import { ALL_PLATFORMS } from "@/lib/types";

const COOKIE = "acmo-competitors";
const MAX_COMPETITORS = 20;

const competitorInSchema = z.object({
  name: z.string().min(1).max(120),
  url: z
    .string()
    .min(4)
    .max(2000)
    .transform((s) => {
      const t = s.trim();
      if (!t) return t;
      return t.startsWith("http://") || t.startsWith("https://")
        ? t
        : `https://${t}`;
    })
    .refine((u) => /^https?:\/\/.+\..+/.test(u), "Укажите сайт или страницу"),
  platforms: z.array(z.enum(ALL_PLATFORMS)).min(1).max(ALL_PLATFORMS.length),
  notes: z.string().max(2000).optional().default(""),
});

function read(): Competitor[] {
  try {
    const c = cookies().get(COOKIE);
    if (!c?.value) return [];
    try {
      return unsealJson<Competitor[]>(c.value);
    } catch {
      const raw = JSON.parse(
        Buffer.from(c.value, "base64").toString("utf-8")
      ) as Competitor[];
      return Array.isArray(raw) ? raw : [];
    }
  } catch {
    return [];
  }
}

function write(list: Competitor[]) {
  try {
    const value = sealJson(list);
    cookies().set(COOKIE, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  } catch {
    const fallback = Buffer.from(JSON.stringify(list)).toString("base64");
    cookies().set(COOKIE, fallback, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }
}

export function getCompetitors(): Competitor[] {
  return read();
}

export function getCompetitorById(id: string): Competitor | undefined {
  return read().find((c) => c.id === id);
}

export function addCompetitor(
  input: z.infer<typeof competitorInSchema>
): { ok: true; competitor: Competitor } | { ok: false; error: string } {
  const parsed = competitorInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Некорректные данные" };
  }
  const list = read();
  if (list.length >= MAX_COMPETITORS) {
    return { ok: false, error: `Максимум ${MAX_COMPETITORS} конкурентов` };
  }
  const competitor: Competitor = {
    id: `c_${Date.now()}_${randomBytes(3).toString("hex")}`,
    name: parsed.data.name.trim(),
    url: parsed.data.url.trim().startsWith("http")
      ? parsed.data.url.trim()
      : `https://${parsed.data.url.trim()}`,
    platforms: parsed.data.platforms as Platform[],
    notes: parsed.data.notes?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  list.push(competitor);
  write(list);
  return { ok: true, competitor };
}

export function removeCompetitor(id: string): boolean {
  const list = read();
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  write(next);
  return true;
}
