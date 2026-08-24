// ======================================
// Page Loader (full-screen)
// ======================================

export default function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
