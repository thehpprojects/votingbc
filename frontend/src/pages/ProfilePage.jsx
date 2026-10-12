// ======================================
// VoteChain Profile Page (shared: admin & voter)
// ======================================

import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getAdminProfile } from "../services/api";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import {
  FaUserCircle,
  FaEnvelope,
  FaIdCard,
  FaShieldAlt,
  FaVoteYea,
  FaWallet,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { shortenAddress } from "../utils/format";

export default function ProfilePage() {
  const {
    admin,
    voter,
    isAdmin,
    isVoter,
    adminLogout,
    voterLogout,
    refreshVoterStatus,
  } = useAuth();

  const navigate = useNavigate();

  // Get the SAME wallet/election data used by the dashboard.
  // Supports both { wallet } and direct wallet outlet context.
  const outletContext = useOutletContext();
  const wallet = outletContext?.wallet || outletContext || {};

  const election = wallet?.election;
  const electionLoading = wallet?.loading;

  const [profile, setProfile] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  // ======================================
  // Load admin profile
  // ======================================

  useEffect(() => {
    if (!isAdmin) return;

    setFetchingProfile(true);

    getAdminProfile()
      .then((res) => {
        setProfile(res.data?.admin);
      })
      .catch(() => {
        toast.error("Could not load admin profile.");
      })
      .finally(() => {
        setFetchingProfile(false);
      });
  }, [isAdmin]);

  // ======================================
  // Keep voter status fresh
  // ======================================

  useEffect(() => {
    if (isVoter) {
      refreshVoterStatus();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoter]);

  // ======================================
  // Logout
  // ======================================

  const handleLogout = () => {
    if (isAdmin) {
      adminLogout();
    } else {
      voterLogout();
    }

    toast.success("Logged out.");
    navigate("/");
  };

  // ======================================
  // Wallet
  // ======================================

  const storedWalletAddress = localStorage.getItem("voting_wallet_address");

  const walletAddress = wallet?.account || storedWalletAddress || null;

  // ======================================
  // Display information
  // ======================================

  const displayName = isAdmin ? profile?.name || admin?.name : voter?.name;

  const displayEmail = isAdmin ? profile?.email || admin?.email : voter?.email;

  const hasVoted = isAdmin ? false : !!voter?.hasVoted;

  if (fetchingProfile) {
    return <Spinner size="lg" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ======================================
          Page Header
      ====================================== */}

      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        My Profile
      </h1>

      {/* ======================================
          Identity Card
      ====================================== */}

      <div className="card overflow-hidden rounded-3xl">
        <div className="h-28 bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600" />

        <div className="-mt-12 flex flex-col items-center px-6 pb-6 sm:flex-row sm:items-end sm:gap-5">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-brand-600 shadow-lg dark:border-midnight-900 dark:bg-midnight-850">
            <FaUserCircle className="h-14 w-14" />
          </div>

          {/* User information */}
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {displayName || "User"}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {displayEmail || "—"}
            </p>

            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              {isAdmin ? (
                <Badge tone="brand">
                  <FaShieldAlt className="mr-1 inline" />
                  Administrator
                </Badge>
              ) : (
                <>
                  {/* OTP status */}
                  {voter?.isVerified ? (
                    <Badge tone="success">
                      <FaShieldAlt className="mr-1 inline" />
                      OTP Verified
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                      Not Verified
                    </span>
                  )}

                  {/* Vote status
                      Explicit colors here ensure visibility in LIGHT theme. */}
                  {hasVoted ? (
                    <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
                      <FaVoteYea className="mr-1 inline" />
                      Has Voted
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <FaVoteYea className="mr-1 inline" />
                      Has Not Voted
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="ml-auto mt-3 sm:mt-0">
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================
          Details
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Voter ID */}
        {!isAdmin && (
          <div className="card rounded-2xl p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <FaIdCard className="text-brand-500" />
              Voter ID
            </p>

            <p className="mt-2 break-all font-mono text-lg font-bold text-slate-900 dark:text-white">
              {voter?.voterIdNumber || "—"}
            </p>
          </div>
        )}

        {/* Contact */}
        {!isAdmin && (
          <div className="card rounded-2xl p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <FaEnvelope className="text-brand-500" />
              Contact
            </p>

            <p className="mt-2 break-all text-lg font-bold text-slate-900 dark:text-white">
              {voter?.email || "—"}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {voter?.phone || "No phone"}
            </p>
          </div>
        )}

        {/* Linked Wallet */}
        <div className="card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <FaWallet className="text-brand-500" />
            Linked Wallet
          </p>

          {walletAddress ? (
            <a
              href={`https://amoy.polygonscan.com/address/${walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex max-w-full items-center gap-2 font-mono text-lg font-bold text-brand-600 hover:underline dark:text-brand-400"
              title={walletAddress}
            >
              <span className="truncate">
                {shortenAddress(walletAddress, 6)}
              </span>

              <FaExternalLinkAlt className="h-3 w-3 shrink-0" />
            </a>
          ) : (
            <p className="mt-2 text-slate-400 dark:text-slate-500">
              No wallet linked
            </p>
          )}
        </div>

        {/* Election State */}
        <div className="card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <FaVoteYea className="text-brand-500" />
            Election State
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {electionLoading ? "..." : election?.stateLabel || "—"}
          </p>

          {/* Show selected election name so the voter knows
              which election this state belongs to. */}
          {election?.name && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {election.name}
            </p>
          )}
        </div>
      </div>

      {/* ======================================
          Registration ID
      ====================================== */}

      {!isAdmin && (
        <div className="card rounded-2xl p-5 text-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Registration ID (Mongo)
          </p>

          <p className="mt-1 break-all font-mono text-slate-600 dark:text-slate-300">
            {voter?.id || "—"}
          </p>
        </div>
      )}
    </div>
  );
}
