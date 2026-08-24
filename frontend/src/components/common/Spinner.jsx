// ======================================
// Loading Spinner
// ======================================

export default function Spinner({ size = "md", light = false }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12", xl: "h-20 w-20" };
  return (
    <div className="flex items-center justify-center py-8" role="status" aria-label="Loading">
      <div
        className={`${sizes[size] || sizes.md} animate-spin rounded-full border-4 ${
          light
            ? "border-white/30 border-t-white"
            : "border-brand-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400"
        }`}
      />
    </div>
  );
}
