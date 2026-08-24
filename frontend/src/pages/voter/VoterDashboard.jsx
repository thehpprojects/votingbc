// ======================================
// VoteChain Voter Dashboard
// ======================================

import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { formatNumber } from "../../utils/format";
import StatCard from "../../components/common/StatCard";
import ElectionStateCard from "../../components/common/ElectionStateCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaVoteYea,
  FaWallet,
  FaUsers,
  FaHourglassHalf,
  FaLink,
  FaArrowRight,
} from "react-icons/fa";

export default function VoterDashboard() {
  const { voter, refreshVoterStatus } = useAuth();
  const { wallet } = useOutletContext();
  const { election, candidates, loading } = wallet;

  // Refresh voter status from backend on mount
  useEffect(() => {
    refreshVoterStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verified = voter?.isVerified;

  const steps = [
    {
      done: !!voter,
      current: !voter,
      title: "Register",
      desc: "Account created",
    },
    {
      done: verified,
      current: !!voter && !verified,
      title: "Verify OTP",
      desc: "Identity confirmed",
    },
    {
      done: !!wallet.account,
      current: verified && !wallet.account,
      title: "Connect Wallet",
      desc: "MetaMask linked",
    },
    {
      done: wallet.hasVoted,
      current: verified && !!wallet.account && !wallet.hasVoted,
      title: "Cast Vote",
      desc: "Vote on-chain",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome, {voter?.name || "Voter"}!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Voter ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{voter?.voterIdNumber}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {verified ? (
            <Badge tone="success"><FaCheckCircle className="mr-1 inline" /> Verified</Badge>
          ) : (
            <Badge tone="warning"><FaTimesCircle className="mr-1 inline" /> Not Verified</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FaHourglassHalf}
          label="Election State"
          value={loading ? "..." : election?.stateLabel || "—"}
        />
        <StatCard icon={FaUsers} label="Candidates" value={formatNumber(candidates.length)} tone="violet" />
        <StatCard
          icon={FaVoteYea}
          label="Votes Cast"
          value={loading ? "..." : formatNumber(election?.votesCast ?? 0)}
          tone="emerald"
        />
        <StatCard
          icon={FaWallet}
          label="My Wallet"
          value={wallet.account ? "Connected" : "Not Connected"}
          tone={wallet.account ? "success" : "amber"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress steps */}
        <div className="lg:col-span-2">
          <div className="card card-hover rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Voting Journey</h2>
            <div className="mt-6 space-y-0">
              {steps.map((s, i) => (
                <div key={s.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                        s.done
                          ? "bg-emerald-500 text-white shadow-glow-emerald"
                          : s.current
                            ? "bg-gradient-to-br from-brand-600 to-violet-600 text-white ring-4 ring-brand-500/20"
                            : "bg-slate-100 text-slate-400 dark:bg-midnight-850 dark:text-slate-500"
                      }`}
                    >
                      {s.done ? <FaCheckCircle className="h-5 w-5" /> : i + 1}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 flex-1 ${s.done ? "bg-emerald-400" : "bg-slate-200 dark:bg-midnight-850"}`} />
                    )}
                  </div>
                  <div className={`pb-8 ${s.done ? "" : "opacity-90"}`}>
                    <p className="font-bold text-slate-900 dark:text-white">{s.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
                    {s.current && (
                      <div className="mt-2">
                        {s.title === "Verify OTP" && (
                          <Link to="/verify-otp">
                            <Button size="sm">
                              <FaLink className="h-3.5 w-3.5" /> Verify Now
                            </Button>
                          </Link>
                        )}
                        {s.title === "Connect Wallet" && (
                          <Button size="sm" onClick={() => wallet.connect()} loading={wallet.connecting}>
                            <FaWallet className="h-3.5 w-3.5" /> Connect MetaMask
                          </Button>
                        )}
                        {s.title === "Cast Vote" && (
                          <Link to="/voter/vote">
                            <Button size="sm">
                              <FaVoteYea className="h-3.5 w-3.5" /> Go to Voting
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <ElectionStateCard election={election} loading={loading} />

          <div className="card rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Quick Actions
            </h3>
            <div className="mt-4 space-y-3">
              <Link to="/voter/candidates" className="block">
                <Button variant="secondary" className="w-full">
                  View Candidates
                </Button>
              </Link>
              <Link to="/voter/vote" className="block">
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!verified || !wallet.account || wallet.hasVoted || !election?.isActive}
                >
                  Cast My Vote <FaArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/voter/results" className="block">
                <Button variant="outline" className="w-full">
                  View Results
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}