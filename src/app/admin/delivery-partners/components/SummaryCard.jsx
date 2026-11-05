
export default function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}
