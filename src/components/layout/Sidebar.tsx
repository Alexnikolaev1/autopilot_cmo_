"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Дашборд", href: "/dashboard", icon: "⊞" },
  { label: "Проекты", href: "/projects", icon: "≡" },
  { label: "Новый контент", href: "/dashboard/new-project", icon: "✦" },
  { label: "Соцсети", href: "/social", icon: "◈" },
  { label: "Конкуренты", href: "/dashboard/competitors", icon: "◎" },
  { label: "Аналитика", href: "/dashboard/analytics", icon: "↗" },
  { label: "Настройки", href: "/settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-w-[220px] bg-surface border-r border-white/7 flex flex-col py-5">
      <div className="px-5 pb-6 border-b border-white/7 mb-4">
        <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-accent2 mb-1">
          Autopilot
        </div>
        <div className="text-lg font-black text-white leading-none">CMO</div>
      </div>

      <nav className="flex-1">
        <div className="text-[10px] font-bold tracking-widest uppercase text-muted2 px-5 py-3">
          Главная
        </div>
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}

        <div className="text-[10px] font-bold tracking-widest uppercase text-muted2 px-5 py-3 mt-2">
          Контент
        </div>
        <NavItem {...NAV_ITEMS[2]} active={pathname === NAV_ITEMS[2].href} />

        <div className="text-[10px] font-bold tracking-widest uppercase text-muted2 px-5 py-3 mt-2">
          Публикация
        </div>
        <NavItem {...NAV_ITEMS[3]} active={pathname === NAV_ITEMS[3].href} />

        <div className="text-[10px] font-bold tracking-widest uppercase text-muted2 px-5 py-3 mt-2">
          Стратегия
        </div>
        <NavItem {...NAV_ITEMS[4]} active={pathname === NAV_ITEMS[4].href} />

        <div className="text-[10px] font-bold tracking-widest uppercase text-muted2 px-5 py-3 mt-2">
          Данные
        </div>
        <NavItem {...NAV_ITEMS[5]} active={pathname === NAV_ITEMS[5].href} />
        <NavItem {...NAV_ITEMS[6]} active={pathname === NAV_ITEMS[6].href} />
      </nav>

      <div className="mt-auto px-5 pt-4 border-t border-white/7">
        <div className="text-[11px] font-mono text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded mb-3">
          ● Gemini 2.5 Flash
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-[12px] text-muted hover:text-red-400 transition-colors w-full text-left"
          >
            Выйти →
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavItem({
  label,
  href,
  icon,
  active,
}: {
  label: string;
  href: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium border-l-2 transition-all ${
        active
          ? "text-accent2 border-accent2 bg-accent2/7"
          : "text-muted border-transparent hover:text-white hover:bg-surface2"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}
