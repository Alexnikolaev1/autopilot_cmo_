"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button, Input, Card } from "@/components/ui";
import { PLATFORM_META } from "@/lib/types";
import type { SocialPlatform } from "@/lib/types";

interface PlatformStatus {
  connected: boolean;
  groupName?: string;
  groupId?: string;
  channelName?: string;
  channelId?: string;
  accountName?: string;
  igUserId?: string;
  defaultImageUrl?: string;
}

interface SocialStatus {
  vk: PlatformStatus;
  ok: PlatformStatus;
  max: PlatformStatus;
  instagram: PlatformStatus;
}

const PLATFORMS: Array<{
  id: SocialPlatform;
  icon: string;
  docsUrl: string;
  docsLabel: string;
  fields: Array<{
    name: string;
    label: string;
    placeholder: string;
    type: "password" | "text";
    hint: string;
  }>;
}> = [
  {
    id: "vk" as const,
    icon: "ВК",
    docsUrl: "https://vk.com/editapp?act=create",
    docsLabel: "Создать приложение ВКонтакте",
    fields: [
      { name: "accessToken", label: "Access Token сообщества", placeholder: "vk1.a.xxxx...", type: "password", hint: "Настройки сообщества → Управление → Работа с API" },
      { name: "groupId", label: "ID сообщества", placeholder: "-123456789", type: "text", hint: "Число с минусом. Откройте сообщество, ID в URL или в настройках" },
    ],
  },
  {
    id: "ok" as const,
    icon: "ОК",
    docsUrl: "https://ok.ru/devaccess",
    docsLabel: "Создать приложение OK.ru",
    fields: [
      { name: "accessToken", label: "Access Token", placeholder: "xxxxxxxxxxx", type: "password", hint: "Получите через OAuth 2.0 на apiok.ru" },
      { name: "applicationKey", label: "Application Key", placeholder: "ABCDEFGHIJ", type: "text", hint: "Публичный ключ из настроек вашего приложения OK.ru" },
      { name: "groupId", label: "ID группы", placeholder: "12345678901234", type: "text", hint: "Числовой ID группы из URL: ok.ru/group/XXXXXX" },
    ],
  },
  {
    id: "max" as const,
    icon: "M",
    docsUrl: "https://dev.max.ru/bots/create",
    docsLabel: "Создать бота MAX",
    fields: [
      { name: "accessToken", label: "Bot Token", placeholder: "your_bot_token_here", type: "password", hint: "Токен бота из @MaxBotFather или dev.max.ru" },
      { name: "channelId", label: "ID канала", placeholder: "-1001234567890", type: "text", hint: "Добавьте бота в канал как администратора, затем получите chat_id" },
    ],
  },
  {
    id: "instagram" as const,
    icon: "IG",
    docsUrl: "https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login",
    docsLabel: "Instagram Graph API docs",
    fields: [
      { name: "accessToken", label: "Instagram Access Token", placeholder: "EAAG...", type: "password", hint: "Токен Instagram Graph API с правами публикации" },
      { name: "igUserId", label: "Instagram User ID", placeholder: "1784...", type: "text", hint: "ID Instagram professional account (из Graph API)" },
      { name: "defaultImageUrl", label: "Default image URL (для постинга)", placeholder: "https://.../image.jpg", type: "text", hint: "Instagram API требует изображение для feed-поста" },
    ],
  },
];

export default function SocialNetworksPage() {
  const [status, setStatus] = useState<SocialStatus>({
    vk: { connected: false },
    ok: { connected: false },
    max: { connected: false },
    instagram: { connected: false },
  });
  const [expandedPlatform, setExpandedPlatform] = useState<SocialPlatform | null>(null);
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/social/status");
      if (res.ok) setStatus(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleConnect = async (platformId: SocialPlatform) => {
    const values = formValues[platformId] ?? {};
    setConnecting(platformId);
    try {
      const res = await fetch("/api/social/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка подключения");
      } else {
        toast.success(`${PLATFORM_META[platformId].label} подключён!`);
        setExpandedPlatform(null);
        await fetchStatus();
      }
    } catch {
      toast.error("Ошибка сети");
    }
    setConnecting(null);
  };

  const handleDisconnect = async (platformId: SocialPlatform) => {
    setDisconnecting(platformId);
    try {
      const res = await fetch("/api/social/connect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId }),
      });
      if (res.ok) {
        toast.success("Отключено");
        await fetchStatus();
      }
    } catch {
      toast.error("Ошибка отключения");
    }
    setDisconnecting(null);
  };

  const setField = (platform: string, field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [platform]: { ...(prev[platform] ?? {}), [field]: value },
    }));
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex items-center px-7 py-4 border-b border-white/7 bg-surface">
          <div>
            <h1 className="text-xl font-bold">Социальные сети</h1>
            <p className="text-xs text-muted mt-0.5">Подключите аккаунты для автоматической публикации</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 max-w-2xl">
          {/* Status summary */}
          <div className="flex gap-3 mb-7">
            {PLATFORMS.map(p => {
              const s = status[p.id];
              const meta = PLATFORM_META[p.id];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold"
                  style={s.connected
                    ? { borderColor: `${meta.color}40`, background: `${meta.color}10`, color: meta.color }
                    : { borderColor: "rgba(255,255,255,0.07)", color: "#555566" }}
                >
                  <span className="font-black">{meta.shortLabel}</span>
                  <span className={s.connected ? "text-green-400" : "text-muted2"}>
                    {s.connected ? "✓" : "○"}
                  </span>
                </div>
              );
            })}
          </div>

          {loading ? (
            <div className="flex gap-4 flex-col">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-surface2 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {PLATFORMS.map(platform => {
                const s = status[platform.id];
                const isExpanded = expandedPlatform === platform.id;
                const values = formValues[platform.id] ?? {};
                const isConnecting = connecting === platform.id;
                const meta = PLATFORM_META[platform.id];

                return (
                  <div
                    key={platform.id}
                    className="bg-surface border rounded-2xl overflow-hidden transition-all"
                    style={{ borderColor: isExpanded ? `${meta.color}40` : "rgba(255,255,255,0.07)" }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 p-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{ background: meta.color }}
                      >
                        {platform.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{meta.label}</span>
                          {s.connected && (
                            <span className="text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full font-semibold">
                              ✓ Подключён
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted mt-0.5">{meta.audience}</div>
                        {s.connected && (s.groupName || s.channelName || s.accountName) && (
                          <div className="text-xs mt-1" style={{ color: meta.color }}>
                            {s.groupName ?? s.channelName ?? s.accountName}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {s.connected ? (
                          <Button
                            size="sm"
                            variant="danger"
                            loading={disconnecting === platform.id}
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            Отключить
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                          >
                            {isExpanded ? "Свернуть ↑" : "Подключить →"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Connect form */}
                    {isExpanded && !s.connected && (
                      <div className="px-5 pb-5 border-t border-white/7 pt-4">
                        <p className="text-xs text-muted mb-4">{meta.description}</p>
                        <div className="flex flex-col gap-3 mb-4">
                          {platform.fields.map(field => (
                            <div key={field.name}>
                              <Input
                                label={field.label}
                                type={field.type as "text" | "password"}
                                placeholder={field.placeholder}
                                value={values[field.name] ?? ""}
                                onChange={e => setField(platform.id, field.name, e.target.value)}
                              />
                              {field.hint && (
                                <p className="text-[10px] text-muted2 mt-1 ml-1">{field.hint}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={isConnecting}
                            onClick={() => handleConnect(platform.id)}
                          >
                            Подключить {meta.label}
                          </Button>
                          <a
                            href={platform.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted hover:text-accent2 transition-colors flex items-center gap-1"
                          >
                            {platform.docsLabel} ↗
                          </a>
                        </div>

                        {/* Instructions */}
                        <div className="mt-4 bg-surface2 rounded-xl p-3 border border-white/7">
                          <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                            Как получить токен
                          </div>
                          {platform.id === "vk" && (
                            <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                              <li>Откройте сообщество ВКонтакте</li>
                              <li>Перейдите: Управление → Работа с API</li>
                              <li>Создайте ключ с правами <code className="bg-surface3 px-1 rounded">wall</code> и <code className="bg-surface3 px-1 rounded">photos</code></li>
                              <li>Скопируйте токен и вставьте выше</li>
                              <li>ID группы: откройте группу, число в URL</li>
                            </ol>
                          )}
                          {platform.id === "ok" && (
                            <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                              <li>Создайте приложение на <code className="bg-surface3 px-1 rounded">ok.ru/devaccess</code></li>
                              <li>Запишите Application Key (публичный)</li>
                              <li>В <code className="bg-surface3 px-1 rounded">.env.local</code> добавьте <code className="bg-surface3 px-1 rounded">OK_SECRET_KEY</code></li>
                              <li>Получите access_token через OAuth 2.0</li>
                              <li>ID группы — в URL страницы группы</li>
                            </ol>
                          )}
                          {platform.id === "max" && (
                            <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                              <li>Откройте MAX и напишите <code className="bg-surface3 px-1 rounded">@MaxBotFather</code></li>
                              <li>Создайте бота командой <code className="bg-surface3 px-1 rounded">/newbot</code></li>
                              <li>Скопируйте выданный токен</li>
                              <li>Добавьте бота в канал как администратора</li>
                              <li>Напишите боту /start в канале, ID появится в обновлениях</li>
                            </ol>
                          )}
                          {platform.id === "instagram" && (
                            <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                              <li>Нужен Instagram Professional account (Business/Creator)</li>
                              <li>Свяжите Instagram с Facebook Page и Meta App</li>
                              <li>Получите access token с правами Instagram Graph API</li>
                              <li>Укажите IG User ID аккаунта</li>
                              <li>Укажите defaultImageUrl — без него feed-пост не опубликуется</li>
                            </ol>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Env vars note */}
          <div className="mt-6 bg-surface2 border border-white/7 rounded-xl p-4">
            <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Переменные окружения
            </div>
            <p className="text-xs text-muted mb-2">
              Для Одноклассников добавьте секретный ключ в <code className="bg-surface3 px-1 py-0.5 rounded">.env.local</code>:
            </p>
            <code className="block text-xs font-mono text-amber-400 bg-surface3 px-3 py-2 rounded-lg">
              OK_SECRET_KEY=ваш_секретный_ключ_приложения
            </code>
          </div>
        </div>
      </main>
    </div>
  );
}
