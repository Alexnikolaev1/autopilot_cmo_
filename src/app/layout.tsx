import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Autopilot CMO — AI Marketing Director",
  description: "AI-powered content planning, generation and publishing for small businesses. Powered by Gemini 2.5 Flash.",
  keywords: ["AI marketing", "content plan", "SMM automation", "Gemini AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--surface3)",
              border: "1px solid var(--border2)",
              color: "var(--text)",
              fontFamily: "Syne, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
