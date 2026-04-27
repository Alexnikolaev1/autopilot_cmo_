"use client";

import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-4xl">⚠</div>
      <h2 className="text-lg font-bold">Ошибка загрузки</h2>
      <p className="text-muted text-sm text-center max-w-sm">{error.message}</p>
      <Button onClick={reset} variant="ghost">Попробовать снова</Button>
    </div>
  );
}
