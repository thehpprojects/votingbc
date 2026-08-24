// ======================================
// VoteChain Navbar
// ======================================

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaShieldAlt } from "react-icons/fa";
import Logo from "../../components/common/Logo";
import ChakraEmblem from "../../components/common/ChakraEmblem";
import ThemeToggle from "../../components/common/ThemeToggle";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "How It Works" },
  { to: "/results", label: "Live Results" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-midnight-950/80">
      {/* Official tricolor strip */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Security strip */}
      <div className="bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600 text-white">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-center px-4 text-[11px] font-semibold tracking-wide sm:px-6">
          <FaShieldAlt className="mr-1.5 h-3 w-3 text-white/80" />
          SECURE · TRANSPARENT · TAMPER-RESISTANT · BLOCKCHAIN-POWERED
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex items-center gap-2">
            <ChakraEmblem className="h-10 w-10 shrink-0 text-brand-700 dark:text-brand-400" />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-hindi text-[13px] font-bold text-slate-900 dark:text-white">
                राष्ट्रीय निर्वाचन आयोग
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                National Election Commission
              </span>
            </span>
          </span>
          <span className="mx-1 hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-700" />
          <span className="hidden min-[480px]:inline-flex">
            <Logo />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 min-[480px]:hidden dark:text-white">
            VoteChain
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-midnight-850 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Link
            to="/login?role=voter"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
          >
            Sign In
          </Link>
          <button
            onClick={() => navigate("/register")}
            className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-glow transition hover:from-brand-500 hover:to-violet-500"
          >
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-midnight-850"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="animate-fade-in border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden dark:border-slate-800 dark:bg-midnight-950">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-midnight-850"
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            <Link
              to="/login?role=voter"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2.5 text-center text-sm font-bold text-white"
            >
              Get Started
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
