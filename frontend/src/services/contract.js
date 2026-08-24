// ======================================
// Smart Contract Service (ethers.js v6)
// ======================================

import { ethers } from "ethers";
import toast from "react-hot-toast";

import {
  ABI,
  CONTRACT_ADDRESS,
  CHAIN_ID,
  CHAIN_ID_HEX,
  AMOY_NETWORK,
  RPC_URL,
  EXPLORER_URL,
} from "../contract/config";

// ======================================
// MetaMask
// ======================================

export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && !!window.ethereum;
};

// ======================================
// Connect Wallet
// ======================================

export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  // Make sure MetaMask is on Polygon Amoy first
  await switchToAmoy();

  const provider = new ethers.BrowserProvider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  const address = await signer.getAddress();

  console.log("========== WALLET ==========");
  console.log("Connected wallet:", address);
  console.log("============================");

  return {
    address,
    provider,
    signer,
  };
}

// ======================================
// Switch to Polygon Amoy
// ======================================

export async function switchToAmoy() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (error) {
    // Network does not exist in MetaMask
    if (error?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [AMOY_NETWORK],
      });
    } else {
      throw error;
    }
  }
}

// ======================================
// MetaMask Events
// ======================================

export function onAccountChange(callback) {
  if (!window.ethereum) {
    return () => {};
  }

  const handler = (accounts) => {
    callback(accounts);
  };

  window.ethereum.on("accountsChanged", handler);

  return () => {
    window.ethereum.removeListener("accountsChanged", handler);
  };
}

export function onNetworkChange(callback) {
  if (!window.ethereum) {
    return () => {};
  }

  const handler = (chainId) => {
    callback(chainId);
  };

  window.ethereum.on("chainChanged", handler);

  return () => {
    window.ethereum.removeListener("chainChanged", handler);
  };
}

// ======================================
// Provider
// ======================================

let cachedReadProvider = null;

export async function createReadProvider() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  const network = await provider.getNetwork();

  console.log("========== NETWORK ==========");
  console.log("Chain ID:", network.chainId.toString());
  console.log("Expected:", CHAIN_ID);
  console.log("=============================");

  if (network.chainId !== BigInt(CHAIN_ID)) {
    throw new Error(
      `Wrong network. Please connect MetaMask to Polygon Amoy. Current chain: ${network.chainId}`,
    );
  }

  await provider.getBlockNumber();

  cachedReadProvider = provider;

  return provider;
}

// ======================================
// Contract
// ======================================

export async function getReadContract(provider = null) {
  const rpcProvider = provider || (await createReadProvider());

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, rpcProvider);

  return contract;
}

export function getWriteContract(signer) {
  if (!signer) {
    throw new Error("Wallet signer is not available.");
  }

  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

// ======================================
// Address helper
// ======================================

export function shortenAddress(address, chars = 4) {
  if (!address) return "";

  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// ======================================
// Election data
// ======================================

export async function fetchCandidates(provider = null) {
  const contract = await getReadContract(provider);

  const candidates = await contract.getAllCandidates();

  return candidates;
}

export async function fetchElectionStatus(provider = null) {
  const contract = await getReadContract(provider);

  const status = await contract.getElectionStatus();

  return {
    state: Number(status[0]),
    stateLabel: status[1],
    isActive: status[2],
    startedAt: Number(status[3]),
    endedAt: Number(status[4]),
    candidateCount: Number(status[5]),
    votesCast: Number(status[6]),
  };
}

export async function fetchResults(provider = null) {
  const contract = await getReadContract(provider);

  const results = await contract.getResults();

  return {
    candidates: results[0],
    totalVotesCast: Number(results[1]),
    leadingCandidateId: Number(results[2]),
    hasClearLeader: results[3],
  };
}

export async function hasWalletVoted(address, provider = null) {
  if (!address) return false;

  const contract = await getReadContract(provider);

  return await contract.hasVoted(address);
}

export async function fetchCandidateCount(provider = null) {
  const contract = await getReadContract(provider);

  const count = await contract.getCandidateCount();

  return Number(count);
}

// ======================================
// OWNER
// ======================================

export async function fetchOwner(provider = null) {
  const contract = await getReadContract(provider);

  const owner = await contract.owner();

  // Normalize address so comparison is reliable
  const normalizedOwner = ethers.getAddress(owner);

  console.log("========== CONTRACT OWNER ==========");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Owner:", normalizedOwner);
  console.log("====================================");

  return normalizedOwner;
}

// ======================================
// WRITE FUNCTIONS
// ======================================

export async function addCandidate(signer, name, ipfsCid) {
  const contract = getWriteContract(signer);

  const tx = await contract.addCandidate(name, ipfsCid);

  const receipt = await tx.wait();

  return {
    tx,
    receipt,
    hash: receipt.hash || tx.hash,
  };
}

export async function startElection(signer) {
  const contract = getWriteContract(signer);

  const tx = await contract.startElection();

  const receipt = await tx.wait();

  return {
    tx,
    receipt,
    hash: receipt.hash || tx.hash,
  };
}

export async function endElection(signer) {
  const contract = getWriteContract(signer);

  const tx = await contract.endElection();

  const receipt = await tx.wait();

  return {
    tx,
    receipt,
    hash: receipt.hash || tx.hash,
  };
}

export async function castVote(signer, candidateId) {
  const contract = getWriteContract(signer);

  const tx = await contract.vote(candidateId);

  const receipt = await tx.wait();

  return {
    tx,
    receipt,
    hash: receipt.hash || tx.hash,
  };
}

// ======================================
// Explorer URLs
// ======================================

export const getExplorerTxUrl = (hash) => {
  return `${EXPLORER_URL}/tx/${hash}`;
};

export const getExplorerAddressUrl = (address) => {
  return `${EXPLORER_URL}/address/${address}`;
};

// ======================================
// Transaction Toast
// ======================================

export async function withTxToast(promise, messages = {}) {
  const toastId = toast.loading(
    messages.loading || "Waiting for transaction confirmation...",
  );

  try {
    const result = await promise;

    toast.success(messages.success || "Transaction confirmed!", {
      id: toastId,
    });

    return result;
  } catch (error) {
    console.error("TRANSACTION ERROR:", error);

    toast.error(
      error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "Transaction failed.",
      { id: toastId },
    );

    throw error;
  }
}
