// ======================================
// VoteChain Admin Dashboard
// ======================================

import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../hooks/useWallet";
import {
  startElection,
  endElection,
  withTxToast,
} from "../../services/contract";
import { ELECTION_STATE } from "../../utils/constants";
import { formatNumber } from "../../utils/format";
import StatCard from "../../components/common/StatCard";
import ElectionStateCard from "../../components/common/ElectionStateCard";
import CandidateCard from "../../components/candidate/CandidateCard";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import WalletConnectButton from "../../components/common/WalletConnectButton";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Badge from "../../components/common/Badge";
import {
  FaUsers,
  FaVoteYea,
  FaHourglassHalf,
  FaPlay,
  FaStop,
  FaUserPlus,
  FaFlagCheckered,
  FaPlus,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
];

export default function AdminDashboard() {
  const { admin } = useAuth();
  const wallet = useWallet();
  const { election, candidates, results, loading, refresh, refreshResults } =
    wallet;
  const [confirmAction, setConfirmAction] = useState(null); // "start" | "end"

  const isOwner = wallet.isOwner;
  6;
  const handleStart = async () => {
    if (!wallet.signer) return;
    await withTxToast(startElection(wallet.signer), {
      loading: "Starting election...",
      success: "Election started! Voting is now open.",
    });
    refresh();
    refreshResults();
  };

  const handleEnd = async () => {
    if (!wallet.signer) return;
    await withTxToast(endElection(wallet.signer), {
      loading: "Ending election...",
      success: "Election ended. Results are final.",
    });
    refresh();
    refreshResults();
  };

  const leader =
    results && results.hasClearLeader
      ? results.candidates.find(
          (c) => Number(c.id) === results.leadingCandidateId,
        )
      : null;

  const stats = [
    {
      icon: FaHourglassHalf,
      label: "Election State",
      value: loading ? "..." : election?.stateLabel || "—",
      tone: "brand",
    },
    {
      icon: FaUsers,
      label: "Candidates",
      value: loading ? "..." : formatNumber(candidates.length),
    },
    {
      icon: FaVoteYea,
      label: "Votes Cast",
      value: loading ? "..." : formatNumber(election?.votesCast ?? 0),
    },
    {
      icon: FaFlagCheckered,
      label: "Leader",
      value: leader ? leader.name : "—",
      tone: "emerald",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage the election on-chain · Signed in as{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {admin?.name}
            </span>
          </p>
        </div>
        <WalletConnectButton wallet={wallet} size="md" />
      </div>

      {/* Owner wallet warning */}
      {wallet.account && !isOwner && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">
              Connected wallet is not the contract owner
            </p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Only the owner wallet can add candidates, start or end the
              election. Connect the deployer wallet to enable management
              actions.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Vote breakdown chart */}
      {candidates.length > 0 && (
        <div className="card rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Vote Breakdown
            </h2>
            <Badge tone={election?.isActive ? "success" : "default"}>
              {election?.isActive ? "Live" : "Final"}
            </Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={candidates.map((c) => ({
                  name: c.name,
                  votes: Number(c.voteCount),
                }))}
                margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.12)" }}
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 13,
                  }}
                  labelStyle={{ color: "#cbd5e1", fontWeight: 700 }}
                  formatter={(v) => [`${v} votes`, "Votes"]}
                />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                  {candidates.map((c, i) => (
                    <Cell
                      key={c.id.toString()}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Election state + controls */}
        <div className="space-y-6 lg:col-span-1">
          <ElectionStateCard election={election} loading={loading} />

          <div className="card rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Lifecycle Control
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              Owner-only actions executed by the connected MetaMask wallet.
            </p>

            <div className="mt-4 space-y-3">
              <Link to="/admin/candidates">
                <Button
                  variant="secondary"
                  className="w-full"
                  size="sm"
                  disabled={election?.state !== ELECTION_STATE.REGISTRATION}
                >
                  <FaPlus className="h-3.5 w-3.5" /> Add Candidate
                </Button>
              </Link>
              <Button
                variant="success"
                className="w-full"
                size="sm"
                disabled={
                  election?.state !== ELECTION_STATE.REGISTRATION ||
                  candidates.length === 0 ||
                  !wallet.signer ||
                  !isOwner
                }
                onClick={() => setConfirmAction("start")}
              >
                <FaPlay className="h-3.5 w-3.5" /> Start Election
              </Button>
              <Button
                variant="danger"
                className="w-full"
                size="sm"
                disabled={
                  election?.state !== ELECTION_STATE.ACTIVE ||
                  !wallet.signer ||
                  !isOwner
                }
                onClick={() => setConfirmAction("end")}
              >
                <FaStop className="h-3.5 w-3.5" /> End Election
              </Button>
            </div>
          </div>
        </div>

        {/* Candidates preview */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Registered Candidates
            </h2>
            <Link
              to="/admin/candidates"
              className="text-sm font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              Manage all →
            </Link>
          </div>

          {loading ? (
            <Spinner />
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={FaUsers}
              title="No candidates yet"
              message="Add candidates during the Registration phase. Candidates are stored immutably on-chain."
              action={
                <Link to="/admin/candidates">
                  <Button variant="outline" size="sm">
                    <FaUserPlus className="h-4 w-4" /> Add First Candidate
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {candidates.slice(0, 4).map((c) => (
                <CandidateCard
                  key={c.id.toString()}
                  candidate={c}
                  variant="view"
                  isLeader={
                    results?.hasClearLeader &&
                    Number(c.id) === results.leadingCandidateId
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialogs */}
      {confirmAction === "start" && (
        <ConfirmDialog
          title="Start the election?"
          message={`This starts the election with ${candidates.length} candidates. Voting will be open to all connected wallets. This action cannot be undone.`}
          confirmText="Start Election"
          confirmVariant="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleStart}
          onClose={() => setConfirmAction(null)}
        />
      )}
      {confirmAction === "end" && (
        <ConfirmDialog
          title="End the election?"
          message="Voting will close permanently. Results will be final and can never be changed."
          confirmText="End Election"
          confirmVariant="bg-rose-600 hover:bg-rose-700"
          onConfirm={handleEnd}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
