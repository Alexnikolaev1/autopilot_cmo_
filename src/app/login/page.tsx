"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/lib/auth";
import { Input, Button } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full" size="lg">
      {pending ? "Подключение..." : "Войти с Gemini API Key →"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(
    async (_prev: unknown, formData: FormData) => {
      return await loginAction(formData);
    },
    null
  );

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-accent2 mb-2">
            Autopilot
          </div>
          <div className="text-5xl font-black text-white mb-3">CMO</div>
          <p className="text-muted text-sm">
            AI-директор по маркетингу для вашего бизнеса
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/7 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-lg font-bold mb-1">Подключите Gemini</h1>
            <p className="text-sm text-muted">
              Введите ваш Gemini API Key для начала работы. Ключ хранится
              только в вашем браузере.
            </p>
          </div>

          <form action={action} className="flex flex-col gap-4">
            <Input
              name="apiKey"
              type="password"
              label="Gemini API Key"
              placeholder="AIzaSy..."
              autoComplete="off"
            />

            {state?.error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>

          <div className="mt-5 pt-5 border-t border-white/7 text-xs text-muted text-center">
            Получить ключ:{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent2 hover:underline"
            >
              aistudio.google.com
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: "✦", text: "Контент-планы за секунды" },
            { icon: "◈", text: "Посты для всех платформ" },
            { icon: "↗", text: "Аналитика и отчёты" },
          ].map((f) => (
            <div
              key={f.text}
              className="text-center bg-surface border border-white/7 rounded-xl p-3"
            >
              <div className="text-accent2 text-lg mb-1">{f.icon}</div>
              <div className="text-[11px] text-muted">{f.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
