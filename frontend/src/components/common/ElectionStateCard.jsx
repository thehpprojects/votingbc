// ======================================
// VoteChain Election State Card
// ======================================

import Badge from "./Badge";
import { formatTimestamp, formatNumber } from "../../utils/format";
import { FaClock, FaUsers, FaVoteYea, FaHourglassHalf } from "react-icons/fa";

/**
 * Shows the current on-chain election lifecycle information.
 */
export default function ElectionStateCard({ election, loading = false }) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-midnight-900">
        <div className="h-4 w-32 rounded bg-slate-100 dark:bg-midnight-850" />
        <div className="mt-3 h-6 w-48 rounded bg-slate-100 dark:bg-midnight-850" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-10 rounded bg-slate-100 dark:bg-midnight-850" />
          <div className="h-10 rounded bg-slate-100 dark:bg-midnight-850" />
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="card rounded-2xl p-6 text-sm">
        Election data unavailable. Is the RPC reachable?
      </div>
    );
  }

  const stats = [
    { icon: FaHourglassHalf, label: "State", value: election.stateLabel, tone: "text-sky-600 dark:text-sky-400" },
    { icon: FaUsers, label: "Candidates", value: formatNumber(election.candidateCount), tone: "text-brand-600 dark:text-brand-400" },
    { icon: FaVoteYea, label: "Votes Cast", value: formatNumber(election.votesCast), tone: "text-emerald-600 dark:text-emerald-400" },
    { icon: FaClock, label: "Started", value: election.startedAt ? formatTimestamp(election.startedAt) : "Not started", tone: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Election Status
        </h3>
        <Badge tone={election.isActive ? "success" : election.stateLabel === "Ended" ? "danger" : "info"}>
          {election.stateLabel}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-start gap-3">
            <s.icon className={`mt-0.5 h-4 w-4 ${s.tone}`} />
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">{s.label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {election.endedAt > 0 && (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          Ended: {formatTimestamp(election.endedAt)}
        </p>
      )}
    </div>
  );
}