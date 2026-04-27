"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Textarea, Select, Card } from "@/components/ui";
import { PlanPreview } from "@/components/content/PlanPreview";
import type { GeneratedPost, Platform, Tone } from "@/lib/types";

type Step = "form" | "generating" | "preview";

const PLATFORM_OPTIONS = [
  { value: "vk", label: "ВКонтакте" },
  { value: "ok", label: "Одноклассники" },
  { value: "max", label: "MAX (Mail.ru)" },
  { value: "instagram", label: "Instagram" },
];

const TONE_OPTIONS = [
  { value: "warm", label: "Тёплый и дружелюбный" },
  { value: "professional", label: "Профессиональный" },
  { value: "inspirational", label: "Вдохновляющий" },
  { value: "humorous", label: "С юмором" },
  { value: "casual", label: "Неформальный" },
];

const POSTS_PER_WEEK_OPTIONS = [
  { value: "3", label: "3 поста в неделю" },
  { value: "5", label: "5 постов в неделю" },
  { value: "7", label: "7 постов в неделю" },
  { value: "14", label: "14 постов в неделю" },
];

export default function NewProjectPage() {
  const [step, setStep] = useState<Step>("form");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [formData, setFormData] = useState({
    businessDescription: "",
    targetAudience: "",
    tone: "warm",
    postsPerWeek: "5",
    additionalContext: "",
  });
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [rawOutput, setRawOutput] = useState("");
  const [activeTab, setActiveTab] = useState<"plan" | "post" | "ad">("plan");
  const [postTopic, setPostTopic] = useState("");
  const [postPlatform, setPostPlatform] = useState("instagram");
  const [postOutput, setPostOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleGeneratePlan = async () => {
    if (!formData.businessDescription || selectedPlatforms.length === 0) {
      toast.error("Заполните описание бизнеса и выберите платформы");
      return;
    }
    setStep("generating");
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          platforms: selectedPlatforms as Platform[],
          postsPerWeek: parseInt(formData.postsPerWeek),
        }),
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();

      if (data.plan?.posts) {
        setGeneratedPosts(
          data.plan.posts.map((p: GeneratedPost, i: number) => ({
            ...p,
            id: p.id || `post_${i}`,
            status: "draft",
          }))
        );
        setStep("preview");
        toast.success("Контент-план готов! ✦");
      } else {
        throw new Error("No posts in response");
      }
    } catch (e) {
      toast.error("Ошибка генерации. Проверьте API-ключ.");
      setStep("form");
    }
  };

  const handleGeneratePost = async () => {
    if (!postTopic) { toast.error("Укажите тему поста"); return; }
    setIsLoading(true);
    setPostOutput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Напиши готовый пост для ${postPlatform} на тему: "${postTopic}". Включи готовый текст, 5-7 хештегов и рекомендацию по визуалу.`,
          }],
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      let output = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const parsed = JSON.parse(line.slice(2));
              output += parsed;
              setPostOutput(output);
            } catch {}
          }
        }
      }
      toast.success("Пост создан!");
    } catch {
      toast.error("Ошибка генерации");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-7 py-4 border-b border-white/7 bg-surface">
        <div>
          <h1 className="text-xl font-bold">Генератор контента</h1>
          <p className="text-xs text-muted mt-0.5">AI создаёт контент специально для вашего бизнеса</p>
        </div>
        {step === "preview" && (
          <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
            ← Новый план
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-7">
        {/* Tabs */}
        {step === "form" && (
          <>
            <div className="flex gap-1 p-1 bg-surface2 rounded-xl w-fit mb-6">
              {(["plan", "post", "ad"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-surface3 text-white"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {tab === "plan" ? "Контент-план" : tab === "post" ? "Один пост" : "Реклама"}
                </button>
              ))}
            </div>

            {/* Plan form */}
            {activeTab === "plan" && (
              <Card className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Описание бизнеса"
                    placeholder="Кофейня, IT-стартап, пекарня..."
                    value={formData.businessDescription}
                    onChange={(e) => setFormData((p) => ({ ...p, businessDescription: e.target.value }))}
                  />
                  <Input
                    label="Целевая аудитория"
                    placeholder="Молодёжь 20-35, ценители кофе..."
                    value={formData.targetAudience}
                    onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Select
                    label="Тон коммуникации"
                    options={TONE_OPTIONS}
                    value={formData.tone}
                    onChange={(e) => setFormData((p) => ({ ...p, tone: e.target.value }))}
                  />
                  <Select
                    label="Частота публикаций"
                    options={POSTS_PER_WEEK_OPTIONS}
                    value={formData.postsPerWeek}
                    onChange={(e) => setFormData((p) => ({ ...p, postsPerWeek: e.target.value }))}
                  />
                </div>
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Платформы</div>
                  <div className="flex gap-2">
                    {PLATFORM_OPTIONS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => togglePlatform(p.value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          selectedPlatforms.includes(p.value)
                            ? "bg-accent/15 border-accent text-accent2"
                            : "bg-surface2 border-white/10 text-muted hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  label="Дополнительный контекст (опционально)"
                  placeholder="Акции, сезонные события, особенности продукта..."
                  value={formData.additionalContext}
                  onChange={(e) => setFormData((p) => ({ ...p, additionalContext: e.target.value }))}
                />
                <Button onClick={handleGeneratePlan} size="lg" className="mt-4 w-full">
                  ✦ Сгенерировать контент-план
                </Button>
              </Card>
            )}

            {/* Post form */}
            {activeTab === "post" && (
              <Card className="mb-6">
                <div className="flex flex-col gap-4">
                  <Textarea
                    label="Тема или ключевое сообщение"
                    placeholder="Новый продукт, событие, совет для аудитории..."
                    value={postTopic}
                    onChange={(e) => setPostTopic(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Платформа"
                      options={PLATFORM_OPTIONS}
                      value={postPlatform}
                      onChange={(e) => setPostPlatform(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleGeneratePost} loading={isLoading} size="lg" className="w-full">
                    ✦ Создать пост
                  </Button>
                </div>
                {postOutput && (
                  <div className="mt-5 bg-surface2 border border-white/7 rounded-xl p-4 font-mono text-xs text-white leading-relaxed whitespace-pre-wrap">
                    {postOutput}
                  </div>
                )}
              </Card>
            )}

            {/* Ad form */}
            {activeTab === "ad" && (
              <Card>
                <p className="text-muted text-sm">Генератор рекламных текстов — в разработке. Используйте «Один пост» для создания промо-контента.</p>
              </Card>
            )}
          </>
        )}

        {/* Generating state */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent2 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-muted text-sm">AI создаёт ваш контент-план...</p>
            <p className="text-xs text-muted2">Это займёт несколько секунд</p>
          </div>
        )}

        {/* Preview */}
        {step === "preview" && (
          <>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-5 flex items-center gap-3">
              <span className="text-2xl">✦</span>
              <div>
                <div className="text-sm font-bold text-green-400">Контент-план готов!</div>
                <div className="text-xs text-muted mt-0.5">
                  {generatedPosts.length} постов для {selectedPlatforms.join(", ")}. Одобрите и запланируйте публикации.
                </div>
              </div>
            </div>
            <PlanPreview
              posts={generatedPosts}
              onApprove={(id) => {
                setGeneratedPosts((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
                );
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
