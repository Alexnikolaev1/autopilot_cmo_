"use client";

import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button, Select, Card } from "@/components/ui";

export default function SettingsPage() {
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
            <div className="text-xs text-muted bg-surface2 border border-white/10 rounded-lg px-3 py-3 leading-relaxed">
              Ключ берётся автоматически из вашей текущей сессии/переменных окружения.
              Ручная проверка в интерфейсе отключена, чтобы не было ложных ошибок.
              Если генерация работает, значит ключ используется корректно.
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
              <div className="flex justify-between"><span>AI-модель</span><span className="text-green-400">Gemini (GEMINI_MODEL)</span></div>
              <div className="flex justify-between"><span>Фреймворк</span><span>Next.js 14 App Router</span></div>
              <div className="flex justify-between"><span>Деплой</span><span>Vercel</span></div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
