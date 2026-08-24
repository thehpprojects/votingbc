// ======================================
// Form Inputs (Input / Select / Textarea)
// ======================================

const baseCls =
  "input-base";

/** Text input with optional label, helper text and error. */
export function Input({ label, error, helper, className = "", ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`${baseCls} ${error ? "border-rose-400 focus:ring-rose-500/15 dark:border-rose-500/60" : ""}`}
        {...rest}
      />
      {helper && !error && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{helper}</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

/** Select dropdown with optional label + error. */
export function Select({ label, error, children, className = "", ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        className={`${baseCls} ${error ? "border-rose-400 focus:ring-rose-500/15" : ""}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

/** Textarea with optional label + error. */
export function Textarea({ label, error, className = "", ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        className={`${baseCls} ${error ? "border-rose-400 focus:ring-rose-500/15" : ""}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
