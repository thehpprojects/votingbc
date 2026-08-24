// ======================================
// Confirmation Dialog (Modal)
// ======================================

import { useState } from "react";
import Spinner from "./Spinner";

/**
 * Reusable confirmation modal used for destructive/important actions.
 * @param {object} props
 * @param {string|null} props.title modal title
 * @param {string} props.message description shown to the user
 * @param {string} props.confirmText label for the confirm button
 * @param {string} props.confirmVariant tailwind classes for the confirm button
 * @param {Function} props.onConfirm async handler
 * @param {Function} props.onClose close handler
 */
export default function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  confirmVariant = "bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500",
  onConfirm,
  onClose,
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!title) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm?.();
      onClose?.();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-scale-in rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-midnight-900 dark:shadow-glow"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-midnight-850"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${confirmVariant}`}
          >
            {submitting && <Spinner size="sm" light />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
