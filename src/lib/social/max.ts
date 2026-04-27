/**
 * MAX (Mail.ru) Bot API client
 * Docs: https://dev.max.ru/
 *
 * MAX — это новое имя VK Teams / TamTam от Mail.ru Group.
 * Публикация через Bot API в каналы и чаты.
 *
 * Для публикации в канал:
 * 1. Создайте бота: https://dev.max.ru/bots/create
 * 2. Получите token бота
 * 3. Добавьте бота в ваш канал как администратора
 * 4. Узнайте chat_id канала через getUpdates или /start в боте
 */

import { requestJson, SocialApiError } from "./http";

const MAX_API_BASE = "https://botapi.max.ru";

export interface MAXSendMessageParams {
  token: string;
  chatId: string;
  text: string;
  format?: "html" | "markdown";
  disableLinkPreview?: boolean;
}

export interface MAXMessageResult {
  success: boolean;
  messageId?: number;
  timestamp?: number;
  error?: string;
}

/**
 * Отправляет сообщение в канал MAX
 */
export async function maxSendMessage(params: MAXSendMessageParams): Promise<MAXMessageResult> {
  try {
    const body: Record<string, unknown> = {
      chat_id: params.chatId,
      text: params.text,
    };

    if (params.format) body.format = params.format;
    if (params.disableLinkPreview) body.disable_link_preview = true;

    const data = await requestJson<{
      error?: string;
      message?: { id?: number; timestamp?: number };
    }>(`${MAX_API_BASE}/messages?access_token=${params.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
      messageId: data.message?.id,
      timestamp: data.message?.timestamp,
    };
  } catch (e) {
    if (e instanceof SocialApiError) {
      return { success: false, error: e.message };
    }
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Получает информацию о боте MAX (проверка токена)
 */
export async function maxVerifyToken(token: string): Promise<{
  valid: boolean;
  botName?: string;
}> {
  try {
    const data = await requestJson<{ user_id?: string; name?: string }>(
      `${MAX_API_BASE}/me?access_token=${token}`
    );
    if (data.user_id) {
      return { valid: true, botName: data.name };
    }
    return { valid: false };
  } catch (error) {
    if (error instanceof SocialApiError) return { valid: false };
    return { valid: false };
  }
}

/**
 * Получает список чатов/каналов, доступных боту
 */
export async function maxGetChats(token: string): Promise<
  Array<{ chatId: string; title: string; type: string }>
> {
  try {
    const data = await requestJson<{
      chats?: Array<{ chat_id: string; title: string; type: string }>;
    }>(`${MAX_API_BASE}/chats?access_token=${token}&count=50`);
    if (data.chats) {
      return data.chats.map((c: { chat_id: string; title: string; type: string }) => ({
        chatId: String(c.chat_id),
        title: c.title ?? "Без названия",
        type: c.type,
      }));
    }
    return [];
  } catch (error) {
    if (error instanceof SocialApiError) return [];
    return [];
  }
}

/**
 * Форматирует пост для MAX с поддержкой Markdown
 * Лимит 4096 символов
 */
export function formatMAXPost(text: string, hashtags: string[]): string {
  const tags = hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  const full = tags ? `${text}\n\n${tags}` : text;
  return full.slice(0, 4096);
}
