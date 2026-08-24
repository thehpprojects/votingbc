// ======================================
// Candidate Card
// ======================================

import { FaUser, FaVoteYea, FaLink, FaCheckCircle } from "react-icons/fa";
import { formatVotes } from "../../utils/format";
import { IPFS_GATEWAY } from "../../utils/constants";
import Badge from "../common/Badge";

/**
 * Displays a single candidate from the blockchain.
 * `variant`: "view" (read-only) | "select" (voting page) | "results" (with votes bar)
 */
export default function CandidateCard({
  candidate,
  variant = "view",
  selected = false,
  onSelect,
  votesPercent = 0,
  isLeader = false,
  disabled = false,
}) {
  const { id, name, ipfsCid, voteCount } = candidate;
  const count = Number(voteCount);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:bg-midnight-900 ${
        selected
          ? "border-brand-500 ring-4 ring-brand-500/25 shadow-glow dark:border-brand-400"
          : "border-slate-200/80 hover:border-brand-300/60 dark:border-slate-800 dark:hover:border-brand-500/40"
      } ${variant === "select" ? "cursor-pointer" : ""}`}
      onClick={variant === "select" && !disabled ? () => onSelect?.(id) : undefined}
      role={variant === "select" ? "button" : undefined}
    >
      {/* Selected glow backdrop */}
      {selected && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/10 to-violet-500/10" />
      )}

      {isLeader && (
        <div className="absolute -top-3 left-4 z-10">
          <Badge tone="success">
            <FaCheckCircle className="mr-1 inline" /> Leading
          </Badge>
        </div>
      )}

      {/* Avatar */}
      <div className="relative flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md shadow-brand-500/30">
          <FaUser className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-bold text-slate-900 dark:text-white">
            {name}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            ID #{id} · {formatVotes(count)}
          </p>
        </div>
        {/* Select check */}
        {variant === "select" && selected && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-glow">
            <FaCheckCircle className="h-4 w-4" />
          </span>
        )}
      </div>

      {/* IPFS metadata link */}
      {ipfsCid && (
        <a
          href={`${IPFS_GATEWAY}${ipfsCid}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          onClick={(e) => e.stopPropagation()}
          title="Open candidate metadata on IPFS"
        >
          <FaLink className="h-3 w-3" /> View metadata ({ipfsCid.slice(0, 10)}...)
        </a>
      )}

      {/* Results progress bar */}
      {variant === "results" && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatVotes(count)}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              {votesPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isLeader
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : "bg-gradient-to-r from-brand-400 to-violet-600"
              }`}
              style={{ width: `${votesPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Select indicator for voting page */}
      {variant === "select" && selected && (
        <div className="relative mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
          <FaVoteYea className="h-3.5 w-3.5" /> Selected for voting
        </div>
      )}
    </div>
  );
}
