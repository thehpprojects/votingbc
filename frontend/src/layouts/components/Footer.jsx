// ======================================
// VoteChain Footer
// ======================================

import { Link } from "react-router-dom";
import { FaShieldAlt, FaLock, FaVoteYea, FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import Logo from "../../components/common/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white dark:border-slate-800 dark:bg-midnight-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex">
              <Logo />
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              VoteChain is a decentralized blockchain e-voting platform. Every
              vote is recorded immutably on Polygon — secure, transparent and
              verifiable by anyone.
            </p>
            <div className="mt-5 flex gap-2">
              {[FaTwitter, FaGithub, FaLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/" className="transition hover:text-brand-600 dark:hover:text-brand-400">Home</Link></li>
              <li><Link to="/about" className="transition hover:text-brand-600 dark:hover:text-brand-400">How It Works</Link></li>
              <li><Link to="/results" className="transition hover:text-brand-600 dark:hover:text-brand-400">Live Results</Link></li>
              <li><Link to="/register" className="transition hover:text-brand-600 dark:hover:text-brand-400">Register to Vote</Link></li>
              <li><Link to="/login?role=voter" className="transition hover:text-brand-600 dark:hover:text-brand-400">Voter Login</Link></li>
              <li><Link to="/login?role=admin" className="transition hover:text-brand-600 dark:hover:text-brand-400">Admin Login</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Trust & Security
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <FaShieldAlt className="h-3.5 w-3.5 text-brand-500" /> OTP Identity Verification
              </li>
              <li className="flex items-center gap-2">
                <FaLock className="h-3.5 w-3.5 text-brand-500" /> One Wallet — One Vote
              </li>
              <li className="flex items-center gap-2">
                <FaVoteYea className="h-3.5 w-3.5 text-brand-500" /> On-chain Vote Recording
              </li>
            </ul>
            <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-xs leading-relaxed text-slate-600 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-slate-300">
              <p className="font-semibold text-brand-700 dark:text-brand-300">
                Powered by Polygon
              </p>
              <p className="mt-1.5">
                Transactions are settled on the Polygon Amoy testnet and can be
                verified publicly on PolygonScan.
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              System Status
            </h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Blockchain RPC</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Voting Contract</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Deployed
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">API Services</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Online
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} VoteChain · Decentralized Blockchain E-Voting System</p>
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure · Transparent · Immutable
          </p>
        </div>
      </div>
    </footer>
  );
}
