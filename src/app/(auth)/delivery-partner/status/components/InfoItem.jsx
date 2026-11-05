
export default function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={17} />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}
