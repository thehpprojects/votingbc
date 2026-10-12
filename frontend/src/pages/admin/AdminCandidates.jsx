// ======================================
// VoteChain Admin - Candidate Management
// ======================================

import { useState } from "react";
import toast from "react-hot-toast";
import { useWallet } from "../../hooks/useWallet";
import { addCandidate, withTxToast } from "../../services/contract";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../services/ipfs";
import { ELECTION_STATE } from "../../utils/constants";
import { isRequired } from "../../utils/validators";
import CandidateCard from "../../components/candidate/CandidateCard";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { Input, Textarea } from "../../components/common/Input";
import WalletConnectButton from "../../components/common/WalletConnectButton";
import {
  FaUsers,
  FaPlus,
  FaInfoCircle,
  FaExclamationTriangle,
  FaImage,
} from "react-icons/fa";

export default function AdminCandidates() {
  const wallet = useWallet();

  const { election, candidates, results, loading, refresh, refreshResults } =
    wallet;

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    info: "",
    imageFile: null,
  });

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setForm({
      ...form,
      imageFile: file,
    });

    if (errors.imageFile) {
      setErrors({
        ...errors,
        imageFile: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};

    if (!isRequired(form.name)) {
      errs.name = "Candidate name is required";
    }

    if (!form.imageFile) {
      errs.imageFile = "Candidate photo is required";
    }

    setErrors(errs);

    if (Object.keys(errs).length) {
      return;
    }

    if (!wallet.signer) {
      toast.error("Please connect the admin wallet first.");
      return;
    }

    if (!isOwner) {
      toast.error("Connected wallet is not the contract owner.");
      return;
    }

    setSubmitting(true);

    try {
      // ==========================================
      // STEP 1: Upload candidate image to IPFS
      // ==========================================

      toast.loading("Uploading candidate photo to IPFS...", {
        id: "ipfs-upload",
      });

      const imageCid = await uploadFileToIPFS(form.imageFile);

      // ==========================================
      // STEP 2: Create candidate metadata
      // ==========================================

      const metadata = {
        name: form.name.trim(),
        info: form.info.trim(),
        imageCid: imageCid,
        createdAt: new Date().toISOString(),
      };

      // ==========================================
      // STEP 3: Upload metadata JSON to IPFS
      // ==========================================

      toast.loading("Uploading candidate metadata to IPFS...", {
        id: "ipfs-upload",
      });

      const metadataCid = await uploadJSONToIPFS(metadata);

      toast.success("IPFS upload completed!", {
        id: "ipfs-upload",
      });

      // ==========================================
      // STEP 4: Store metadata CID on blockchain
      // ==========================================
      await withTxToast(
        addCandidate(
          wallet.signer,
          form.name.trim(),
          metadataCid,
          wallet.contractAddress,
        ),
        {
          loading: "Registering candidate on blockchain...",
          success: `Candidate "${form.name.trim()}" added successfully!`,
        },
      );

      // ==========================================
      // STEP 5: Reset form
      // ==========================================

      setForm({
        name: "",
        info: "",
        imageFile: null,
      });

      setShowForm(false);

      // Reset file input
      const fileInput = document.getElementById("candidate-image");

      if (fileInput) {
        fileInput.value = "";
      }

      refresh();
      refreshResults();
    } catch (error) {
      console.error("Candidate registration failed:", error);

      toast.error(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "Failed to register candidate.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Candidate Management
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Candidates live on-chain. Add them during the Registration phase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <WalletConnectButton wallet={wallet} size="sm" />

          {canAdd && (
            <Button onClick={openForm} disabled={!wallet.signer || !isOwner}>
              <FaPlus className="h-4 w-4" />
              Add Candidate
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
            The VotingSystem contract has no edit or delete functions by design
            — recorded votes and candidates can never be altered. Make sure
            names and candidate information are correct before submitting.
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
            <FaPlus className="text-brand-600 dark:text-brand-400" />
            Register New Candidate
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Candidate Name */}
            <Input
              label="Candidate Name *"
              name="name"
              placeholder="e.g. Aarav Mehta"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            {/* Candidate Info */}
            <Textarea
              label="Candidate Information"
              name="info"
              placeholder="Enter candidate bio, manifesto or other information..."
              value={form.info}
              onChange={handleChange}
              rows={4}
            />

            {/* Candidate Image */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Candidate Photo *
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-300 p-5 dark:border-slate-600">
                <div className="flex flex-col items-center justify-center gap-3">
                  <FaImage className="h-8 w-8 text-slate-400" />

                  <input
                    id="candidate-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-600 dark:text-slate-300"
                  />

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the candidate photo. It will automatically be
                    uploaded to IPFS.
                  </p>

                  {form.imageFile && (
                    <p className="text-sm font-medium text-green-600">
                      Selected: {form.imageFile.name}
                    </p>
                  )}
                </div>
              </div>

              {errors.imageFile && (
                <p className="mt-1 text-sm text-red-500">{errors.imageFile}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button type="submit" loading={submitting} disabled={submitting}>
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
                <FaPlus className="h-4 w-4" />
                Add First Candidate
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
