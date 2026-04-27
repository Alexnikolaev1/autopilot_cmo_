"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";

export function WeeklyReportButton() {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setOpen(true);
    setLoading(true);
    setReport("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Ты — AI CMO. Напиши краткий аналитический отчёт за неделю для кофейни "Арома":
- Охваты: 12,400 (↑18%)
- Лайки: 847 (↑5%)
- Комментарии: 134 (↑22%)
- Репосты: 89 (↓3%)
- Лучший пост: Instagram "Тыквенный латте" — 3,200 охватов
- Слабые дни: вторник и четверг

Напиши 3-4 абзаца с выводами и 3 конкретные рекомендации на следующую неделю.`,
          }],
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      let output = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        for (const line of text.split("\n")) {
          if (line.startsWith("0:")) {
            try { output += JSON.parse(line.slice(2)); setReport(output); } catch {}
          }
        }
      }
    } catch {
      setReport("Ошибка генерации отчёта. Проверьте API-ключ Gemini.");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={generate}>
        Отчёт недели ✦
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Еженедельный AI-отчёт">
        {loading && !report ? (
          <div className="flex items-center gap-3 text-accent2 text-sm py-4">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
              ))}
            </div>
            Анализируем данные за неделю...
          </div>
        ) : (
          <div className="font-mono text-xs leading-relaxed text-white whitespace-pre-wrap">
            {report}
          </div>
        )}
      </Modal>
    </>
  );
}
