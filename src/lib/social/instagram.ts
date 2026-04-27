import { requestJson, SocialApiError } from "./http";

const IG_GRAPH_BASE = "https://graph.facebook.com/v22.0";

export interface InstagramCredentials {
  accessToken: string;
  igUserId: string;
  defaultImageUrl?: string;
}

export interface InstagramPublishParams {
  credentials: InstagramCredentials;
  text: string;
  hashtags: string[];
  imageUrl?: string;
}

function buildCaption(text: string, hashtags: string[]): string {
  const tags = hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ");
  const full = tags ? `${text}\n\n${tags}` : text;
  return full.slice(0, 2200);
}

export async function instagramVerifyAccess(params: {
  accessToken: string;
  igUserId: string;
}): Promise<{ valid: boolean; username?: string }> {
  try {
    const data = await requestJson<{ id?: string; username?: string }>(
      `${IG_GRAPH_BASE}/${params.igUserId}?fields=id,username&access_token=${params.accessToken}`
    );
    if (data.id) {
      return { valid: true, username: data.username ?? `ig_${params.igUserId}` };
    }
    return { valid: false };
  } catch (error) {
    if (error instanceof SocialApiError) return { valid: false };
    return { valid: false };
  }
}

export async function instagramPublishPost(
  params: InstagramPublishParams
): Promise<{ success: boolean; mediaId?: string; permalink?: string; error?: string }> {
  const imageUrl = params.imageUrl ?? params.credentials.defaultImageUrl;
  if (!imageUrl) {
    return {
      success: false,
      error:
        "Для Instagram нужен image URL. Укажите defaultImageUrl при подключении аккаунта.",
    };
  }

  try {
    const caption = buildCaption(params.text, params.hashtags);
    const create = await requestJson<{ id?: string; error?: { message?: string } }>(
      `${IG_GRAPH_BASE}/${params.credentials.igUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          image_url: imageUrl,
          caption,
          access_token: params.credentials.accessToken,
        }).toString(),
      }
    );
    if (!create.id) {
      return {
        success: false,
        error: create.error?.message ?? "Instagram: media creation failed",
      };
    }

    const publish = await requestJson<{ id?: string; error?: { message?: string } }>(
      `${IG_GRAPH_BASE}/${params.credentials.igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: create.id,
          access_token: params.credentials.accessToken,
        }).toString(),
      }
    );
    const mediaId = publish.id;
    if (!mediaId) {
      return {
        success: false,
        error: publish.error?.message ?? "Instagram: media publish failed",
      };
    }

    let permalink: string | undefined;
    try {
      const permalinkRes = await requestJson<{ permalink?: string }>(
        `${IG_GRAPH_BASE}/${mediaId}?fields=permalink&access_token=${params.credentials.accessToken}`
      );
      permalink = permalinkRes.permalink;
    } catch {
      // optional
    }

    return {
      success: true,
      mediaId,
      permalink,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Instagram publish error",
    };
  }
}
