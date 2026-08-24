// ======================================
// Theme Toggle (Sun / Moon)
// ======================================

import { useTheme } from "../../context/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 ${
        dark
          ? "border-slate-700 bg-midnight-850 text-amber-300 hover:border-amber-400/50 hover:shadow-glow"
          : "border-slate-200 bg-white text-brand-600 shadow-sm hover:border-brand-300 hover:shadow-glow"
      } ${className}`}
    >
      {dark ? <FaSun className="h-4 w-4" /> : <FaMoon className="h-4 w-4" />}
    </button>
  );
}
