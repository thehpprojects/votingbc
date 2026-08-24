// ======================================
// Stat Card (dashboard metrics)
// ======================================

export default function StatCard({ icon: Icon, label, value, sub, tone = "brand" }) {
  const tones = {
    brand:
      "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  };

  return (
    <div className="card card-hover flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${tones[tone] || tones.brand}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="truncate text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
        {sub && (
          <p className="truncate text-xs text-slate-400 dark:text-slate-500">{sub}</p>
        )}
      </div>
    </div>
  );
}
