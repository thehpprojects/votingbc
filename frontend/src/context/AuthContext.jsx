// ======================================
// Authentication Context
// ======================================

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAdminProfile, getVoterVerificationStatus, getVoterVotingStatus } from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);

/**
 * Manages both admin (JWT) and voter (local session) authentication.
 */
export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)
  );
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || "null");
    } catch {
      return null;
    }
  });
  const [voter, setVoter] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTER_SESSION) || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // ----- Admin auth -----
  const adminLogin = useCallback((token, adminData) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminData));
    setAdminToken(token);
    setAdmin(adminData);
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    setAdminToken(null);
    setAdmin(null);
  }, []);

  // ----- Voter auth -----
  const voterLogin = useCallback((voterData) => {
    localStorage.setItem(STORAGE_KEYS.VOTER_SESSION, JSON.stringify(voterData));
    setVoter(voterData);
  }, []);

  const voterLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.VOTER_SESSION);
    setVoter(null);
  }, []);

  /** Refresh voter verification/voted status from the backend. */
  const refreshVoterStatus = useCallback(async () => {
    if (!voter?.id) return;
    try {
      const [statusRes, votedRes] = await Promise.all([
        getVoterVerificationStatus(voter.id),
        getVoterVotingStatus(voter.id),
      ]);
      const updated = {
        ...voter,
        isVerified: statusRes.data?.verified ?? voter.isVerified,
        hasVoted: votedRes.data?.hasVoted ?? voter.hasVoted,
      };
      setVoter(updated);
      localStorage.setItem(STORAGE_KEYS.VOTER_SESSION, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to refresh voter status", error);
    }
  }, [voter]);

  // ----- Bootstrapping -----
  useEffect(() => {
    if (adminToken && !admin) {
      setLoading(true);
      getAdminProfile()
        .then((res) => {
          const data = res.data?.admin;
          localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(data));
          setAdmin(data);
        })
        .catch(() => adminLogout())
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  const value = {
    // admin
    admin,
    adminToken,
    isAdmin: !!adminToken && !!admin,
    adminLogin,
    adminLogout,
    // voter
    voter,
    isVoter: !!voter,
    voterLogin,
    voterLogout,
    refreshVoterStatus,
    // misc
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to access auth state and actions. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
