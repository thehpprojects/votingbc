// ======================================
// VoteChain Election Results (shared: public / admin / voter)
// ======================================

import { useEffect, useState } from "react";
import { useContractData } from "../hooks/useContractData";
import { formatNumber, formatTimestamp } from "../utils/format";
import CandidateCard from "../components/candidate/CandidateCard";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import {
  FaFlagCheckered,
  FaVoteYea,
  FaUsers,
  FaTrophy,
  FaSync,
} from "react-icons/fa";

/**
 * Displays live on-chain results: per-candidate vote bars, total votes,
 * and the winning candidate when a clear leader exists.
 */
export default function ResultsPage({ compact = false }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { election, candidates, results, loading } = useContractData(refreshKey);

  // Auto-refresh every 15 seconds while the election is active
  useEffect(() => {
    if (!election?.isActive) return;
    const t = setInterval(() => setRefreshKey((k) => k + 1), 15000);
    return () => clearInterval(t);
  }, [election?.isActive]);

  const totalVotes = results?.totalVotesCast ?? 0;
  const leader =
    results?.hasClearLeader
      ? candidates.find((c) => Number(c.id) === results.leadingCandidateId)
      : null;

  const participationPercent =
    results && results.totalVotesCast > 0 ? Math.min(100, results.totalVotesCast * 100 / Math.max(1, 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Election Results</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live results straight from the blockchain — fully transparent and
              verifiable on PolygonScan.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
            <FaSync className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card rounded-2xl p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Election State</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {election?.stateLabel || "—"}
          </p>
        </div>
        <div className="card rounded-2xl p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Candidates</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatNumber(candidates.length)}
          </p>
        </div>
        <div className="card rounded-2xl p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Votes</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(totalVotes)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Leading Candidate</p>
          <p className="mt-1 truncate text-2xl font-bold text-emerald-900 dark:text-emerald-300">
            {leader ? (
              <>
                <FaTrophy className="mr-1 inline h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                {leader.name}
              </>
            ) : (
              "—"
            )}
          </p>
        </div>
      </div>

      {/* Winner banner */}
      {results?.hasClearLeader && leader && (
        <div className="animate-fade-in flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white shadow-lg sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <FaTrophy className="h-9 w-9" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-100">
                Current Winner
              </p>
              <p className="text-xl font-extrabold">{leader.name}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-3xl font-extrabold">{formatNumber(Number(leader.voteCount))}</p>
            <p className="text-xs text-amber-100">votes</p>
          </div>
        </div>
      )}

      {results && !results.hasClearLeader && totalVotes > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <FaFlagCheckered className="mr-1 inline" /> No clear leader yet — there is
          a tie or no votes have been cast.
        </div>
      )}

      {/* Candidate results */}
      {loading ? (
        <Spinner size="lg" />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={FaUsers}
          title="No candidates registered"
          message="Results will appear here once the admin registers candidates."
        />
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vote Breakdown</h2>
            <Badge tone={election?.isActive ? "success" : "default"}>
              {election?.isActive ? "Live" : "Final"}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c) => (
              <CandidateCard
                key={c.id.toString()}
                candidate={c}
                variant="results"
                votesPercent={totalVotes ? (Number(c.voteCount) / totalVotes) * 100 : 0}
                isLeader={results?.hasClearLeader && Number(c.id) === results.leadingCandidateId}
              />
            ))}
          </div>

          {!compact && (
            <div className="card mt-6 grid gap-4 rounded-2xl p-6 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Started</p>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  {election?.startedAt ? formatTimestamp(election.startedAt) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Ended</p>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  {election?.endedAt ? formatTimestamp(election.endedAt) : "—"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">Votes vs. registered voters (estimate)</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {totalVotes} / 100 ({participationPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-midnight-850">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${participationPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!compact && (
        <p className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <FaVoteYea className="text-brand-500" />
          Results are read directly from the VotingSystem contract on Polygon Amoy
          testnet. Vote counts can never be modified.
        </p>
      )}
    </div>
  );
}