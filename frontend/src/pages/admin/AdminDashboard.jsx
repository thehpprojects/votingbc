import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../hooks/useWallet";
import {
  startElection,
  endElection,
  withTxToast,
} from "../../services/contract";
import { createElection } from "../../services/factory";
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
  FaCalendarAlt,
  FaLink,
  FaPlusCircle,
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

  const {
    election,
    candidates,
    results,
    loading,
    refresh,
    refreshResults,
    elections,
    selectedElection,
    selectedElectionId,
    selectElection,
    contractAddress,
    loadFactoryElections,
  } = wallet;

  const [confirmAction, setConfirmAction] = useState(null);

  const [showCreateElection, setShowCreateElection] = useState(false);
  const [newElectionName, setNewElectionName] = useState("");
  const [newElectionCategory, setNewElectionCategory] = useState("");
  const [creatingElection, setCreatingElection] = useState(false);

  const isOwner = wallet.isOwner;

  const handleElectionChange = (event) => {
    selectElection(event.target.value);
  };

  const handleCreateElection = async (event) => {
    event.preventDefault();

    if (!wallet.signer) {
      toast.error("Please connect the admin wallet first.");
      return;
    }

    if (!isOwner) {
      toast.error("Only the Factory owner can create an election.");
      return;
    }

    const name = newElectionName.trim();
    const category = newElectionCategory.trim();

    if (!name) {
      toast.error("Please enter an election name.");
      return;
    }

    if (!category) {
      toast.error("Please enter an election category.");
      return;
    }

    setCreatingElection(true);

    try {
      const result = await withTxToast(
        createElection(wallet.signer, name, category),
        {
          loading: "Creating new election...",
          success: "New election created successfully!",
        },
      );

      console.log("NEW ELECTION CREATED:", result);

      const updatedFactoryElections = await loadFactoryElections(
        wallet.provider,
      );

      const createdElection = updatedFactoryElections?.find(
        (item) =>
          item.contractAddress?.toLowerCase() === result.address?.toLowerCase(),
      );

      if (createdElection) {
        selectElection(createdElection.id);
      }

      setNewElectionName("");
      setNewElectionCategory("");
      setShowCreateElection(false);

      toast.success("New election is ready for candidate registration.");
    } catch (error) {
      console.error("CREATE ELECTION ERROR:", error);

      toast.error(
        error?.shortMessage ||
          error?.reason ||
          error?.message ||
          "Failed to create election.",
      );
    } finally {
      setCreatingElection(false);
    }
  };

  const handleStart = async () => {
    if (!wallet.signer) {
      toast.error("Please connect the admin wallet first.");
      return;
    }

    if (!contractAddress) {
      toast.error("No contract address is configured.");
      return;
    }

    try {
      await withTxToast(startElection(wallet.signer, contractAddress), {
        loading: "Starting election...",
        success: "Election started! Voting is now open.",
      });

      setConfirmAction(null);
      await refresh();
      await refreshResults();
    } catch (error) {
      console.error("START ELECTION ERROR:", error);
    }
  };

  const handleEnd = async () => {
    if (!wallet.signer) {
      toast.error("Please connect the admin wallet first.");
      return;
    }

    if (!contractAddress) {
      toast.error("No contract address is configured.");
      return;
    }

    try {
      await withTxToast(endElection(wallet.signer, contractAddress), {
        loading: "Ending election...",
        success: "Election ended. Results are final.",
      });

      setConfirmAction(null);
      await refresh();
      await refreshResults();
    } catch (error) {
      console.error("END ELECTION ERROR:", error);
    }
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage elections on-chain · Signed in as{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {admin?.name}
            </span>
          </p>
        </div>

        <WalletConnectButton wallet={wallet} size="md" />
      </div>

      {/* CREATE ELECTION */}
      <div className="card rounded-2xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaPlusCircle className="h-4 w-4 text-brand-500" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Election Management
              </h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              Create a completely new election with its own smart contract.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateElection((value) => !value)}
            disabled={!wallet.signer || !isOwner}
          >
            <FaPlus className="h-3.5 w-3.5" />
            Create New Election
          </Button>
        </div>

        {showCreateElection && (
          <form
            onSubmit={handleCreateElection}
            className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Election Name
                </label>

                <input
                  type="text"
                  value={newElectionName}
                  onChange={(event) => setNewElectionName(event.target.value)}
                  placeholder="Class Representative Election 2026"
                  disabled={creatingElection}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Category
                </label>

                <input
                  type="text"
                  value={newElectionCategory}
                  onChange={(event) =>
                    setNewElectionCategory(event.target.value)
                  }
                  placeholder="Class Representative"
                  disabled={creatingElection}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={creatingElection}
                onClick={() => {
                  setShowCreateElection(false);
                  setNewElectionName("");
                  setNewElectionCategory("");
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={creatingElection}
              >
                <FaPlus className="h-3.5 w-3.5" />
                {creatingElection ? "Creating..." : "Create Election"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* SELECT ELECTION */}
      <div className="card rounded-2xl p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="h-4 w-4 text-brand-500" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Select Election
              </h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              Select which deployed election contract you want to manage.
            </p>

            {elections.length === 0 ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                No elections are configured.
              </div>
            ) : (
              <select
                value={selectedElectionId || ""}
                onChange={handleElectionChange}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {elections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedElection && (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60 lg:max-w-md">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Selected Election
                </span>

                <Badge tone="default">{selectedElection.category}</Badge>
              </div>

              <p className="mt-2 font-bold text-slate-900 dark:text-white">
                {selectedElection.name}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Year: {selectedElection.year}
              </p>

              <div className="mt-3 flex items-start gap-2">
                <FaLink className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />

                <span className="break-all text-xs text-slate-500 dark:text-slate-400">
                  {contractAddress}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {wallet.account && !isOwner && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-bold">
              Connected wallet is not the contract owner
            </p>

            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Connect the deployer wallet for this election contract.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

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
                margin={{
                  top: 8,
                  right: 8,
                  bottom: 0,
                  left: -12,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fill: "#94a3b8",
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                    fill: "#94a3b8",
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(148,163,184,0.12)",
                  }}
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 13,
                  }}
                  labelStyle={{
                    color: "#cbd5e1",
                    fontWeight: 700,
                  }}
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
        <div className="space-y-6 lg:col-span-1">
          <ElectionStateCard election={election} loading={loading} />

          <div className="card rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Lifecycle Control
            </h3>

            <div className="mt-4 space-y-3">
              <Link to="/admin/candidates">
                <Button
                  variant="secondary"
                  className="w-full"
                  size="sm"
                  disabled={election?.state !== ELECTION_STATE.REGISTRATION}
                >
                  <FaPlus className="h-3.5 w-3.5" />
                  Add Candidate
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
                <FaPlay className="h-3.5 w-3.5" />
                Start Election
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
                <FaStop className="h-3.5 w-3.5" />
                End Election
              </Button>
            </div>
          </div>
        </div>

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
              message="Add candidates during the Registration phase."
              action={
                <Link to="/admin/candidates">
                  <Button variant="outline" size="sm">
                    <FaUserPlus className="h-4 w-4" />
                    Add First Candidate
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

      {confirmAction === "start" && (
        <ConfirmDialog
          title="Start the election?"
          message={`This starts "${selectedElection?.name}" with ${candidates.length} candidates. This action cannot be undone.`}
          confirmText="Start Election"
          confirmVariant="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleStart}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === "end" && (
        <ConfirmDialog
          title="End the election?"
          message={`Voting for "${selectedElection?.name}" will close permanently.`}
          confirmText="End Election"
          confirmVariant="bg-rose-600 hover:bg-rose-700"
          onConfirm={handleEnd}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {/* Gives child admin pages the SAME wallet instance */}
      <Outlet context={wallet} />
    </div>
  );
}
