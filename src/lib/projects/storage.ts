import { cookies } from "next/headers";
import type { Project } from "@/lib/types";
import { sealJson, unsealJson } from "@/lib/security/seal";

const PROJECTS_COOKIE = "projects-data";
const MAX_PROJECTS = 30;

function decodeProjects(raw: string): Project[] {
  try {
    return unsealJson<Project[]>(raw);
  } catch {
    const parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as Project[];
    return Array.isArray(parsed) ? parsed : [];
  }
}

function encodeProjects(projects: Project[]): string {
  try {
    return sealJson(projects);
  } catch {
    return Buffer.from(JSON.stringify(projects)).toString("base64");
  }
}

export function readProjectsFromCookie(): Project[] {
  try {
    const raw = cookies().get(PROJECTS_COOKIE)?.value;
    if (!raw) return [];
    const parsed = decodeProjects(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProjectsToCookie(projects: Project[]) {
  const normalized = projects.slice(0, MAX_PROJECTS);
  cookies().set(PROJECTS_COOKIE, encodeProjects(normalized), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 120,
    path: "/",
  });
}
