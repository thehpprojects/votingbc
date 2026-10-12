// ======================================
// VoteChain Admin - Election Control (Create / Start / End)
// ======================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import {
  startElection,
  endElection,
  withTxToast,
} from "../../services/contract";
import { ELECTION_STATE } from "../../utils/constants";
import { formatTimestamp, formatNumber } from "../../utils/format";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import WalletConnectButton from "../../components/common/WalletConnectButton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  FaPlay,
  FaStop,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaVoteYea,
  FaFlagCheckered,
  FaExclamationTriangle,
} from "react-icons/fa";

/**
 * The election lifecycle is managed entirely by the smart contract:
 * Registration (add candidates) → Active (voting) → Ended (final results).
 */
export default function AdminElection() {
  const wallet = useWallet();
  const { election, candidates, refresh, refreshResults } = wallet;
  const [confirmAction, setConfirmAction] = useState(null);

  const isOwner =
    !!wallet.account &&
    wallet.account.toLowerCase() === (wallet.ownerAddress || "").toLowerCase();

  const state = election?.state;

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

  // Steps shown as a vertical timeline
  const steps = [
    {
      icon: FaPlus,
      title: "Registration",
      desc: "Add all candidates with their IPFS metadata CIDs.",
      state:
        state === ELECTION_STATE.REGISTRATION
          ? "current"
          : state > ELECTION_STATE.REGISTRATION
            ? "done"
            : "pending",
      count: `${formatNumber(candidates.length)} candidates`,
    },
    {
      icon: FaVoteYea,
      title: "Active",
      desc: "Voting opens. Each wallet can vote exactly once.",
      state:
        state === ELECTION_STATE.ACTIVE
          ? "current"
          : state > ELECTION_STATE.ACTIVE
            ? "done"
            : "pending",
      count: election?.startedAt
        ? `Started ${formatTimestamp(election.startedAt)}`
        : "Not started yet",
    },
    {
      icon: FaFlagCheckered,
      title: "Ended",
      desc: "Voting closes permanently. Results become final.",
      state: state === ELECTION_STATE.ENDED ? "current" : "pending",
      count: election?.endedAt
        ? `Ended ${formatTimestamp(election.endedAt)}`
        : "Not ended yet",
    },
  ];

  const stepDot = (s) => {
    if (s === "done")
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-glow-emerald">
          <FaCheckCircle className="h-5 w-5" />
        </span>
      );
    if (s === "current")
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-white ring-4 ring-brand-500/20">
          <FaClock className="h-4 w-4" />
        </span>
      );
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-midnight-850 dark:text-slate-500">
        <FaClock className="h-4 w-4" />
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Election Control
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, start and end the election — all executed on the blockchain.
          </p>
        </div>
        <WalletConnectButton wallet={wallet} size="md" />
      </div>

      {/* Owner check */}
      {wallet.account && !isOwner && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Not the contract owner</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Lifecycle actions require the deployer wallet. Connect it to
              proceed.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <div className="card rounded-2xl p-6">
          <h2 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
            Election Lifecycle
          </h2>
          <Badge
            tone={
              election?.isActive
                ? "success"
                : state === ELECTION_STATE.ENDED
                  ? "danger"
                  : "info"
            }
          >
            Current: {election?.stateLabel || "Loading..."}
          </Badge>

          <div className="mt-6 space-y-0">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {stepDot(s.state)}
                  {i < steps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 ${
                        s.state === "done"
                          ? "bg-emerald-400"
                          : "bg-slate-200 dark:bg-midnight-850"
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`pb-8 ${s.state === "pending" ? "opacity-50" : ""}`}
                >
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {s.desc}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {s.count}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 dark:bg-midnight-850 dark:text-slate-400">
            <FaUsers className="mr-1 inline text-brand-500" />
            Total votes cast so far:{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatNumber(election?.votesCast ?? 0)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="card rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Actions
            </h2>
            <div className="mt-4 space-y-3">
              {state === ELECTION_STATE.REGISTRATION && (
                <Link to="/admin/candidates">
                  <Button variant="secondary" className="w-full" size="md">
                    <FaPlus className="h-4 w-4" /> Add Candidates (
                    {candidates.length})
                  </Button>
                </Link>
              )}
              <Button
                variant="success"
                className="w-full"
                size="lg"
                disabled={
                  state !== ELECTION_STATE.REGISTRATION ||
                  candidates.length === 0 ||
                  !wallet.signer ||
                  !isOwner
                }
                onClick={() => setConfirmAction("start")}
              >
                <FaPlay className="h-5 w-5" /> Start Election
              </Button>
              <Button
                variant="danger"
                className="w-full"
                size="lg"
                disabled={
                  state !== ELECTION_STATE.ACTIVE || !wallet.signer || !isOwner
                }
                onClick={() => setConfirmAction("end")}
              >
                <FaStop className="h-5 w-5" /> End Election
              </Button>
            </div>

            {state === ELECTION_STATE.REGISTRATION &&
              candidates.length === 0 && (
                <p className="mt-3 text-center text-xs text-amber-600 dark:text-amber-400">
                  Add at least one candidate before starting the election.
                </p>
              )}
          </div>

          <div className="card rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Key Information
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">
                  Election started
                </dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  {election?.startedAt
                    ? formatTimestamp(election.startedAt)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">
                  Election ended
                </dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  {election?.endedAt ? formatTimestamp(election.endedAt) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">
                  Candidates
                </dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatNumber(election?.candidateCount ?? 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">
                  Votes cast
                </dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatNumber(election?.votesCast ?? 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">
                  Contract owner
                </dt>
                <dd className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                  {wallet.ownerAddress || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {confirmAction === "start" && (
        <ConfirmDialog
          title="Start the election?"
          message={`The election will open for voting with ${candidates.length} candidates. This cannot be undone.`}
          confirmText="Start Election"
          confirmVariant="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleStart}
          onClose={() => setConfirmAction(null)}
        />
      )}
      {confirmAction === "end" && (
        <ConfirmDialog
          title="End the election?"
          message="Voting will close permanently and results become final. This cannot be undone."
          confirmText="End Election"
          confirmVariant="bg-rose-600 hover:bg-rose-700"
          onConfirm={handleEnd}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
