// ======================================
// VoteChain Election Results
// Shared: Public / Admin / Voter
// ======================================

import { useEffect, useMemo, useState } from "react";
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
  FaChartBar,
  FaChartPie,
  FaClock,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

export default function ResultsPage({ compact = false, wallet = null }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const contractData = useContractData(refreshKey);

  const election = wallet ? wallet.election : contractData.election;

  const candidates = wallet ? wallet.candidates : contractData.candidates;

  const results = wallet ? wallet.results : contractData.results;

  const loading = wallet ? wallet.loading : contractData.loading;
  // ==========================================
  // Auto refresh while election is active
  // ==========================================

  useEffect(() => {
    if (!election?.isActive) return;

    const timer = setInterval(() => {
      setRefreshKey((key) => key + 1);
    }, 15000);

    return () => clearInterval(timer);
  }, [election?.isActive]);

  // ==========================================
  // Basic data
  // ==========================================

  const totalVotes = results?.totalVotesCast ?? 0;

  const leader = results?.hasClearLeader
    ? candidates.find(
        (candidate) =>
          Number(candidate.id) === Number(results.leadingCandidateId),
      )
    : null;

  // ==========================================
  // Chart data
  // ==========================================

  const chartLabels = useMemo(
    () => candidates.map((candidate) => candidate.name),
    [candidates],
  );

  const voteValues = useMemo(
    () => candidates.map((candidate) => Number(candidate.voteCount || 0)),
    [candidates],
  );

  // ==========================================
  // Bar chart
  // ==========================================

  const barChartData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          label: "Votes",
          data: voteValues,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 55,
        },
      ],
    }),
    [chartLabels, voteValues],
  );

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) =>
            ` ${context.raw} vote${context.raw === 1 ? "" : "s"}`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          maxRotation: 0,
          minRotation: 0,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },

        grid: {
          color: "rgba(148, 163, 184, 0.15)",
        },
      },
    },
  };

  // ==========================================
  // Doughnut chart
  // ==========================================

  const doughnutChartData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          label: "Votes",
          data: voteValues,
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    }),
    [chartLabels, voteValues],
  );

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "68%",

    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 18,
          usePointStyle: true,
        },
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const value = Number(context.raw || 0);

            const percentage =
              totalVotes > 0 ? ((value / totalVotes) * 100).toFixed(1) : "0.0";

            return ` ${value} votes (${percentage}%)`;
          },
        },
      },
    },
  };

  // ==========================================
  // Participation
  // ==========================================

  const participationPercent =
    totalVotes > 0 ? Math.min(100, (totalVotes * 100) / 100) : 0;

  return (
    <div className="space-y-8">
      {/* ======================================
          HEADER
      ====================================== */}

      {!compact && (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <FaChartBar />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Election Results
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Transparent results powered directly by the blockchain.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge tone={election?.isActive ? "success" : "default"}>
              {election?.isActive ? "● Live" : "Final"}
            </Badge>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              <FaSync className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Election */}
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Election State
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {election?.stateLabel || "—"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <FaFlagCheckered className="text-slate-500" />
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Candidates
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(candidates.length)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <FaUsers className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Votes */}
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Votes
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(totalVotes)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">
              <FaVoteYea className="text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>

        {/* Leader */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Leading Candidate
              </p>

              <p className="mt-2 truncate text-xl font-bold text-amber-900 dark:text-amber-300">
                {leader?.name || "No leader"}
              </p>
            </div>

            <FaTrophy className="h-7 w-7 shrink-0 text-amber-500" />
          </div>
        </div>
      </div>

      {/* ======================================
          WINNER
      ====================================== */}

      {results?.hasClearLeader && leader && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-white/10" />

          <div className="relative flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <FaTrophy className="h-8 w-8" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-100">
                  Current Leader
                </p>

                <h2 className="mt-1 text-2xl font-extrabold">{leader.name}</h2>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-4xl font-black">
                {formatNumber(Number(leader.voteCount))}
              </p>

              <p className="text-sm text-amber-100">votes received</p>
            </div>
          </div>
        </div>
      )}

      {/* Tie */}
      {results && !results.hasClearLeader && totalVotes > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <FaFlagCheckered className="mr-2 inline" />
          No clear leader yet — candidates are tied.
        </div>
      )}

      {/* ======================================
          CHARTS
      ====================================== */}

      {loading ? (
        <Spinner size="lg" />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={FaUsers}
          title="No candidates registered"
          message="Results will appear here once the admin registers candidates."
        />
      ) : (
        <>
          {/* Chart section */}

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Bar chart */}

            <div className="card rounded-3xl p-6 lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-brand-500" />

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Votes by Candidate
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Number of votes received by each candidate
                  </p>
                </div>
              </div>

              <div className="h-[320px]">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Doughnut */}

            <div className="card rounded-3xl p-6 lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <FaChartPie className="text-violet-500" />

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Vote Distribution
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Percentage share of total votes
                </p>
              </div>

              <div className="relative h-[320px]">
                <Doughnut
                  data={doughnutChartData}
                  options={doughnutChartOptions}
                />

                {/* Center value */}

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {formatNumber(totalVotes)}
                  </span>

                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    TOTAL VOTES
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================
              CANDIDATE CARDS
          ====================================== */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Candidate Breakdown
              </h2>

              <Badge tone={election?.isActive ? "success" : "default"}>
                {election?.isActive ? "Live" : "Final"}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id.toString()}
                  candidate={candidate}
                  variant="results"
                  votesPercent={
                    totalVotes
                      ? (Number(candidate.voteCount) / totalVotes) * 100
                      : 0
                  }
                  isLeader={
                    results?.hasClearLeader &&
                    Number(candidate.id) === Number(results.leadingCandidateId)
                  }
                />
              ))}
            </div>
          </div>

          {/* ======================================
              ELECTION INFORMATION
          ====================================== */}

          {!compact && (
            <div className="card rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-2">
                <FaClock className="text-brand-500" />

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Election Timeline
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Started
                  </p>

                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">
                    {election?.startedAt
                      ? formatTimestamp(election.startedAt)
                      : "Not started"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ended
                  </p>

                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">
                    {election?.endedAt
                      ? formatTimestamp(election.endedAt)
                      : "Not ended"}
                  </p>
                </div>
              </div>

              {/* Participation */}

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Voting activity
                  </span>

                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {formatNumber(totalVotes)} votes
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-700"
                    style={{
                      width: `${participationPercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================
          FOOTER
      ====================================== */}

      {!compact && (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <FaVoteYea className="text-brand-500" />
          Results are read directly from the VotingSystem contract on Polygon
          Amoy. Vote counts cannot be modified after being recorded.
        </div>
      )}
    </div>
  );
}
