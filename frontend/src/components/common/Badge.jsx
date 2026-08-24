// ======================================
// Status Badge
// ======================================

import { stateBadgeClasses, capitalize } from "../../utils/format";

/**
 * Small pill badge. `tone` can be a preset name or raw tailwind classes.
 */
export default function Badge({ children, tone = "default", className = "" }) {
  const tones = {
    default:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    success:
      "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
    warning:
      "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
    danger:
      "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
    info:
      "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/30",
    brand:
      "bg-brand-100 text-brand-700 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30",
  };

  const cls =
    tone === "state"
      ? stateBadgeClasses(capitalize(children))
      : tones[tone] || tones.default;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls} ${className}`}
    >
      {children}
    </span>
  );
}
