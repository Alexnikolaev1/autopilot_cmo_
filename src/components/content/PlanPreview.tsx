"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { GeneratedPost } from "@/lib/types";
import { PLATFORM_META } from "@/lib/types";
import { Button } from "@/components/ui";

interface PlanPreviewProps {
  posts: GeneratedPost[];
  onApprove: (postId: string) => void;
}

export function PlanPreview({ posts, onApprove }: PlanPreviewProps) {
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApproved((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    onApprove(id);
    toast.success("Пост одобрен ✓");
  };

  const handlePublish = async (post: GeneratedPost) => {
    setPublishing(post.id);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          platform: post.platform,
          text: post.text,
          hashtags: post.hashtags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Ошибка публикации");
      } else {
        toast.success(`Опубликовано в ${PLATFORM_META[post.platform]?.label ?? post.platform}!`);
        if (data.url) {
          toast(`Ссылка: ${data.url}`, { duration: 5000 });
        }
      }
    } catch {
      toast.error("Ошибка сети. Попробуйте снова.");
    }
    setPublishing(null);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <div className="text-4xl mb-3">📋</div>
        <p>Контент-план пуст. Сгенерируйте посты выше.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => {
        const meta = PLATFORM_META[post.platform];
        const isApproved = approved.has(post.id);
        const isPublishing = publishing === post.id;

        return (
          <div
            key={post.id}
            className="border rounded-xl p-4 transition-all"
            style={{
              background: meta?.bgColor ?? "rgba(255,255,255,0.04)",
              borderColor: isApproved
                ? "rgba(52,211,153,0.3)"
                : "rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-xs"
                style={{ background: meta?.color ?? "#666" }}
              >
                {meta?.shortLabel ?? post.platform.toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold" style={{ color: meta?.color }}>
                    {meta?.label ?? post.platform}
                  </span>
                  <span className="text-[10px] text-muted">🕐 {post.bestTime}</span>
                </div>
                <p className="text-sm text-white leading-relaxed">{post.text}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.hashtags.map((tag) => (
                    <span key={tag} className="text-[10px] text-accent2 font-mono">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
                {meta && (
                  <div className="text-[10px] text-muted2 mt-1">
                    {post.text.length}/{meta.maxLength} символов
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                {isApproved ? (
                  <>
                    <Button
                      size="sm"
                      loading={isPublishing}
                      onClick={() => handlePublish(post)}
                    >
                      {isPublishing ? "..." : "Опубликовать"}
                    </Button>
                    <span className="text-[10px] text-green-400">✓ Одобрен</span>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => handleApprove(post.id)}>
                    Одобрить
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
