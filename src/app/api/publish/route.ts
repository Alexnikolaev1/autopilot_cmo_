import { getSession } from "@/lib/get-session";
import { getSocialCredentials } from "@/lib/social/credentials";
import { publishToSocial } from "@/lib/social/publisher";
import { publishSchema } from "@/lib/social/schemas";
import { createHash } from "crypto";
import { checkRateLimit } from "@/lib/api/rate-limit";
import {
  cleanupIdempotency,
  getIdempotentValue,
  setIdempotentValue,
} from "@/lib/api/idempotency";
import { getRequestId, withRequestHeaders } from "@/lib/api/request-context";
import { trackPublishResult } from "@/lib/telemetry/social-metrics";

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const startedAt = Date.now();
  try {
    const session = await getSession();
    if (!session) {
      return withRequestHeaders({ error: "Unauthorized" }, requestId, {
        status: 401,
      });
    }

    cleanupIdempotency();
    const rate = await checkRateLimit(`publish:${session.userId}`, {
      windowMs: 60_000,
      limit: 20,
    });
    if (!rate.allowed) {
      return withRequestHeaders(
        {
          error: "Rate limit exceeded",
          retryAfterMs: rate.retryAfterMs,
        },
        requestId,
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return withRequestHeaders(
        { error: "Invalid request", details: parsed.error.errors },
        requestId,
        { status: 400 }
      );
    }

    const { postId, platform, text, hashtags } = parsed.data;
    const externalKey = req.headers.get("x-idempotency-key");
    const idempotencyKey =
      externalKey && externalKey.trim().length > 0
        ? `publish:${session.userId}:${externalKey}`
        : `publish:${createHash("sha256")
            .update(
              JSON.stringify({
                userId: session.userId,
                postId,
                platform,
                text,
                hashtags,
              })
            )
            .digest("hex")}`;
    const cached = await getIdempotentValue<{
      status: "ok";
      postId: string;
      platform: string;
      platformPostId?: string;
      url?: string;
      publishedAt: string;
    }>(idempotencyKey);
    if (cached) {
      return withRequestHeaders(cached, requestId);
    }

    const credentials = await getSocialCredentials();
    const result = await publishToSocial({ platform, text, hashtags, credentials });

    if (!result.success) {
      await trackPublishResult(platform, "error", Date.now() - startedAt);
      return withRequestHeaders(
        { status: "error", postId, platform, error: result.error },
        requestId,
        { status: 422 }
      );
    }

    const responsePayload = {
      status: "ok",
      postId,
      platform,
      platformPostId: result.platformPostId,
      url: result.url,
      publishedAt: new Date().toISOString(),
    } as const;
    await setIdempotentValue(idempotencyKey, responsePayload);
    await trackPublishResult(platform, "ok", Date.now() - startedAt);
    return withRequestHeaders(responsePayload, requestId);
  } catch (error) {
    console.error("Publish error:", { requestId, error });
    return withRequestHeaders({ error: "Failed to publish post" }, requestId, {
      status: 500,
    });
  }
}
