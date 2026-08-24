// ======================================
// Dashboard Topbar
// ======================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaUserCircle, FaCaretDown } from "react-icons/fa";
import WalletConnectButton from "../../components/common/WalletConnectButton";
import ThemeToggle from "../../components/common/ThemeToggle";

/**
 * Top navigation bar for dashboard layouts.
 */
export default function Topbar({
  onMenuClick,
  user,
  onLogout,
  wallet,
  showWallet = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-midnight-950/85">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-midnight-850"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <FaBars className="h-5 w-5" />
          </button>
          <h1 className="hidden text-sm font-semibold text-slate-400 sm:block dark:text-slate-500">
            {user?.name ? `Welcome, ${user.name}` : "Dashboard"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {showWallet && <WalletConnectButton wallet={wallet} size="sm" />}

          <ThemeToggle />

          {/* User dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-midnight-850"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <FaUserCircle className="h-5 w-5 text-slate-400" />
              <span className="hidden max-w-[120px] truncate sm:block">{user?.name || "User"}</span>
              <FaCaretDown className="h-3 w-3 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-44 animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-midnight-900">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-midnight-850"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <FaUserCircle className="h-4 w-4 text-brand-500" /> My Profile
                </button>
                <button
                  className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  <FaSignOutAlt className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>

          <Link
            to="/"
            className="hidden text-xs font-semibold text-slate-400 hover:text-brand-600 md:block dark:text-slate-500 dark:hover:text-brand-400"
          >
            View Site
          </Link>
        </div>
      </div>
    </header>
  );
}
