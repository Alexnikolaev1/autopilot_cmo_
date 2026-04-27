interface StatsCardProps {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  color?: string;
}

export function StatsCard({ label, value, delta, positive = true, color = "#a78bfa" }: StatsCardProps) {
  return (
    <div className="bg-surface border border-white/7 rounded-2xl p-4 relative overflow-hidden">
      <div
        className="absolute w-16 h-16 rounded-full -top-3 -right-3 opacity-15"
        style={{ background: color }}
      />
      <div className="text-[11px] text-muted uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-black leading-none" style={{ color }}>
        {value}
      </div>
      {delta && (
        <div className={`text-[11px] mt-1.5 ${positive ? "text-green-400" : "text-red-400"}`}>
          {delta}
        </div>
      )}
    </div>
  );
}
