// ======================================
// Reusable Button — premium Web3 style
// ======================================

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled = false,
  ...rest
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-glow hover:from-brand-500 hover:to-violet-500 hover:shadow-glow-lg",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-midnight-850 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-midnight-800 dark:hover:border-slate-600",
    danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/25",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-500 shadow-glow-emerald",
    ghost:
      "text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10",
    outline:
      "border border-brand-600 text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-500/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
