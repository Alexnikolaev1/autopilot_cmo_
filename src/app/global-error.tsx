"use client";

import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-bg text-white flex items-center justify-center min-h-screen font-syne">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠</div>
          <h1 className="text-2xl font-black mb-2">Что-то пошло не так</h1>
          <p className="text-muted text-sm mb-6">{error.message || "Неизвестная ошибка"}</p>
          <Button onClick={reset}>Попробовать снова</Button>
        </div>
      </body>
    </html>
  );
}
