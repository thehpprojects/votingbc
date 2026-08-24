// ======================================
// VoteChain Admin - Registered Voters (lookup)
// ======================================

import { useState } from "react";
import toast from "react-hot-toast";
import { getVoterVerificationStatus, getVoterVotingStatus } from "../../services/api";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { FaSearch, FaUserTie, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaVoteYea } from "react-icons/fa";

/**
 * The backend exposes voter records only through per-ID endpoints
 * (GET /api/voter/status/:id and /api/voter/voted/:id), so admins can
 * look up a voter's verification & voting status by their registration ID.
 */
export default function AdminVoters() {
  const [voterId, setVoterId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!voterId.trim()) {
      toast.error("Enter the voter's registration ID.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const [statusRes, votedRes] = await Promise.all([
        getVoterVerificationStatus(voterId.trim()),
        getVoterVotingStatus(voterId.trim()),
      ]);
      setResult({
        verified: statusRes.data?.verified,
        hasVoted: votedRes.data?.hasVoted,
      });
      toast.success("Voter record found.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Voter not found. Check the ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Registered Voters</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Verify a voter's OTP verification and voting status.
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="card rounded-2xl p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Voter Registration ID"
              placeholder="e.g. 64f2ab9c1d2e3f4a5b6c7d8e"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              helper="The ID returned after voter registration."
            />
          </div>
          <Button type="submit" loading={loading} className="sm:w-auto">
            <FaSearch className="h-4 w-4" /> Lookup Voter
          </Button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div className="card animate-fade-in rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <FaUserTie className="text-brand-500" /> Voter Status
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                OTP Verification
              </p>
              <div className="mt-2">
                {result.verified ? (
                  <Badge tone="success">
                    <FaCheckCircle className="mr-1 inline" /> Verified
                  </Badge>
                ) : (
                  <Badge tone="warning">
                    <FaTimesCircle className="mr-1 inline" /> Not Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Voting Status
              </p>
              <div className="mt-2">
                {result.hasVoted ? (
                  <Badge tone="brand">
                    <FaVoteYea className="mr-1 inline" /> Has Voted
                  </Badge>
                ) : (
                  <Badge tone="default">Has Not Voted</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <EmptyState
          icon={FaUserTie}
          title="No voter selected"
          message="Enter a voter's registration ID above to see their verification and voting status."
        />
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
        <FaInfoCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sky-700 dark:text-sky-400">
          The backend does not expose a voter list endpoint — voter records are
          queried individually by registration ID for privacy and security.
        </p>
      </div>
    </div>
  );
}