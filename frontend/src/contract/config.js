// ======================================
// Smart Contract Configuration
// ======================================

import VotingSystemABI from "./VotingSystem.json";

/**
 * Deployed VotingSystem contract address on Polygon Amoy testnet.
 * See smart-contract/deployments/amoy.json
 */
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xB9896615A001F152979904fFc29884FFcB3F70cd";

export const ABI = VotingSystemABI;

/** Polygon Amoy chain id */
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 80002);

export const RPC_URL =
  import.meta.env.VITE_RPC_URL || "https://polygon-amoy.drpc.org";

/** Ordered fallback RPCs (tried in sequence if the primary fails). */
export const RPC_URLS = [
  import.meta.env.VITE_RPC_URL || "https://polygon-amoy.drpc.org",
  "https://polygon-amoy-bor-rpc.publicnode.com",
];

export const EXPLORER_URL =
  import.meta.env.VITE_EXPLORER_URL || "https://amoy.polygonscan.com";

/**
 * MetaMask requires the chain id as a 0x-prefixed hex string.
 */
export const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

/**
 * Network metadata used to add Polygon Amoy automatically
 * when it is not present in the user's wallet.
 */
export const AMOY_NETWORK = {
  chainId: CHAIN_ID_HEX,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [EXPLORER_URL],
};

/**
 * Contract lifecycle states (must match VotingSystem.sol enum order).
 */
export const ELECTION_STATES = {
  0: "Registration",
  1: "Active",
  2: "Ended",
};

/** Human-readable labels for election states. */
export const STATE_LABELS = {
  Registration: "Registration",
  Active: "Active",
  Ended: "Ended",
};
export const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS;
