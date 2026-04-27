import { getSession } from "@/lib/get-session";
import { getSocialCredentials } from "@/lib/social/credentials";
import { getRequestId, withRequestHeaders } from "@/lib/api/request-context";
import { getPublishMetricsSnapshot } from "@/lib/telemetry/social-metrics";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  try {
    const session = await getSession();
    if (!session) {
      return withRequestHeaders({ error: "Unauthorized" }, requestId, { status: 401 });
    }

    const creds = await getSocialCredentials();
    const includeMetrics = new URL(req.url).searchParams.get("includeMetrics") === "1";

    // Return connection status without exposing tokens
    return withRequestHeaders(
      {
        vk: creds.vk
          ? { connected: true, groupName: creds.vk.groupName, groupId: creds.vk.groupId }
          : { connected: false },
        ok: creds.ok
          ? { connected: true, groupName: creds.ok.groupName, groupId: creds.ok.groupId }
          : { connected: false },
        max: creds.max
          ? { connected: true, channelName: creds.max.channelName, channelId: creds.max.channelId }
          : { connected: false },
        instagram: creds.instagram
          ? {
              connected: true,
              accountName: creds.instagram.username,
              igUserId: creds.instagram.igUserId,
              defaultImageUrl: creds.instagram.defaultImageUrl,
            }
          : { connected: false },
        ...(includeMetrics
          ? { metrics: await getPublishMetricsSnapshot() }
          : {}),
      },
      requestId
    );
  } catch (e) {
    return withRequestHeaders({ error: "Server error" }, requestId, { status: 500 });
  }
}
