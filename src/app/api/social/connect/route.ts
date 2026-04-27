import { getSession } from "@/lib/get-session";
import { saveSocialCredentials, disconnectPlatform } from "@/lib/social/credentials";
import { vkVerifyToken, vkGetGroup } from "@/lib/social/vk";
import { okVerifyToken } from "@/lib/social/ok";
import { maxVerifyToken } from "@/lib/social/max";
import { connectSchema, socialPlatformSchema } from "@/lib/social/schemas";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getRequestId, withRequestHeaders } from "@/lib/api/request-context";

function jsonError(error: string, requestId: string, status = 400) {
  return withRequestHeaders({ error }, requestId, { status });
}

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", requestId, 401);

    const rate = await checkRateLimit(`connect:${session.userId}`, {
      windowMs: 60_000,
      limit: 15,
    });
    if (!rate.allowed) {
      return withRequestHeaders(
        { error: "Rate limit exceeded", retryAfterMs: rate.retryAfterMs },
        requestId,
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = connectSchema.safeParse(body);
    if (!parsed.success) {
      return withRequestHeaders(
        { error: "Invalid data", details: parsed.error.errors },
        requestId,
        { status: 400 }
      );
    }

    const data = parsed.data;

    switch (data.platform) {
      case "vk": {
        const valid = await vkVerifyToken(data.accessToken);
        if (!valid) return jsonError("Токен ВКонтакте недействителен", requestId, 422);

        const group = await vkGetGroup(data.accessToken, data.groupId);
        await saveSocialCredentials({
          vk: {
            accessToken: data.accessToken,
            groupId: data.groupId.startsWith("-") ? data.groupId : `-${data.groupId}`,
            groupName: group?.name ?? `Группа ${data.groupId}`,
          },
        });
        return withRequestHeaders({ success: true, groupName: group?.name }, requestId);
      }
      case "ok": {
        const secretKey = process.env.OK_SECRET_KEY;
        if (!secretKey) {
          return jsonError(
            "Не настроен OK_SECRET_KEY. Добавьте его в переменные окружения.",
            requestId,
            500
          );
        }

        const valid = await okVerifyToken(data.accessToken, data.applicationKey, secretKey);
        if (!valid) return jsonError("Токен Одноклассников недействителен", requestId, 422);

        await saveSocialCredentials({
          ok: {
            accessToken: data.accessToken,
            applicationKey: data.applicationKey,
            groupId: data.groupId,
            groupName: `Группа ${data.groupId}`,
          },
        });
        return withRequestHeaders({ success: true }, requestId);
      }
      case "max": {
        const result = await maxVerifyToken(data.accessToken);
        if (!result.valid) return jsonError("Токен MAX недействителен", requestId, 422);

        await saveSocialCredentials({
          max: {
            accessToken: data.accessToken,
            channelId: data.channelId,
            channelName: result.botName ?? "MAX канал",
          },
        });
        return withRequestHeaders(
          { success: true, botName: result.botName },
          requestId
        );
      }
    }
  } catch (e) {
    console.error("Connect social error:", { requestId, error: e });
    return jsonError("Server error", requestId, 500);
  }
}

export async function DELETE(req: Request) {
  const requestId = getRequestId(req);
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", requestId, 401);

    const { platform } = await req.json();
    const parsedPlatform = socialPlatformSchema.safeParse(platform);
    if (!parsedPlatform.success) {
      return jsonError("Invalid platform", requestId);
    }

    await disconnectPlatform(parsedPlatform.data);
    return withRequestHeaders({ success: true }, requestId);
  } catch (e) {
    return jsonError("Server error", requestId, 500);
  }
}
