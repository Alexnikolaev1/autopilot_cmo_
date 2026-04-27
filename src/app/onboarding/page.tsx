"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";

const STEPS = [
  { title: "Добро пожаловать!", subtitle: "Познакомимся с вашим бизнесом" },
  { title: "Ваш первый проект", subtitle: "Опишите бизнес и аудиторию" },
  { title: "Готово!", subtitle: "Запустим первый контент-план" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: "",
    businessDesc: "",
    audience: "",
    platforms: [] as string[],
  });
  const router = useRouter();

  const togglePlatform = (p: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? "var(--accent)" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>

        <div className="bg-surface border border-white/7 rounded-2xl p-8">
          <div className="mb-8">
            <div className="text-xs font-bold tracking-widest uppercase text-accent2 mb-2">
              Шаг {step + 1} из {STEPS.length}
            </div>
            <h1 className="text-2xl font-black mb-1">{STEPS[step].title}</h1>
            <p className="text-muted text-sm">{STEPS[step].subtitle}</p>
          </div>

          {/* Step 0 */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="bg-surface2 rounded-xl p-5 border border-white/7">
                <div className="text-4xl mb-3">✦</div>
                <h2 className="font-bold mb-2">Autopilot CMO</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Ваш персональный AI-директор по маркетингу. Мы создаём
                  контент-планы, пишем посты и помогаем публиковать их на всех
                  платформах — автоматически.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "🎯 Умная генерация контента",
                  "📅 Планирование публикаций",
                  "📊 Аналитика охватов",
                  "🤖 Powered by Gemini AI",
                ].map((f) => (
                  <div
                    key={f}
                    className="text-sm text-muted bg-surface2 rounded-xl p-3 border border-white/7"
                  >
                    {f}
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(1)} size="lg" className="w-full">
                Начать настройку →
              </Button>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Input
                label="Название бизнеса"
                placeholder="Кофейня «Арома», IT-стартап Nexus..."
                value={formData.businessName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, businessName: e.target.value }))
                }
              />
              <Textarea
                label="Описание бизнеса"
                placeholder="Чем занимаетесь, что предлагаете клиентам..."
                value={formData.businessDesc}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, businessDesc: e.target.value }))
                }
              />
              <Input
                label="Целевая аудитория"
                placeholder="Молодёжь 20-35 лет, ценители кофе..."
                value={formData.audience}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, audience: e.target.value }))
                }
              />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                  Платформы
                </div>
                <div className="flex gap-2">
                  {["Instagram", "Twitter", "LinkedIn"].map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        formData.platforms.includes(p)
                          ? "bg-accent/15 border-accent text-accent2"
                          : "bg-surface2 border-white/10 text-muted hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => setStep(2)}
                size="lg"
                className="w-full mt-2"
                disabled={!formData.businessName}
              >
                Продолжить →
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h2 className="font-bold text-green-400 mb-2">
                  Всё готово, {formData.businessName || "маркетолог"}!
                </h2>
                <p className="text-sm text-muted">
                  Ваш AI-директор по маркетингу настроен и готов к работе.
                  Перейдите на дашборд и создайте первый контент-план.
                </p>
              </div>
              <div className="bg-surface2 rounded-xl p-4 border border-white/7 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Бизнес</span>
                  <span>{formData.businessName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Платформы</span>
                  <span>{formData.platforms.join(", ") || "Все"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">AI-модель</span>
                  <span className="text-green-400">Gemini 2.5 Flash</span>
                </div>
              </div>
              <Button onClick={handleFinish} size="lg" className="w-full">
                Перейти на дашборд ✦
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
