import { getSession } from "@/lib/get-session";
import {
  getCompetitors,
  addCompetitor,
  removeCompetitor,
} from "@/lib/competitors/storage";
import { z } from "zod";
import { ALL_PLATFORMS } from "@/lib/types";

const postSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  platforms: z.array(z.enum(ALL_PLATFORMS)).min(1),
  notes: z.string().optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ competitors: getCompetitors() });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid data", details: parsed.error.errors },
      { status: 400 }
    );
  }
  const res = addCompetitor({
    name: parsed.data.name,
    url: parsed.data.url,
    platforms: parsed.data.platforms,
    notes: parsed.data.notes ?? "",
  });
  if (!res.ok) {
    return Response.json({ error: res.error }, { status: 400 });
  }
  return Response.json({ competitor: res.competitor });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }
  const ok = removeCompetitor(parsed.data.id);
  if (!ok) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ success: true });
}
