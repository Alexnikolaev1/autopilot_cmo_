/**
 * Единый публикатор — маршрутизирует запросы к нужному API соцсети
 */

import { vkWallPost, formatVKPost } from "./vk";
import { okPublishPost, formatOKPost } from "./ok";
import { maxSendMessage, formatMAXPost } from "./max";
import type { Platform, PublishResult, SocialCredentials } from "@/lib/types";

export interface PublishPostParams {
  platform: Platform;
  text: string;
  hashtags: string[];
  credentials: SocialCredentials;
}

export async function publishToSocial(
  params: PublishPostParams
): Promise<PublishResult> {
  try {
    const { platform, text, hashtags, credentials } = params;

    switch (platform) {
      case "vk": {
        const creds = credentials.vk;
        if (!creds) return { success: false, error: "ВКонтакте не подключён" };

        const message = formatVKPost(text, hashtags);
        const result = await vkWallPost({
          accessToken: creds.accessToken,
          ownerId: creds.groupId,
          message,
        });

        if (result.error) {
          return { success: false, error: `ВК: ${result.error.error_msg}` };
        }

        const postId = result.response?.post_id;
        const cleanGroupId = creds.groupId.replace("-", "");
        return {
          success: true,
          platformPostId: String(postId),
          url: `https://vk.com/wall${creds.groupId}_${postId}`,
        };
      }

      case "ok": {
        const creds = credentials.ok;
        if (!creds) return { success: false, error: "Одноклассники не подключлены" };
        const secretKey = process.env.OK_SECRET_KEY;
        if (!secretKey) {
          return {
            success: false,
            error: "Не настроен OK_SECRET_KEY. Добавьте его в переменные окружения.",
          };
        }

        const formattedText = formatOKPost(text, hashtags);
        const result = await okPublishPost({
          accessToken: creds.accessToken,
          applicationKey: creds.applicationKey,
          secretKey,
          groupId: creds.groupId,
          text: formattedText,
        });

        if (!result.success) {
          return { success: false, error: `ОК: ${result.error}` };
        }

        return {
          success: true,
          platformPostId: result.id,
          url: `https://ok.ru/group/${creds.groupId}/topic/${result.id}`,
        };
      }

      case "max": {
        const creds = credentials.max;
        if (!creds) return { success: false, error: "MAX не подключён" };

        const formattedText = formatMAXPost(text, hashtags);
        const result = await maxSendMessage({
          token: creds.accessToken,
          chatId: creds.channelId,
          text: formattedText,
          format: "markdown",
        });

        if (!result.success) {
          return { success: false, error: `MAX: ${result.error}` };
        }

        return {
          success: true,
          platformPostId: String(result.messageId),
        };
      }

      default:
        return { success: false, error: "Неизвестная платформа" };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Неизвестная ошибка";
    return { success: false, error: message };
  }
}
