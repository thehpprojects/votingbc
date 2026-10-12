// ======================================
// Smart Contract Service (ethers.js v6)
// Multi-Election Compatible
// ======================================

import { ethers } from "ethers";
import toast from "react-hot-toast";

import {
  ABI,
  CONTRACT_ADDRESS,
  CHAIN_ID,
  CHAIN_ID_HEX,
  AMOY_NETWORK,
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

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No MetaMask account was selected.");
  }

  const address = accounts[0];

  const signer = await provider.getSigner(address);

  console.log("========== WALLET ==========");
  console.log("MetaMask accounts:", accounts);
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
// Contract Address Helper
// ======================================

/**
 * Returns the supplied election contract address,
 * or falls back to the original/default contract.
 */
export function resolveContractAddress(contractAddress) {
  const address = contractAddress || CONTRACT_ADDRESS;

  if (!address) {
    throw new Error("Voting contract address is not configured.");
  }

  try {
    return ethers.getAddress(address);
  } catch {
    throw new Error(`Invalid contract address: ${address}`);
  }
}

// ======================================
// Contract
// ======================================

export async function getReadContract(
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  const rpcProvider = provider || (await createReadProvider());

  const resolvedAddress = resolveContractAddress(contractAddress);

  return new ethers.Contract(resolvedAddress, ABI, rpcProvider);
}

export function getWriteContract(signer, contractAddress = CONTRACT_ADDRESS) {
  if (!signer) {
    throw new Error("Wallet signer is not available.");
  }

  const resolvedAddress = resolveContractAddress(contractAddress);

  return new ethers.Contract(resolvedAddress, ABI, signer);
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

export async function fetchCandidates(
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  const contract = await getReadContract(provider, contractAddress);

  const candidates = await contract.getAllCandidates();

  return candidates;
}

export async function fetchElectionStatus(
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  const contract = await getReadContract(provider, contractAddress);

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

export async function fetchResults(
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  const contract = await getReadContract(provider, contractAddress);

  const results = await contract.getResults();

  return {
    candidates: results[0],
    totalVotesCast: Number(results[1]),
    leadingCandidateId: Number(results[2]),
    hasClearLeader: results[3],
  };
}

export async function hasWalletVoted(
  address,
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  if (!address) return false;

  const contract = await getReadContract(provider, contractAddress);

  return await contract.hasVoted(address);
}

export async function fetchCandidateCount(
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  const contract = await getReadContract(provider, contractAddress);

  const count = await contract.getCandidateCount();

  return Number(count);
}

// ======================================
// OWNER
// ======================================

export async function fetchOwner(
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  const contract = await getReadContract(provider, contractAddress);

  const owner = await contract.owner();

  // Normalize address so comparison is reliable
  const normalizedOwner = ethers.getAddress(owner);

  console.log("========== CONTRACT OWNER ==========");
  console.log("Contract:", resolveContractAddress(contractAddress));
  console.log("Owner:", normalizedOwner);
  console.log("====================================");

  return normalizedOwner;
}

// ======================================
// GAS / FEE SETTINGS
// ======================================

/*
 * Polygon Amoy can reject a transaction when the priority fee
 * (gas tip cap) is below the network minimum.
 *
 * Your previous MetaMask error was:
 *
 *   Gas tip cap: 15000
 *   Minimum needed: 25000
 *
 * That corresponds to:
 *
 *   15 Gwei supplied
 *   25 Gwei minimum required
 *
 * This helper guarantees a minimum priority fee of 25 Gwei.
 */

export async function getAmoyFeeOverrides(signer) {
  if (!signer) {
    throw new Error("Wallet signer is not available.");
  }

  if (!signer.provider) {
    throw new Error("Wallet provider is not available.");
  }

  const provider = signer.provider;

  const feeData = await provider.getFeeData();

  const latestBlock = await provider.getBlock("latest");

  const baseFeePerGas = latestBlock?.baseFeePerGas || 0n;

  // Polygon Amoy RPC reported a minimum of 25 Gwei.
  const minimumPriorityFee = ethers.parseUnits("25", "gwei");

  // Use the network's suggested priority fee if it is
  // already above the minimum. Otherwise use 25 Gwei.
  const maxPriorityFeePerGas =
    feeData.maxPriorityFeePerGas &&
    feeData.maxPriorityFeePerGas > minimumPriorityFee
      ? feeData.maxPriorityFeePerGas
      : minimumPriorityFee;

  /*
   * Make sure maxFeePerGas is high enough to cover:
   *
   * base fee + priority fee
   */

  const calculatedMaxFee = baseFeePerGas + maxPriorityFeePerGas * 2n;

  const maxFeePerGas =
    feeData.maxFeePerGas && feeData.maxFeePerGas > calculatedMaxFee
      ? feeData.maxFeePerGas
      : calculatedMaxFee;

  console.log("========== GAS FEE ==========");
  console.log("Base fee:", ethers.formatUnits(baseFeePerGas, "gwei"), "Gwei");
  console.log(
    "Priority fee:",
    ethers.formatUnits(maxPriorityFeePerGas, "gwei"),
    "Gwei",
  );
  console.log("Max fee:", ethers.formatUnits(maxFeePerGas, "gwei"), "Gwei");
  console.log("=============================");

  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
  };
}

// ======================================
// WRITE FUNCTIONS
// ======================================

export async function addCandidate(
  signer,
  name,
  ipfsCid,
  contractAddress = CONTRACT_ADDRESS,
) {
  if (!signer) {
    throw new Error("Wallet signer is not available.");
  }

  if (!name || !name.trim()) {
    throw new Error("Candidate name cannot be empty.");
  }

  if (!ipfsCid || !ipfsCid.trim()) {
    throw new Error("IPFS metadata CID is empty.");
  }

  const resolvedAddress = resolveContractAddress(contractAddress);

  const contract = getWriteContract(signer, resolvedAddress);

  // ------------------------------------
  // Check connected wallet
  // ------------------------------------

  const walletAddress = await signer.getAddress();

  // ------------------------------------
  // Check contract owner
  // ------------------------------------

  const ownerAddress = await contract.owner();

  console.log("========== ADD CANDIDATE CHECK ==========");
  console.log("Contract:", resolvedAddress);
  console.log("Wallet:", walletAddress);
  console.log("Owner:", ownerAddress);

  // ------------------------------------
  // Check network
  // ------------------------------------

  const network = await signer.provider.getNetwork();

  console.log("Chain ID:", network.chainId.toString());
  console.log("Expected:", CHAIN_ID);

  if (network.chainId !== BigInt(CHAIN_ID)) {
    throw new Error(
      `Wrong network. Connected to chain ${network.chainId}. Expected Polygon Amoy (${CHAIN_ID}).`,
    );
  }

  // ------------------------------------
  // Check owner
  // ------------------------------------

  if (walletAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error(
      `Wrong admin wallet. Connected wallet ${walletAddress} is not the contract owner ${ownerAddress}.`,
    );
  }

  // ------------------------------------
  // Check election state
  // ------------------------------------

  const status = await contract.getElectionStatus();

  console.log("Election state:", Number(status[0]));
  console.log("Election state label:", status[1]);

  if (Number(status[0]) !== 0) {
    throw new Error(
      `Cannot add candidate. Election is currently in ${status[1]} state.`,
    );
  }

  // ------------------------------------
  // Simulate transaction
  // ------------------------------------

  console.log("Simulating addCandidate transaction...");

  await contract.addCandidate.staticCall(name.trim(), ipfsCid.trim());

  console.log("Simulation successful.");

  // ------------------------------------
  // Estimate gas
  // ------------------------------------

  const gasLimit = await contract.addCandidate.estimateGas(
    name.trim(),
    ipfsCid.trim(),
  );

  console.log("Estimated gas:", gasLimit.toString());

  // Add 20% safety margin
  const finalGasLimit = (gasLimit * 120n) / 100n;

  // ------------------------------------
  // Get correct Amoy fee settings
  // ------------------------------------

  const feeOverrides = await getAmoyFeeOverrides(signer);

  // ------------------------------------
  // Send transaction
  // ------------------------------------

  console.log("Sending addCandidate transaction...");

  const tx = await contract.addCandidate(name.trim(), ipfsCid.trim(), {
    gasLimit: finalGasLimit,
    ...feeOverrides,
  });

  console.log("Transaction submitted:", tx.hash);

  // ------------------------------------
  // Wait for confirmation
  // ------------------------------------

  const receipt = await tx.wait();

  console.log("Transaction confirmed:", receipt);

  return {
    tx,
    receipt,
    hash: tx.hash,
  };
}

// ======================================
// Start Election
// ======================================

export async function startElection(
  signer,
  contractAddress = CONTRACT_ADDRESS,
) {
  if (!signer) {
    throw new Error("Wallet signer is not available.");
  }

  const resolvedAddress = resolveContractAddress(contractAddress);

  const contract = getWriteContract(signer, resolvedAddress);

  const walletAddress = await signer.getAddress();
  const ownerAddress = await contract.owner();

  console.log("========== START ELECTION CHECK ==========");
  console.log("Contract:", resolvedAddress);
  console.log("Wallet:", walletAddress);
  console.log("Owner:", ownerAddress);

  // Check wallet is owner
  if (walletAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error(
      `Only the contract owner can start the election. Contract owner is ${ownerAddress}.`,
    );
  }

  // Check network
  const network = await signer.provider.getNetwork();

  console.log("Chain ID:", network.chainId.toString());
  console.log("Expected:", CHAIN_ID);

  if (network.chainId !== BigInt(CHAIN_ID)) {
    throw new Error(
      `Wrong network. Connected to chain ${network.chainId}. Expected Polygon Amoy (${CHAIN_ID}).`,
    );
  }

  // Get election status
  const status = await contract.getElectionStatus();

  console.log("Election state:", Number(status[0]));
  console.log("Election state label:", status[1]);
  console.log("Candidate count:", Number(status[5]));

  // Must be Registration
  if (Number(status[0]) !== 0) {
    throw new Error(`Election cannot be started. Current state: ${status[1]}.`);
  }

  // Contract requires at least one candidate
  if (Number(status[5]) === 0) {
    throw new Error("Cannot start election because there are no candidates.");
  }

  // Simulate first
  console.log("Simulating startElection...");

  await contract.startElection.staticCall();

  console.log("startElection simulation successful.");

  // Estimate gas
  const gasLimit = await contract.startElection.estimateGas();

  console.log("Estimated gas:", gasLimit.toString());

  // Get Amoy fee settings
  const feeOverrides = await getAmoyFeeOverrides(signer);

  // Send transaction
  const tx = await contract.startElection({
    gasLimit: (gasLimit * 120n) / 100n,
    ...feeOverrides,
  });

  console.log("Start election transaction:", tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();

  console.log("Start election confirmed:", receipt);

  return {
    tx,
    receipt,
    hash: tx.hash,
  };
}

// ======================================
// End Election
// ======================================

export async function endElection(signer, contractAddress = CONTRACT_ADDRESS) {
  if (!signer) {
    throw new Error("Wallet signer is not available.");
  }

  const resolvedAddress = resolveContractAddress(contractAddress);

  const contract = getWriteContract(signer, resolvedAddress);

  const walletAddress = await signer.getAddress();

  const ownerAddress = await contract.owner();

  if (walletAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error(
      `Only the contract owner can end the election. Owner: ${ownerAddress}`,
    );
  }

  const status = await contract.getElectionStatus();

  if (Number(status[0]) !== 1) {
    throw new Error(
      `Election cannot be ended because it is currently ${status[1]}.`,
    );
  }

  const feeOverrides = await getAmoyFeeOverrides(signer);

  const tx = await contract.endElection({
    ...feeOverrides,
  });

  const receipt = await tx.wait();

  return {
    tx,
    receipt,
    hash: tx.hash,
  };
}

// ======================================
// Cast Vote
// ======================================

export async function castVote(
  signer,
  candidateId,
  contractAddress = CONTRACT_ADDRESS,
) {
  if (!signer) {
    throw new Error("Wallet signer is not available.");
  }

  const resolvedAddress = resolveContractAddress(contractAddress);

  const contract = getWriteContract(signer, resolvedAddress);

  const walletAddress = await signer.getAddress();

  // ------------------------------------
  // Check election state
  // ------------------------------------

  const status = await contract.getElectionStatus();

  if (Number(status[0]) !== 1) {
    throw new Error(
      `Voting is not available. Election is currently ${status[1]}.`,
    );
  }

  // ------------------------------------
  // Check whether wallet already voted
  // ------------------------------------

  const alreadyVoted = await contract.hasVoted(walletAddress);

  if (alreadyVoted) {
    throw new Error("This wallet has already voted.");
  }

  // ------------------------------------
  // Check candidate ID
  // ------------------------------------

  const candidateCount = await contract.getCandidateCount();

  if (candidateId < 0 || BigInt(candidateId) >= candidateCount) {
    throw new Error("Invalid candidate ID.");
  }

  // ------------------------------------
  // Get fee settings
  // ------------------------------------

  const feeOverrides = await getAmoyFeeOverrides(signer);

  // ------------------------------------
  // Send vote transaction
  // ------------------------------------

  const tx = await contract.vote(candidateId, {
    ...feeOverrides,
  });

  const receipt = await tx.wait();

  return {
    tx,
    receipt,
    hash: tx.hash,
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

    const message =
      error?.reason ||
      error?.shortMessage ||
      error?.info?.error?.message ||
      error?.message ||
      "Transaction failed.";

    toast.error(message, {
      id: toastId,
    });

    throw error;
  }
}

// ======================================
// Admin Dashboard Compatibility
// ======================================

export const ELECTION_STATE = {
  REGISTRATION: 0,
  ACTIVE: 1,
  ENDED: 2,
};

// ======================================
// Legacy / Compatibility Functions
// ======================================

export async function fetchAllCandidates(
  provider = null,
  contractAddress = CONTRACT_ADDRESS,
) {
  return fetchCandidates(provider, contractAddress);
}

export async function registerCandidate(
  name,
  ipfsCid,
  contractAddress = CONTRACT_ADDRESS,
) {
  const { signer } = await connectWallet();

  return addCandidate(signer, name, ipfsCid, contractAddress);
}
