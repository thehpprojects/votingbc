// hardhat.config.js
// Hardhat configuration for the VotingSystem module.
// Targets the Polygon Amoy testnet (chainId 80002).

require("@nomicfoundation/hardhat-toolbox"); // bundles ethers, chai matchers, verify, etc.
require("dotenv").config(); // loads variables from .env

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOY_RPC_URL =
  process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    // Must be compatible with the pragma in VotingSystem.sol (^0.8.24)
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Local in-process network used by `npx hardhat test`
    hardhat: {},

    // Polygon Amoy testnet
    amoy: {
      url: AMOY_RPC_URL,
      // If PRIVATE_KEY is not set, the account list is empty and deployments
      // fail with a clear error instead of crashing the config.
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },

  // Contract verification on PolygonScan (optional, used by `hardhat verify`)
  etherscan: {
    apiKey: {
      amoy: POLYGONSCAN_API_KEY || "",
    },
    // Explicit chain definition so verification works regardless of
    // hardhat-verify's built-in chain list.
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
