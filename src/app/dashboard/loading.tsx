export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-7 animate-pulse">
      <div className="h-8 w-48 bg-surface2 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-surface2 rounded-2xl" />
        ))}
      </div>
      <div className="h-40 bg-surface2 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-surface2 rounded-2xl" />
        <div className="h-32 bg-surface2 rounded-2xl" />
      </div>
    </div>
  );
}
