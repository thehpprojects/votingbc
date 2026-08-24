// ======================================
// Dashboard Sidebar
// ======================================

import { NavLink, Link } from "react-router-dom";
import { FaTimes, FaShieldAlt } from "react-icons/fa";
import Logo from "../../components/common/Logo";

/**
 * Sidebar navigation for dashboard layouts (admin & voter).
 * @param {Array<{to:string, label:string, icon:Component, end?:boolean}>} items
 */
export default function Sidebar({ items, title, subtitle, onClose, open }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-white/10 dark:bg-midnight-950 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" textClassName="text-white" />
          </Link>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Title */}
        <div className="px-5 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-glow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-white/5">
            <FaShieldAlt className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-[11px] leading-relaxed text-slate-400">
              Blockchain verified ·{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Polygon Amoy
              </span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
