// ======================================
// VoteChain 404 Not Found Page
// ======================================

import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="bg-gradient-to-r from-brand-500 to-violet-600 bg-clip-text text-8xl font-extrabold text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:from-brand-500 hover:to-violet-500"
      >
        <FaHome className="h-4 w-4" /> Back to Home
      </Link>
    </div>
  );
}