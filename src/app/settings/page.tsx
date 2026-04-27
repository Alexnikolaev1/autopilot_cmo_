"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button, Input, Select, Card } from "@/components/ui";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateKey = async () => {
    if (!apiKey || apiKey.length < 20) {
      toast.error("Введите корректный API-ключ");
      return;
    }
    setValidating(true);
    try {
      // Simple validation: try a minimal Gemini call
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
      if (res.ok) {
        setIsValid(true);
        toast.success("Ключ действителен ✓");
      } else {
        setIsValid(false);
        toast.error("Ключ недействителен");
      }
    } catch {
      setIsValid(false);
      toast.error("Ошибка проверки. Проверьте подключение.");
    }
    setValidating(false);
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex items-center px-7 py-4 border-b border-white/7 bg-surface">
          <div>
            <h1 className="text-xl font-bold">Настройки</h1>
            <p className="text-xs text-muted mt-0.5">API-ключи и параметры приложения</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 max-w-xl">
          <Card className="mb-5">
            <h2 className="text-sm font-bold mb-4">Gemini API Key</h2>
            <div className="flex flex-col gap-3">
              <Input
                label="API Key"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setIsValid(null); }}
              />
              {isValid === true && (
                <div className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                  ✓ Ключ действителен — Gemini 2.5 Flash активен
                </div>
              )}
              {isValid === false && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  ✗ Ключ недействителен. Проверьте его на aistudio.google.com
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" loading={validating} onClick={validateKey}>
                  Проверить ключ
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Ключ обновлён")}>
                  Сохранить
                </Button>
              </div>
            </div>
          </Card>

          <Card className="mb-5">
            <h2 className="text-sm font-bold mb-4">Публикации</h2>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Часовой пояс"
                options={[
                  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+2)" },
                  { value: "Europe/Moscow", label: "Europe/Moscow (UTC+3)" },
                  { value: "UTC", label: "UTC" },
                ]}
              />
              <Select
                label="Язык контента"
                options={[
                  { value: "ru", label: "Русский" },
                  { value: "en", label: "English" },
                  { value: "de", label: "Deutsch" },
                ]}
              />
            </div>
            <Button size="sm" className="mt-4" onClick={() => toast.success("Настройки сохранены")}>
              Сохранить
            </Button>
          </Card>

          <Card>
            <h2 className="text-sm font-bold mb-2">О приложении</h2>
            <div className="text-xs text-muted space-y-1">
              <div className="flex justify-between"><span>Версия</span><span>0.1.0 MVP</span></div>
              <div className="flex justify-between"><span>AI-модель</span><span className="text-green-400">Gemini 2.5 Flash-Lite</span></div>
              <div className="flex justify-between"><span>Фреймворк</span><span>Next.js 14 App Router</span></div>
              <div className="flex justify-between"><span>Деплой</span><span>Vercel</span></div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
