/**
 * Одноклассники (OK.ru) API client
 * Docs: https://apiok.ru/dev/methods/
 *
 * Для публикации в группе:
 * 1. Создайте приложение: https://ok.ru/devaccess
 * 2. Получите access_token через OAuth
 * 3. Получите application_key из настроек приложения
 * 4. Найдите ID группы в её URL: ok.ru/group/XXXXXXXXXX
 */

import * as crypto from "crypto";
import { requestJson, SocialApiError } from "./http";

const OK_API_BASE = "https://api.ok.ru/fb.do";

export interface OKPostParams {
  accessToken: string;
  applicationKey: string;
  secretKey: string; // application_secret_key из настроек
  groupId: string;
  text: string;
  mediaTopicType?: "GROUP_THEME" | "USER_STATUS";
}

/**
 * Генерирует подпись для OK API
 * sig = md5(sorted_params_string + session_secret_key)
 * session_secret_key = md5(access_token + application_secret_key)
 */
function generateOKSignature(
  params: Record<string, string>,
  accessToken: string,
  secretKey: string
): string {
  const sessionKey = crypto
    .createHash("md5")
    .update(accessToken + secretKey)
    .digest("hex");

  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("");

  return crypto
    .createHash("md5")
    .update(sortedParams + sessionKey)
    .digest("hex");
}

/**
 * Публикует пост в группу Одноклассников
 */
export async function okPublishPost(params: OKPostParams): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const attachment = JSON.stringify({
      media: [
        {
          type: "text",
          text: params.text,
        },
      ],
    });

    const apiParams: Record<string, string> = {
      application_key: params.applicationKey,
      attachment,
      gid: params.groupId,
      method: "mediatopic.post",
      type: params.mediaTopicType ?? "GROUP_THEME",
    };

    const sig = generateOKSignature(apiParams, params.accessToken, params.secretKey);

    const body = new URLSearchParams({
      ...apiParams,
      access_token: params.accessToken,
      sig,
      format: "json",
    });

    const data = await requestJson<{ error_code?: number; error_message?: string }>(
      OK_API_BASE,
      {
        method: "POST",
        body: body.toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (data.error_code) {
      return { success: false, error: data.error_message ?? `Error ${data.error_code}` };
    }

    return { success: true, id: String(data) };
  } catch (error) {
    if (error instanceof SocialApiError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown OK API error",
    };
  }
}

/**
 * Проверяет токен OK.ru
 */
export async function okVerifyToken(
  accessToken: string,
  applicationKey: string,
  secretKey: string
): Promise<boolean> {
  try {
    const apiParams: Record<string, string> = {
      application_key: applicationKey,
      method: "users.getCurrentUser",
    };
    const sig = generateOKSignature(apiParams, accessToken, secretKey);
    const body = new URLSearchParams({
      ...apiParams,
      access_token: accessToken,
      sig,
      format: "json",
    });
    const data = await requestJson<{ uid?: string }>(OK_API_BASE, {
      method: "POST",
      body: body.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return !!data.uid;
  } catch (error) {
    if (error instanceof SocialApiError) return false;
    return false;
  }
}

/**
 * Форматирует пост для Одноклассников
 */
export function formatOKPost(text: string, hashtags: string[]): string {
  const tags = hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  const full = tags ? `${text}\n\n${tags}` : text;
  return full.slice(0, 40000);
}
