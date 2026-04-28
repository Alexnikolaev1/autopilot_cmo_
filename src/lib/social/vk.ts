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

type VkApiErrorPayload = {
  error?: { error_code: number; error_msg: string };
  /** В зависимости от версии/обёртки может прийти разная форма */
  response?:
    | Array<{ name?: string; id?: number; gid?: number; screen_name?: string }>
    | {
        count?: number;
        items?: Array<{ name?: string; id?: number; gid?: number; screen_name?: string }>;
        groups?: Array<{ name?: string; id?: number; gid?: number; screen_name?: string }>;
      }
    | Record<string, never>;
};

/** Для groups.getById нужен параметр `group_ids` (официальное имя параметра во VK API). */
function parseVkGroupLookupInput(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  const withoutMinus = t.startsWith("-") ? t.slice(1) : t;

  // Чисто числовой id (сообщество можно указывать как -123 или 123)
  if (/^\d+$/.test(withoutMinus)) {
    return withoutMinus;
  }

  // Короткое имя: club1234567890, public12345, xxx_yyy и т.д.
  if (/^[a-zA-Z0-9_]+$/.test(withoutMinus)) {
    return withoutMinus;
  }

  return null;
}

/**
 * Получает информацию о группе ВКонтакте
 */
export async function vkGetGroup(
  accessToken: string,
  groupId: string
): Promise<{ name: string; id: number } | null> {
  const r = await vkVerifyGroupConnection(accessToken, groupId);
  if (!r.ok) return null;
  return {
    name: r.groupName,
    id: Math.abs(Number(r.normalizedGroupId.replace("-", ""))),
  };
}

export type VkGroupConnectResult =
  | {
      ok: true;
      groupName: string;
      /** Отрицательный id сообщества для wall.post (-123…) */
      normalizedGroupId: string;
    }
  | { ok: false; message: string };

/**
 * Проверка токена **сообщества** и доступа к стене: только `groups.getById`.
 * Токен из «Управление → Работа с API» — это не пользовательский токен,
 * метод `users.get` для него даёт ошибку («токен недействителен» при проверке).
 */
export async function vkVerifyGroupConnection(
  accessToken: string,
  groupIdRaw: string
): Promise<VkGroupConnectResult> {
  const lookup = parseVkGroupLookupInput(groupIdRaw);
  if (!lookup) {
    return {
      ok: false,
      message:
        "Укажите ID сообщества: число из URL (можно с минусом, напр. -33683505) или короткое имя (напр. club1234567890).",
    };
  }

  const params = new URLSearchParams({
    group_ids: lookup,
    access_token: accessToken,
    v: VK_API_VERSION,
    fields: "name,screen_name",
  });
  const url = `${VK_API_BASE}/groups.getById?${params.toString()}`;

  try {
    const data = await requestJson<VkApiErrorPayload>(url);
    if (data.error) {
      const { error_code: code, error_msg: vkMsg } = data.error;
      let hint = vkMsg;
      if (code === 5 || code === 15) {
        hint =
          "Доступ запрещён: нужен ключ сообщества из «Управление → Работа с API» с правами wall (рекомендуется также photos для вложений).";
      }
      if (code === 100) {
        hint =
          "Неверный параметр (часто неверный ID или формат группы для этого токена).";
      }
      return {
        ok: false,
        message: `${hint} (${vkMsg}, код ${code})`,
      };
    }

    const resp = data.response;
    const rows = Array.isArray(resp)
      ? resp
      : resp && typeof resp === "object"
      ? "items" in resp && Array.isArray(resp.items)
        ? resp.items
        : "groups" in resp && Array.isArray(resp.groups)
        ? resp.groups
        : []
      : [];
    const g = rows[0];
    const numericId = g?.id ?? g?.gid;
    if (!numericId) {
      return {
        ok: false,
        message:
          "Сообщество не найдено по указанному ID. Проверьте число без опечаток; в URL сообщества можно скопировать id из параметра clubXXXXXXXXXX или использовать короткое имя после vk.com/",
      };
    }

    return {
      ok: true,
      groupName: g.name ?? g.screen_name ?? `Группа ${lookup}`,
      normalizedGroupId: `-${numericId}`,
    };
  } catch (e) {
    const msg =
      e instanceof SocialApiError ? e.message : "Не удалось обратиться к API ВК";
    return { ok: false, message: msg };
  }
}

/**
 * Устарело для токена сообщества: используйте {@link vkVerifyGroupConnection}.
 */
export async function vkVerifyToken(accessToken: string): Promise<boolean> {
  try {
    const data = await requestJson<{ response?: Array<{ id: number }> }>(
      `${VK_API_BASE}/users.get?v=${VK_API_VERSION}&access_token=${encodeURIComponent(accessToken)}`
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
