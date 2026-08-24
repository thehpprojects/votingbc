// ======================================
// Wallet Hook (MetaMask + contract read data)
// ======================================

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  connectWallet,
  switchToAmoy,
  onAccountChange,
  onNetworkChange,
  fetchElectionStatus,
  fetchCandidates,
  fetchResults,
  fetchOwner,
  hasWalletVoted,
  isMetaMaskInstalled,
} from "../services/contract";

import { STORAGE_KEYS } from "../utils/constants";

export function useWallet() {
  const [account, setAccount] = useState(
    () => localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS) || null,
  );

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const [connecting, setConnecting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingStatusLoading, setVotingStatusLoading] = useState(false);

  const [ownerAddress, setOwnerAddress] = useState(null);

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const installed = isMetaMaskInstalled();

  // =========================================================
  // CONNECT WALLET
  // =========================================================

  const connect = useCallback(async () => {
    if (!installed) {
      toast.error("MetaMask is not installed.");
      return null;
    }

    setConnecting(true);

    try {
      // Make sure MetaMask is on Polygon Amoy
      await switchToAmoy();

      // Connect wallet
      const { address, provider, signer } = await connectWallet();

      console.log("=================================");
      console.log("WALLET CONNECTED");
      console.log("Account:", address);
      console.log("Provider:", provider);
      console.log("Signer:", signer);
      console.log("=================================");

      setAccount(address);
      setProvider(provider);
      setSigner(signer);

      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);

      // -------------------------------------------------------
      // IMPORTANT:
      // Immediately read the contract owner using the SAME
      // provider that belongs to this connected wallet.
      // -------------------------------------------------------

      const owner = await fetchOwner(provider);

      console.log("=================================");
      console.log("CONTRACT OWNER");
      console.log("Connected wallet:", address);
      console.log("Contract owner:", owner);
      console.log("IS OWNER:", address.toLowerCase() === owner.toLowerCase());
      console.log("=================================");

      setOwnerAddress(owner);

      toast.success("Wallet connected!");

      return {
        address,
        provider,
        signer,
        ownerAddress: owner,
      };
    } catch (error) {
      console.error("WALLET CONNECT ERROR:", error);

      toast.error(
        error?.shortMessage || error?.message || "Failed to connect wallet.",
      );

      return null;
    } finally {
      setConnecting(false);
    }
  }, [installed]);

  // =========================================================
  // DISCONNECT
  // =========================================================

  const disconnect = useCallback(() => {
    console.log("Disconnecting wallet");

    setAccount(null);
    setProvider(null);
    setSigner(null);
    setOwnerAddress(null);
    setHasVoted(false);
    setElection(null);
    setCandidates([]);
    setResults(null);

    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
  }, []);

  // =========================================================
  // CHECK WHETHER WALLET HAS VOTED
  // =========================================================

  const checkHasVoted = useCallback(
    async (address = account) => {
      if (!address || !provider) {
        setHasVoted(false);
        return false;
      }

      setVotingStatusLoading(true);

      try {
        const voted = await hasWalletVoted(address, provider);

        setHasVoted(voted);

        return voted;
      } catch (error) {
        console.error("HAS VOTED ERROR:", error);

        setHasVoted(false);

        return false;
      } finally {
        setVotingStatusLoading(false);
      }
    },
    [account, provider],
  );

  // =========================================================
  // LOAD ELECTION DATA
  // =========================================================

  const refresh = useCallback(async () => {
    if (!provider) {
      console.log("REFRESH SKIPPED: provider not ready");
      return;
    }

    setLoading(true);

    try {
      console.log("Loading election data...");

      const [status, cands] = await Promise.all([
        fetchElectionStatus(provider),
        fetchCandidates(provider),
      ]);

      console.log("Election status:", status);
      console.log("Candidates:", cands);

      setElection(status);
      setCandidates(cands);
    } catch (error) {
      console.error("CHAIN LOAD ERROR:", error);

      toast.error(
        error?.shortMessage ||
          error?.message ||
          "Failed to load on-chain data.",
      );
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // =========================================================
  // LOAD RESULTS
  // =========================================================

  const refreshResults = useCallback(async () => {
    if (!provider) {
      return;
    }

    try {
      const data = await fetchResults(provider);
      setResults(data);
    } catch (error) {
      console.error("RESULTS LOAD ERROR:", error);
    }
  }, [provider]);

  // =========================================================
  // LOAD CONTRACT OWNER
  // =========================================================

  const loadOwner = useCallback(async () => {
    if (!provider) {
      console.log("OWNER LOAD SKIPPED: provider not ready");
      return null;
    }

    try {
      const owner = await fetchOwner(provider);

      console.log("=================================");
      console.log("OWNER CHECK");
      console.log("Connected account:", account);
      console.log("Contract owner:", owner);

      if (account) {
        console.log("IS OWNER:", account.toLowerCase() === owner.toLowerCase());
      }

      console.log("=================================");

      setOwnerAddress(owner);

      return owner;
    } catch (error) {
      console.error("OWNER LOAD ERROR:", error);

      setOwnerAddress(null);

      return null;
    }
  }, [provider, account]);

  // =========================================================
  // PROVIDER / ACCOUNT INITIALIZATION
  // =========================================================

  useEffect(() => {
    if (!installed) {
      return;
    }

    // If localStorage has an old wallet address, reconnect it
    // through MetaMask so provider + signer are also available.
    const initializeWallet = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        console.log("MetaMask existing accounts:", accounts);

        if (!accounts || accounts.length === 0) {
          return;
        }

        // We don't need to call eth_accounts ourselves elsewhere.
        // connectWallet uses ethers correctly.
        await connect();
      } catch (error) {
        console.error("WALLET INITIALIZATION ERROR:", error);
      }
    };

    initializeWallet();
  }, [installed, connect]);

  // =========================================================
  // LOAD CONTRACT OWNER WHEN PROVIDER IS READY
  // =========================================================

  useEffect(() => {
    if (!provider) {
      return;
    }

    loadOwner();
  }, [provider, account, loadOwner]);

  // =========================================================
  // LOAD ELECTION DATA WHEN PROVIDER IS READY
  // =========================================================

  useEffect(() => {
    if (!provider) {
      return;
    }

    refresh();
    refreshResults();
  }, [provider, refresh, refreshResults]);

  // =========================================================
  // CHECK VOTING STATUS
  // =========================================================

  useEffect(() => {
    if (!account || !provider) {
      return;
    }

    checkHasVoted(account);
  }, [account, provider, checkHasVoted]);

  // =========================================================
  // METAMASK ACCOUNT + NETWORK EVENTS
  // =========================================================

  useEffect(() => {
    if (!installed) {
      return () => {};
    }

    const handleNetworkChange = async () => {
      console.log("MetaMask network changed");

      try {
        await switchToAmoy();
        window.location.reload();
      } catch (error) {
        console.error("NETWORK CHANGE ERROR:", error);
      }
    };

    const handleAccountChange = (accounts) => {
      console.log("MetaMask account changed:", accounts);

      if (!accounts || accounts.length === 0) {
        disconnect();
        return;
      }

      // Account changed.
      // Clear old state and reconnect the newly selected account.
      disconnect();

      setTimeout(() => {
        connect();
      }, 100);
    };

    const removeNetworkListener = onNetworkChange(handleNetworkChange);

    const removeAccountListener = onAccountChange(handleAccountChange);

    return () => {
      removeNetworkListener();
      removeAccountListener();
    };
  }, [installed, connect, disconnect]);

  // =========================================================
  // FINAL OWNER BOOLEAN
  // =========================================================

  const isOwner =
    !!account &&
    !!ownerAddress &&
    account.toLowerCase() === ownerAddress.toLowerCase();

  // =========================================================
  // RETURN
  // =========================================================

  return {
    installed,

    account,
    provider,
    signer,

    connecting,
    connect,
    disconnect,

    hasVoted,
    votingStatusLoading,
    checkHasVoted,

    ownerAddress,
    isOwner,
    loadOwner,

    election,
    candidates,
    results,

    loading,
    refresh,
    refreshResults,
  };
}
