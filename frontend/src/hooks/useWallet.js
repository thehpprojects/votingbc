// ======================================
// VoteChain Wallet Hook
// MetaMask + Factory + Multi-Election
// ======================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import { getAllElections } from "../services/factory";

import { ELECTIONS } from "../config/elections";
import { STORAGE_KEYS } from "../utils/constants";

const SELECTED_ELECTION_KEY = "votechain_selected_election";

// ======================================
// Initial election
// ======================================

function getInitialElectionId(elections) {
  try {
    const savedId = localStorage.getItem(SELECTED_ELECTION_KEY);

    // Keep the saved election ID even before Factory
    // elections finish loading.
    if (savedId) {
      return savedId;
    }
  } catch (error) {
    console.error("Could not read selected election:", error);
  }

  return elections[0]?.id || null;
}

// ======================================
// Convert Factory election
// ======================================

function normalizeFactoryElection(item, index) {
  return {
    id: `factory-${index}`,
    name: item.name,
    category: item.category,
    year: new Date(Number(item.createdAt) * 1000).getFullYear(),
    contractAddress: item.contractAddress,
    factoryId: Number(item.id),
    createdAt: Number(item.createdAt),
    source: "factory",
  };
}

// ======================================
// Wallet Hook
// ======================================

export function useWallet() {
  // ======================================
  // Elections
  // ======================================

  const [factoryElections, setFactoryElections] = useState([]);
  const [electionsLoading, setElectionsLoading] = useState(false);

  const allElections = useMemo(() => {
    const combined = [...ELECTIONS];

    for (const factoryElection of factoryElections) {
      const alreadyExists = combined.some(
        (election) =>
          election.contractAddress?.toLowerCase() ===
          factoryElection.contractAddress?.toLowerCase(),
      );

      if (!alreadyExists) {
        combined.push(factoryElection);
      }
    }

    return combined;
  }, [factoryElections]);

  // ======================================
  // Selected Election
  // ======================================

  const [selectedElectionId, setSelectedElectionId] = useState(() =>
    getInitialElectionId(allElections),
  );

  const selectedElection = useMemo(() => {
    return (
      allElections.find((election) => election.id === selectedElectionId) ||
      allElections[0] ||
      null
    );
  }, [allElections, selectedElectionId]);

  const contractAddress = selectedElection?.contractAddress || null;

  // ======================================
  // Wallet State
  // ======================================

  const [account, setAccount] = useState(
    () => localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS) || null,
  );

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // ======================================
  // Voting State
  // ======================================

  const [hasVoted, setHasVoted] = useState(false);
  const [votingStatusLoading, setVotingStatusLoading] = useState(false);

  // ======================================
  // Owner State
  // ======================================

  const [ownerAddress, setOwnerAddress] = useState(null);

  // ======================================
  // Election Data
  // ======================================

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  // Prevent old election requests from overwriting
  // the currently selected election.
  const refreshRequestRef = useRef(0);
  const resultsRequestRef = useRef(0);
  const ownerRequestRef = useRef(0);

  const installed = isMetaMaskInstalled();

  // ======================================
  // LOAD FACTORY ELECTIONS
  // ======================================

  const loadFactoryElections = useCallback(
    async (currentProvider = provider) => {
      if (!currentProvider) {
        return;
      }

      setElectionsLoading(true);

      try {
        const factoryData = await getAllElections(currentProvider);

        const normalized = factoryData.map((item, index) =>
          normalizeFactoryElection(item, index),
        );

        console.log("Factory elections:", normalized);

        setFactoryElections(normalized);

        return normalized;
      } catch (error) {
        console.error("FACTORY ELECTION LOAD ERROR:", error);

        // Factory may not be configured yet.
        setFactoryElections([]);

        return [];
      } finally {
        setElectionsLoading(false);
      }
    },
    [provider],
  );

  // ======================================
  // SELECT ELECTION
  // ======================================

  const selectElection = useCallback(
    (electionId) => {
      const election = allElections.find((item) => item.id === electionId);

      if (!election) {
        console.error("Election not found:", electionId);
        return;
      }

      console.log("=================================");
      console.log("ELECTION SELECTED");
      console.log("Name:", election.name);
      console.log("Category:", election.category);
      console.log("Contract:", election.contractAddress);
      console.log("=================================");

      setSelectedElectionId(election.id);

      localStorage.setItem(SELECTED_ELECTION_KEY, election.id);

      // Clear old election data immediately.
      setElection(null);
      setCandidates([]);
      setResults(null);
      setOwnerAddress(null);
      setHasVoted(false);
    },
    [allElections],
  );

  // ======================================
  // CONNECT WALLET
  // ======================================

  const connect = useCallback(async () => {
    if (!installed) {
      toast.error("MetaMask is not installed.");
      return null;
    }

    setConnecting(true);

    try {
      await switchToAmoy();

      const {
        address,
        provider: connectedProvider,
        signer: connectedSigner,
      } = await connectWallet();

      console.log("=================================");
      console.log("WALLET CONNECTED");
      console.log("Account:", address);
      console.log("Selected election:", selectedElection?.name);
      console.log("Selected contract:", contractAddress);
      console.log("=================================");

      setAccount(address);
      setProvider(connectedProvider);
      setSigner(connectedSigner);

      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);

      // ======================================
      // Load Factory Elections
      // ======================================

      let loadedFactoryElections = [];

      try {
        const factoryData = await getAllElections(connectedProvider);

        loadedFactoryElections = factoryData.map((item, index) =>
          normalizeFactoryElection(item, index),
        );

        setFactoryElections(loadedFactoryElections);
      } catch (factoryError) {
        console.error("FACTORY LOAD ERROR:", factoryError);
      }

      // ======================================
      // Determine current election
      // ======================================

      const combinedElections = [
        ...ELECTIONS,
        ...loadedFactoryElections.filter(
          (factoryElection) =>
            !ELECTIONS.some(
              (existing) =>
                existing.contractAddress?.toLowerCase() ===
                factoryElection.contractAddress?.toLowerCase(),
            ),
        ),
      ];

      const currentElection =
        combinedElections.find((item) => item.id === selectedElectionId) ||
        combinedElections[0];

      const currentContract = currentElection?.contractAddress;

      // ======================================
      // Owner
      // ======================================

      if (currentContract) {
        const owner = await fetchOwner(connectedProvider, currentContract);

        console.log("=================================");
        console.log("CONTRACT OWNER");
        console.log("Election:", currentElection?.name);
        console.log("Contract:", currentContract);
        console.log("Connected wallet:", address);
        console.log("Contract owner:", owner);
        console.log("IS OWNER:", address.toLowerCase() === owner.toLowerCase());
        console.log("=================================");

        setOwnerAddress(owner);
      }

      toast.success("Wallet connected!");

      return {
        address,
        provider: connectedProvider,
        signer: connectedSigner,
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
  }, [installed, selectedElection, selectedElectionId, contractAddress]);

  // ======================================
  // DISCONNECT
  // ======================================

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

  // ======================================
  // CHECK WHETHER WALLET HAS VOTED
  // ======================================

  const checkHasVoted = useCallback(
    async (address = account) => {
      if (!address || !provider || !contractAddress) {
        setHasVoted(false);
        return false;
      }

      setVotingStatusLoading(true);

      try {
        const voted = await hasWalletVoted(address, provider, contractAddress);

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
    [account, provider, contractAddress],
  );

  // ======================================
  // LOAD ELECTION DATA
  // ======================================

  const refresh = useCallback(async () => {
    if (!provider) {
      console.log("REFRESH SKIPPED: provider not ready");
      return;
    }

    if (!contractAddress) {
      console.log("REFRESH SKIPPED: contract address not configured");
      return;
    }

    const requestId = ++refreshRequestRef.current;
    const requestedContract = contractAddress;

    setLoading(true);

    try {
      console.log("=================================");
      console.log("LOADING ELECTION DATA");
      console.log("Election:", selectedElection?.name);
      console.log("Contract:", requestedContract);
      console.log("Request ID:", requestId);
      console.log("=================================");

      const [status, cands] = await Promise.all([
        fetchElectionStatus(provider, requestedContract),
        fetchCandidates(provider, requestedContract),
      ]);

      // Ignore a response from an older election request.
      if (
        requestId !== refreshRequestRef.current ||
        requestedContract.toLowerCase() !== contractAddress.toLowerCase()
      ) {
        console.log("IGNORING STALE ELECTION DATA:", requestedContract);
        return;
      }

      console.log("Election status:", status);
      console.log("Candidates:", cands);

      setElection(status);
      setCandidates(cands);
    } catch (error) {
      if (requestId !== refreshRequestRef.current) {
        return;
      }

      console.error("CHAIN LOAD ERROR:", error);

      toast.error(
        error?.shortMessage ||
          error?.message ||
          "Failed to load on-chain data.",
      );
    } finally {
      if (requestId === refreshRequestRef.current) {
        setLoading(false);
      }
    }
  }, [provider, contractAddress, selectedElection]);

  // ======================================
  // LOAD RESULTS
  // ======================================

  const refreshResults = useCallback(async () => {
    if (!provider || !contractAddress) {
      return;
    }

    const requestId = ++resultsRequestRef.current;
    const requestedContract = contractAddress;

    try {
      console.log("=================================");
      console.log("LOADING RESULTS");
      console.log("Contract:", requestedContract);
      console.log("Request ID:", requestId);
      console.log("=================================");

      const data = await fetchResults(provider, requestedContract);

      // Ignore results belonging to an older election.
      if (
        requestId !== resultsRequestRef.current ||
        requestedContract.toLowerCase() !== contractAddress.toLowerCase()
      ) {
        console.log("IGNORING STALE RESULTS:", requestedContract);
        return;
      }

      setResults(data);
    } catch (error) {
      if (requestId !== resultsRequestRef.current) {
        return;
      }

      console.error("RESULTS LOAD ERROR:", error);
    }
  }, [provider, contractAddress]);

  // ======================================
  // LOAD OWNER
  // ======================================

  const loadOwner = useCallback(async () => {
    if (!provider || !contractAddress) {
      console.log("OWNER LOAD SKIPPED: provider or contract not ready");
      return null;
    }

    const requestId = ++ownerRequestRef.current;
    const requestedContract = contractAddress;

    try {
      const owner = await fetchOwner(provider, requestedContract);

      // Ignore owner information from an older election.
      if (
        requestId !== ownerRequestRef.current ||
        requestedContract.toLowerCase() !== contractAddress.toLowerCase()
      ) {
        console.log("IGNORING STALE OWNER:", requestedContract);
        return null;
      }

      console.log("=================================");
      console.log("OWNER CHECK");
      console.log("Election:", selectedElection?.name);
      console.log("Contract:", requestedContract);
      console.log("Connected account:", account);
      console.log("Contract owner:", owner);

      if (account) {
        console.log("IS OWNER:", account.toLowerCase() === owner.toLowerCase());
      }

      console.log("=================================");

      setOwnerAddress(owner);

      return owner;
    } catch (error) {
      if (requestId !== ownerRequestRef.current) {
        return null;
      }

      console.error("OWNER LOAD ERROR:", error);
      setOwnerAddress(null);

      return null;
    }
  }, [provider, account, contractAddress, selectedElection]);

  // ======================================
  // INITIAL PROVIDER CHECK
  // ======================================

  useEffect(() => {
    if (!installed) {
      return;
    }

    const initializeWallet = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        console.log("MetaMask existing accounts:", accounts);

        // Wallet is already connected in MetaMask.
        // Restore the dApp wallet state without requiring
        // the user to disconnect/reconnect manually.
        if (accounts && accounts.length > 0) {
          await connect();
        }
      } catch (error) {
        console.error("WALLET INITIALIZATION ERROR:", error);
      }
    };

    initializeWallet();

    // We intentionally run this once when the hook mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installed]);

  // ======================================
  // LOAD FACTORY ELECTIONS AFTER PROVIDER
  // =====================================

  // ======================================
  // RESTORE SAVED FACTORY ELECTION
  // ======================================

  useEffect(() => {
    if (!factoryElections.length) {
      return;
    }

    try {
      const savedId = localStorage.getItem(SELECTED_ELECTION_KEY);

      if (!savedId) {
        return;
      }

      const exists = allElections.some((election) => election.id === savedId);

      if (exists && selectedElectionId !== savedId) {
        console.log("Restoring saved election:", savedId);

        setSelectedElectionId(savedId);
      }
    } catch (error) {
      console.error("FAILED TO RESTORE SAVED ELECTION:", error);
    }
  }, [factoryElections, allElections, selectedElectionId]);

  // ======================================
  // LOAD DATA WHEN ELECTION CHANGES
  // ======================================

  useEffect(() => {
    if (!provider || !contractAddress) {
      return;
    }

    refresh();
    refreshResults();
  }, [provider, contractAddress, refresh, refreshResults]);

  // ======================================
  // LOAD OWNER WHEN ELECTION CHANGES
  // ======================================

  useEffect(() => {
    if (!provider || !contractAddress) {
      return;
    }

    loadOwner();
  }, [provider, contractAddress, account, loadOwner]);

  // ======================================
  // CHECK VOTING STATUS
  // ======================================

  useEffect(() => {
    if (!account || !provider || !contractAddress) {
      return;
    }

    checkHasVoted(account);
  }, [account, provider, contractAddress, checkHasVoted]);

  // ======================================
  // METAMASK EVENTS
  // ======================================

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

    const handleAccountChange = async (accounts) => {
      console.log("MetaMask account changed:", accounts);

      if (!accounts || accounts.length === 0) {
        disconnect();
        return;
      }

      disconnect();

      toast("MetaMask account changed. Click Connect Wallet.");
    };

    const removeNetworkListener = onNetworkChange(handleNetworkChange);

    const removeAccountListener = onAccountChange(handleAccountChange);

    return () => {
      removeNetworkListener();
      removeAccountListener();
    };
  }, [installed, disconnect]);

  // ======================================
  // OWNER BOOLEAN
  // ======================================

  const isOwner =
    !!account &&
    !!ownerAddress &&
    account.toLowerCase() === ownerAddress.toLowerCase();

  // ======================================
  // RETURN
  // ======================================

  return {
    // Elections
    elections: allElections,
    electionsLoading,

    selectedElection,
    selectedElectionId,
    contractAddress,

    selectElection,
    loadFactoryElections,

    // Wallet
    installed,
    account,
    provider,
    signer,

    connecting,
    connect,
    disconnect,

    // Voting
    hasVoted,
    votingStatusLoading,
    checkHasVoted,

    // Owner
    ownerAddress,
    isOwner,
    loadOwner,

    // Election data
    election,
    candidates,
    results,

    loading,
    refresh,
    refreshResults,
  };
}
