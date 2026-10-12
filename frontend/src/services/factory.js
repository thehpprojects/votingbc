import { ethers } from "ethers";
import FactoryABI from "../contract/ElectionFactory.json";

const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS;

async function getAmoyFeeOverrides(signer) {
  if (!signer) {
    throw new Error("Signer is required.");
  }

  const provider = signer.provider;

  if (!provider) {
    throw new Error("Signer provider is unavailable.");
  }

  const feeData = await provider.getFeeData();

  let baseFeePerGas = 0n;

  try {
    const latestBlock = await provider.getBlock("latest");
    baseFeePerGas = latestBlock?.baseFeePerGas ?? 0n;
  } catch {
    baseFeePerGas = 0n;
  }

  // Amoy RPC currently requires at least 25 Gwei priority fee.
  const minimumPriorityFee = ethers.parseUnits("25", "gwei");

  const providerPriorityFee = feeData.maxPriorityFeePerGas ?? 0n;

  const providerMaxFee = feeData.maxFeePerGas ?? 0n;

  const maxPriorityFeePerGas =
    providerPriorityFee > minimumPriorityFee
      ? providerPriorityFee
      : minimumPriorityFee;

  const calculatedMaxFee = baseFeePerGas + maxPriorityFeePerGas * 2n;

  const maxFeePerGas =
    providerMaxFee > calculatedMaxFee ? providerMaxFee : calculatedMaxFee;

  console.log("Amoy fee overrides:", {
    baseFeePerGas: ethers.formatUnits(baseFeePerGas, "gwei"),
    maxPriorityFeePerGas: ethers.formatUnits(maxPriorityFeePerGas, "gwei"),
    maxFeePerGas: ethers.formatUnits(maxFeePerGas, "gwei"),
  });

  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
  };
}

export async function createElection(signer, name, category) {
  if (!signer) {
    throw new Error("Wallet is not connected.");
  }

  if (!FACTORY_ADDRESS) {
    throw new Error("VITE_FACTORY_ADDRESS is missing.");
  }

  const cleanName = name?.trim();
  const cleanCategory = category?.trim();

  if (!cleanName) {
    throw new Error("Election name is required.");
  }

  if (!cleanCategory) {
    throw new Error("Election category is required.");
  }

  const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryABI.abi, signer);

  console.log("Factory address:", FACTORY_ADDRESS);
  console.log("Creating election:", {
    name: cleanName,
    category: cleanCategory,
  });

  // Check that the transaction can execute before asking MetaMask.
  await factory.createElection.staticCall(cleanName, cleanCategory);

  // Estimate the actual Factory transaction.
  const gasEstimate = await factory.createElection.estimateGas(
    cleanName,
    cleanCategory,
  );

  // Give the deployment transaction a safety margin.
  const gasLimit = (gasEstimate * 120n) / 100n;

  console.log("Factory gas estimate:", gasEstimate.toString());

  console.log("Factory gas limit:", gasLimit.toString());

  const feeOverrides = await getAmoyFeeOverrides(signer);

  console.log("Sending Factory transaction with fee overrides.");

  const tx = await factory.createElection(cleanName, cleanCategory, {
    gasLimit,
    ...feeOverrides,
  });

  console.log("Create election transaction:", tx.hash);

  const receipt = await tx.wait();

  console.log("Election creation confirmed:", receipt.hash);

  let createdAddress = null;

  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log);

      if (parsed?.name === "ElectionCreated") {
        createdAddress = parsed.args.electionAddress;
        break;
      }
    } catch {
      // Ignore logs from other contracts.
    }
  }

  if (!createdAddress) {
    throw new Error("Election address was not found in the transaction.");
  }

  return {
    address: createdAddress,
    transactionHash: receipt.hash,
  };
}

export async function getAllElections(provider) {
  if (!provider) {
    throw new Error("Provider is required.");
  }

  if (!FACTORY_ADDRESS) {
    throw new Error("VITE_FACTORY_ADDRESS is missing.");
  }

  const factory = new ethers.Contract(
    FACTORY_ADDRESS,
    FactoryABI.abi,
    provider,
  );

  return factory.getAllElections();
}

export async function getElectionCount(provider) {
  if (!provider) {
    throw new Error("Provider is required.");
  }

  if (!FACTORY_ADDRESS) {
    throw new Error("VITE_FACTORY_ADDRESS is missing.");
  }

  const factory = new ethers.Contract(
    FACTORY_ADDRESS,
    FactoryABI.abi,
    provider,
  );

  return factory.getElectionCount();
}
