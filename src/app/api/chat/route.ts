import { streamText } from "ai";
import { getSession } from "@/lib/get-session";
import { getModel, CMO_SYSTEM_PROMPT } from "@/lib/ai/google-client";
import { tools } from "@/lib/ai/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();

    const model = getModel(session.geminiApiKey);

    const result = await streamText({
      model,
      system: CMO_SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 3,
      maxRetries: 0,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(message, { status: 500 });
  }
}
