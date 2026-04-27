/**
 * ВКонтакте API client
 * Docs: https://dev.vk.com/ru/reference
 *
 * Для публикации на стену группы:
 * 1. Создайте приложение: https://vk.com/editapp?act=create
 * 2. Получите токен сообщества с правами: wall, photos
 * 3. Передайте отрицательный group_id (например, -123456)
 */

import { requestJson, SocialApiError } from "./http";

const VK_API_BASE = "https://api.vk.com/method";
const VK_API_VERSION = "5.199";

export interface VKWallPostParams {
  accessToken: string;
  ownerId: string; // negative number for group, e.g. "-123456"
  message: string;
  attachments?: string; // comma-separated: "photo123_456,video789_012"
  publishDate?: number; // unix timestamp for scheduled post
}

export interface VKPostResult {
  response?: { post_id: number };
  error?: { error_code: number; error_msg: string };
}

/**
 * Публикует пост на стену ВКонтакте (группы или пользователя)
 */
export async function vkWallPost(params: VKWallPostParams): Promise<VKPostResult> {
  const body = new URLSearchParams({
    access_token: params.accessToken,
    owner_id: params.ownerId,
    message: params.message,
    v: VK_API_VERSION,
    from_group: "1",
  });

  if (params.attachments) body.set("attachments", params.attachments);
  if (params.publishDate) body.set("publish_date", String(params.publishDate));

  return requestJson<VKPostResult>(`${VK_API_BASE}/wall.post`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

/**
 * Получает информацию о группе ВКонтакте
 */
export async function vkGetGroup(
  accessToken: string,
  groupId: string
): Promise<{ name: string; id: number } | null> {
  try {
    const cleanId = groupId.replace("-", "");
    const data = await requestJson<{ response?: Array<{ name: string; id: number }> }>(
      `${VK_API_BASE}/groups.getById?group_id=${cleanId}&v=${VK_API_VERSION}&access_token=${accessToken}`
    );
    if (data.response?.[0]) {
      return { name: data.response[0].name, id: data.response[0].id };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Проверяет валидность токена ВКонтакте
 */
export async function vkVerifyToken(accessToken: string): Promise<boolean> {
  try {
    const data = await requestJson<{ response?: Array<{ id: number }> }>(
      `${VK_API_BASE}/users.get?v=${VK_API_VERSION}&access_token=${accessToken}`
    );
    return !!data.response?.[0]?.id;
  } catch (error) {
    if (error instanceof SocialApiError) return false;
    return false;
  }
}

/**
 * Форматирует пост для ВКонтакте:
 * - Хештеги добавляются в конец
 * - Учитывается лимит 16 000 символов
 */
export function formatVKPost(text: string, hashtags: string[]): string {
  const tags = hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  const full = tags ? `${text}\n\n${tags}` : text;
  return full.slice(0, 16000);
}
