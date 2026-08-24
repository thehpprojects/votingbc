// ======================================
// VoteChain Admin - Candidate Management
// ======================================

import { useState } from "react";
import toast from "react-hot-toast";
import { useWallet } from "../../hooks/useWallet";
import { addCandidate, withTxToast } from "../../services/contract";
import { ELECTION_STATE } from "../../utils/constants";
import { isValidCid, isRequired } from "../../utils/validators";
import CandidateCard from "../../components/candidate/CandidateCard";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { Input, Textarea } from "../../components/common/Input";
import WalletConnectButton from "../../components/common/WalletConnectButton";
import { FaUsers, FaPlus, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

export default function AdminCandidates() {
  const wallet = useWallet();
  const { election, candidates, results, loading, refresh, refreshResults } = wallet;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", ipfsCid: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const canAdd = election?.state === ELECTION_STATE.REGISTRATION;
  const isOwner =
    !!wallet.account &&
    wallet.account.toLowerCase() === (wallet.ownerAddress || "").toLowerCase();

  const openForm = () => {
    setShowForm(true);
    if (wallet.account && !isOwner) {
      toast.error("Connected wallet is not the contract owner.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isRequired(form.name)) errs.name = "Candidate name is required";
    if (!isValidCid(form.ipfsCid)) errs.ipfsCid = "Enter a valid IPFS CID (metadata link)";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await withTxToast(addCandidate(wallet.signer, form.name.trim(), form.ipfsCid.trim()), {
        loading: "Registering candidate on-chain...",
        success: `Candidate "${form.name.trim()}" added successfully!`,
      });
      setForm({ name: "", ipfsCid: "" });
      setShowForm(false);
      refresh();
      refreshResults();
    } catch {
      // error toast handled by withTxToast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Candidate Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Candidates live on-chain. Add them during the Registration phase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WalletConnectButton wallet={wallet} size="sm" />
          {canAdd && (
            <Button onClick={openForm} disabled={!wallet.signer || !isOwner}>
              <FaPlus className="h-4 w-4" /> Add Candidate
            </Button>
          )}
        </div>
      </div>

      {/* Phase notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
        <FaInfoCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-bold">
            Current phase: {election?.stateLabel || "Loading..."}
          </p>
          <p className="mt-0.5 text-sky-700 dark:text-sky-400">
            {canAdd
              ? "Candidates can be added. Once the election starts, the candidate list is locked forever."
              : election?.stateLabel === "Active"
                ? "Election is active — the candidate list is locked. No changes are allowed."
                : "Election has ended — candidates and votes are immutable."}
          </p>
        </div>
      </div>

      {/* Immutability note */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-bold">On-chain immutability</p>
          <p className="mt-0.5 text-amber-700 dark:text-amber-400">
            The VotingSystem contract has no edit or delete functions by design —
            recorded votes and candidates can never be altered. Make sure names and
            CIDs are correct before submitting.
          </p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in card rounded-2xl border-brand-300/40 p-6 dark:border-brand-500/30"
          noValidate
        >
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <FaPlus className="text-brand-600 dark:text-brand-400" /> Register New Candidate
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Candidate Name *"
              name="name"
              placeholder="e.g. Aarav Mehta"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="IPFS CID *"
              name="ipfsCid"
              placeholder="e.g. QmX8c..."
              value={form.ipfsCid}
              onChange={handleChange}
              error={errors.ipfsCid}
              helper="CID of the candidate's off-chain profile (photo, bio, manifesto)"
            />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit on Blockchain
            </Button>
          </div>
        </form>
      )}

      {/* Candidate list */}
      {loading ? (
        <Spinner />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={FaUsers}
          title="No candidates registered"
          message="Add candidates during the Registration phase to get started."
          action={
            canAdd ? (
              <Button onClick={openForm} disabled={!wallet.signer || !isOwner}>
                <FaPlus className="h-4 w-4" /> Add First Candidate
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Candidates ({candidates.length})
            </h2>
            <Badge tone="info">Stored on Polygon Amoy</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c) => (
              <CandidateCard
                key={c.id.toString()}
                candidate={c}
                variant="results"
                votesPercent={
                  results?.totalVotesCast
                    ? (Number(c.voteCount) / results.totalVotesCast) * 100
                    : 0
                }
                isLeader={
                  results?.hasClearLeader &&
                  Number(c.id) === results.leadingCandidateId
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}