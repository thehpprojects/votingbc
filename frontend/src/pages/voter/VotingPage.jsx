// ======================================
// VoteChain Voting Page (cast on-chain vote)
// ======================================

import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { markVoterAsVoted } from "../../services/api";
import { castVote, getExplorerTxUrl } from "../../services/contract";

import CandidateCard from "../../components/candidate/CandidateCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TxLink from "../../components/common/TxLink";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import WalletConnectButton from "../../components/common/WalletConnectButton";

import {
  FaVoteYea,
  FaCheckCircle,
  FaExclamationTriangle,
  FaWallet,
  FaUsers,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function VotingPage() {
  const { voter, refreshVoterStatus } = useAuth();
  const { wallet } = useOutletContext();

  const {
    election,
    candidates,
    loading,
    refresh,
    checkHasVoted,
    contractAddress,
  } = wallet;
  const [selectedId, setSelectedId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const verified = voter?.isVerified;

  // =========================================================
  // RE-CHECK ON-CHAIN VOTING STATUS WHEN WALLET CHANGES
  // =========================================================

  useEffect(() => {
    if (wallet.account) {
      checkHasVoted(wallet.account);
    }
  }, [wallet.account, checkHasVoted]);

  // =========================================================
  // REFRESH BACKEND STATUS WHEN TRANSACTION COMPLETES
  // =========================================================

  useEffect(() => {
    if (!txHash || !voter?.id) {
      return;
    }

    markVoterAsVoted(voter.id)
      .then(() => {
        toast.success("Voting status updated on the server.");

        refreshVoterStatus();

        refresh();

        if (wallet.account) {
          checkHasVoted(wallet.account);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Could not update server status.",
        );
      });

    // We intentionally react only to a new txHash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  // =========================================================
  // OPEN CONFIRMATION DIALOG
  // =========================================================

  const handleOpenConfirm = () => {
    // Make absolutely sure a candidate was selected.
    if (selectedId === null || selectedId === undefined) {
      toast.error("Please select a candidate first.");
      return;
    }

    // Make sure the selected ID is actually a valid number.
    const candidateId = Number(selectedId);

    if (!Number.isInteger(candidateId) || candidateId < 0) {
      console.error("INVALID CANDIDATE ID:", selectedId);
      toast.error("Invalid candidate selected.");
      return;
    }

    console.log("OPENING VOTE CONFIRMATION");
    console.log("Selected candidate ID:", candidateId);

    setSelectedId(candidateId);
    setConfirmOpen(true);
  };

  // =========================================================
  // CLOSE CONFIRMATION DIALOG
  // =========================================================

  const handleCloseConfirm = () => {
    if (submitting) {
      return;
    }

    console.log("CANCEL VOTE");

    setConfirmOpen(false);
  };

  // =========================================================
  // CONFIRM / CAST VOTE
  // =========================================================

  const handleConfirmVote = async () => {
    // Never allow a vote without a valid candidate ID.
    if (selectedId === null || selectedId === undefined) {
      toast.error("Please select a candidate first.");
      setConfirmOpen(false);
      return;
    }

    if (!wallet.signer) {
      toast.error("Please connect your wallet first.");
      setConfirmOpen(false);
      return;
    }

    const candidateId = Number(selectedId);

    if (!Number.isInteger(candidateId) || candidateId < 0) {
      console.error("INVALID CANDIDATE ID:", selectedId);

      toast.error("Invalid candidate ID.");
      setConfirmOpen(false);
      return;
    }

    console.log("=================================");
    console.log("CASTING VOTE");
    console.log("Candidate ID:", candidateId);
    console.log("Wallet:", wallet.account);
    console.log("=================================");

    setSubmitting(true);

    try {
      const { hash } = await castVote(
        wallet.signer,
        candidateId,
        contractAddress,
      );

      console.log("VOTE TRANSACTION HASH:", hash);

      setTxHash(hash);

      setConfirmOpen(false);

      toast.success("Vote cast successfully on-chain!");
    } catch (error) {
      console.error("VOTING ERROR:", error);

      toast.error(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          "Voting failed. Check the network and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // BLOCKER: NOT VERIFIED
  // =========================================================

  if (!verified) {
    return (
      <EmptyState
        icon={FaExclamationTriangle}
        title="You are not verified yet"
        message="Complete OTP verification before you can vote."
        action={
          <Link to="/verify-otp">
            <Button>Verify Now</Button>
          </Link>
        }
      />
    );
  }

  // =========================================================
  // BLOCKER: WALLET NOT CONNECTED
  // =========================================================

  if (!wallet.account) {
    return (
      <EmptyState
        icon={FaWallet}
        title="Connect your wallet to vote"
        message="The portal auto-switches MetaMask to the Polygon Amoy testnet."
        action={<WalletConnectButton wallet={wallet} />}
      />
    );
  }

  // =========================================================
  // BLOCKER: ALREADY VOTED
  // =========================================================

  if (wallet.hasVoted || voter?.hasVoted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-glow-emerald">
            <FaCheckCircle className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-emerald-900 dark:text-emerald-300">
            You've Already Voted
          </h1>

          <p className="mt-2 max-w-md text-sm text-emerald-700 dark:text-emerald-400">
            Your wallet has cast a vote on-chain. The smart contract guarantees
            one vote per wallet, so no further action is needed.
          </p>

          {txHash && (
            <div className="mt-4 rounded-xl bg-white px-5 py-3 text-sm shadow-sm dark:bg-midnight-850">
              <span className="text-slate-500 dark:text-slate-400">
                Last transaction:{" "}
              </span>

              <TxLink hash={txHash} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // BLOCKER: ELECTION NOT ACTIVE
  // =========================================================

  if (!election?.isActive) {
    return (
      <EmptyState
        icon={FaVoteYea}
        title="Voting is not open"
        message={
          election?.stateLabel === "Ended"
            ? "The election has ended. Results are final."
            : "The election is in the Registration phase. Voting opens when the admin starts it."
        }
      />
    );
  }

  // =========================================================
  // VOTING UI
  // =========================================================

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Cast Your Vote
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select one candidate and confirm. Your vote is recorded immutably.
          </p>
        </div>

        <Badge tone="success">Election Active</Badge>
      </div>

      {/* =====================================================
          CANDIDATES
      ===================================================== */}

      {loading ? (
        <EmptyState title="Loading candidates..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={FaUsers}
          title="No candidates"
          message="Candidates will be added by the admin."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c, index) => {
            /*
             * Handle both possible candidate formats:
             *
             * Object:
             * {
             *   id,
             *   name,
             *   ipfsCid,
             *   voteCount
             * }
             *
             * Ethers tuple:
             * [
             *   id,
             *   name,
             *   ipfsCid,
             *   voteCount
             * ]
             */

            const rawId = c?.id !== undefined && c?.id !== null ? c.id : c?.[0];

            const candidateId = Number(rawId);
            const candidate = {
              ...c,
              id: candidateId,
              name: c?.name ?? c?.[1] ?? "",
              ipfsCid: c?.ipfsCid ?? c?.[2] ?? "",
              voteCount: c?.voteCount ?? c?.[3] ?? 0,
            };

            console.log("CANDIDATE:", {
              index,
              rawId,
              candidateId,
              name: c?.name ?? c?.[1],
            });

            return (
              <CandidateCard
                key={
                  Number.isInteger(candidateId)
                    ? candidateId
                    : `candidate-${index}`
                }
                candidate={candidate}
                variant="select"
                selected={selectedId === candidateId}
                onSelect={() => {
                  if (!Number.isInteger(candidateId) || candidateId < 0) {
                    console.error("INVALID CANDIDATE SELECTED:", c);

                    toast.error("This candidate has an invalid ID.");

                    return;
                  }

                  console.log("CANDIDATE SELECTED:", candidateId);

                  setSelectedId(candidateId);
                  setTxHash(null);
                  setConfirmOpen(false);
                }}
              />
            );
          })}
        </div>
      )}

      {/* =====================================================
          ACTION BAR
      ===================================================== */}

      <div className="sticky bottom-4 z-10 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row dark:border-slate-700 dark:bg-midnight-900/95">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {selectedId !== null ? (
            <span>
              Voting for candidate{" "}
              <span className="font-bold text-brand-600 dark:text-brand-400">
                #{selectedId}
              </span>
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              Select a candidate to continue
            </span>
          )}
        </div>

        <Button
          size="lg"
          disabled={
            selectedId === null || selectedId === undefined || submitting
          }
          onClick={handleOpenConfirm}
          loading={submitting}
        >
          <FaVoteYea className="h-5 w-5" />
          Confirm Vote
        </Button>
      </div>

      {/* =====================================================
          SUCCESS PANEL
      ===================================================== */}

      {txHash && (
        <div className="animate-fade-in rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />

            <div>
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300">
                Vote recorded on-chain!
              </h3>

              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Your transaction has been confirmed on Polygon Amoy.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-mono text-emerald-800 dark:text-emerald-300">
              {txHash}
            </span>

            <a
              href={getExplorerTxUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              View on PolygonScan
              <FaExternalLinkAlt className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRMATION DIALOG
      ===================================================== */}

      {confirmOpen && selectedId !== null && selectedId !== undefined && (
        <ConfirmDialog
          title="Confirm your vote"
          message={`Once confirmed, your vote for candidate #${selectedId} is permanently recorded on the blockchain and cannot be changed or revoked.`}
          confirmText="Vote Now"
          confirmVariant="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleConfirmVote}
          onClose={handleCloseConfirm}
        />
      )}
    </div>
  );
}
