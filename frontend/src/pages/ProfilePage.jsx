// ======================================
// VoteChain Profile Page (shared: admin & voter)
// ======================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getAdminProfile } from "../services/api";
import { useContractData } from "../hooks/useContractData";
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
  const { election, loading } = useContractData();

  const [profile, setProfile] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  // Load admin profile from backend when in admin mode
  useEffect(() => {
    if (isAdmin) {
      setFetchingProfile(true);
      getAdminProfile()
        .then((res) => setProfile(res.data?.admin))
        .catch(() => toast.error("Could not load admin profile."))
        .finally(() => setFetchingProfile(false));
    }
  }, [isAdmin]);

  // Keep voter status fresh
  useEffect(() => {
    if (isVoter) refreshVoterStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoter]);

  const handleLogout = () => {
    if (isAdmin) adminLogout();
    else voterLogout();
    toast.success("Logged out.");
    navigate("/");
  };

  const walletAddress = localStorage.getItem("voting_wallet_address");
  const displayName = isAdmin ? profile?.name || admin?.name : voter?.name;
  const displayEmail = isAdmin ? profile?.email || admin?.email : voter?.email;

  if (fetchingProfile) return <Spinner size="lg" />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>

      {/* Identity card */}
      <div className="card overflow-hidden rounded-3xl">
        <div className="h-28 bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600" />
        <div className="-mt-12 flex flex-col items-center px-6 pb-6 sm:flex-row sm:items-end sm:gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-brand-600 shadow-lg dark:border-midnight-900 dark:bg-midnight-850">
            <FaUserCircle className="h-14 w-14" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{displayName || "User"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{displayEmail}</p>
            <div className="mt-2 flex justify-center gap-2 sm:justify-start">
              {isAdmin ? (
                <Badge tone="brand">
                  <FaShieldAlt className="mr-1 inline" /> Administrator
                </Badge>
              ) : (
                <>
                  {voter?.isVerified ? (
                    <Badge tone="success">
                      <FaShieldAlt className="mr-1 inline" /> OTP Verified
                    </Badge>
                  ) : (
                    <Badge tone="warning">Not Verified</Badge>
                  )}
                  {voter?.hasVoted ? (
                    <Badge tone="brand">
                      <FaVoteYea className="mr-1 inline" /> Has Voted
                    </Badge>
                  ) : (
                    <Badge tone="default">Has Not Voted</Badge>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="ml-auto mt-3 sm:mt-0">
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        {!isAdmin && (
          <>
            <div className="card rounded-2xl p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <FaIdCard className="text-brand-500" /> Voter ID
              </p>
              <p className="mt-2 font-mono text-lg font-bold text-slate-900 dark:text-white">
                {voter?.voterIdNumber || "—"}
              </p>
            </div>
            <div className="card rounded-2xl p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <FaEnvelope className="text-brand-500" /> Contact
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {voter?.email || "—"}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{voter?.phone || "No phone"}</p>
            </div>
          </>
        )}

        <div className="card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <FaWallet className="text-brand-500" /> Linked Wallet
          </p>
          {walletAddress ? (
            <a
              href={`https://amoy.polygonscan.com/address/${walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 font-mono text-lg font-bold text-brand-600 hover:underline dark:text-brand-400"
              title={walletAddress}
            >
              {shortenAddress(walletAddress, 6)}
              <FaExternalLinkAlt className="h-3 w-3" />
            </a>
          ) : (
            <p className="mt-2 text-slate-400 dark:text-slate-500">No wallet linked</p>
          )}
        </div>

        <div className="card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <FaVoteYea className="text-brand-500" /> Election State
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {loading ? "..." : election?.stateLabel || "—"}
          </p>
        </div>
      </div>

      {/* Registration id for admins */}
      {!isAdmin && (
        <div className="card rounded-2xl p-5 text-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Registration ID (Mongo)
          </p>
          <p className="mt-1 break-all font-mono text-slate-600 dark:text-slate-300">{voter?.id}</p>
        </div>
      )}
    </div>
  );
}