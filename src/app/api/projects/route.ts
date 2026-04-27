import { randomUUID } from "crypto";
import { getSession } from "@/lib/get-session";
import { readProjectsFromCookie, saveProjectsToCookie } from "@/lib/projects/storage";
import { getRequestId, withRequestHeaders } from "@/lib/api/request-context";
import type { Platform, Project, Tone } from "@/lib/types";
import { z } from "zod";
import { ALL_PLATFORMS } from "@/lib/types";

const createProjectSchema = z.object({
  name: z.string().min(2),
  businessType: z.string().min(2),
  businessDescription: z.string().min(10),
  targetAudience: z.string().min(5),
  tone: z.enum(["professional", "humorous", "inspirational", "warm", "casual"]),
  platforms: z.array(z.enum(ALL_PLATFORMS)).min(1),
  posts: z.array(
    z.object({
      id: z.string().min(1),
      platform: z.enum(ALL_PLATFORMS),
      text: z.string().min(1),
      hashtags: z.array(z.string()),
      bestTime: z.string().default("12:00"),
      status: z.enum(["draft", "approved", "scheduled", "published"]).default("draft"),
      scheduledAt: z.string().optional(),
      platformPostId: z.string().optional(),
    })
  ),
  title: z.string().optional(),
});

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const session = await getSession();
  if (!session) {
    return withRequestHeaders({ error: "Unauthorized" }, requestId, { status: 401 });
  }
  const projects = readProjectsFromCookie();
  return withRequestHeaders({ projects }, requestId);
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const session = await getSession();
  if (!session) {
    return withRequestHeaders({ error: "Unauthorized" }, requestId, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return withRequestHeaders(
        { error: "Invalid request", details: parsed.error.errors },
        requestId,
        { status: 400 }
      );
    }

    const data = parsed.data;
    const nowIso = new Date().toISOString();
    const project: Project = {
      id: randomUUID(),
      name: data.name,
      businessType: data.businessType,
      status: "active",
      createdAt: nowIso.slice(0, 10),
      plan: {
        id: randomUUID(),
        title: data.title ?? `Контент-план: ${data.name}`,
        businessDescription: data.businessDescription,
        targetAudience: data.targetAudience,
        tone: data.tone as Tone,
        platforms: data.platforms as Platform[],
        posts: data.posts,
        createdAt: nowIso,
      },
    };

    const existing = readProjectsFromCookie();
    saveProjectsToCookie([project, ...existing]);

    return withRequestHeaders({ success: true, project }, requestId);
  } catch (error) {
    console.error("Create project error:", { requestId, error });
    return withRequestHeaders({ error: "Failed to save project" }, requestId, { status: 500 });
  }
}
