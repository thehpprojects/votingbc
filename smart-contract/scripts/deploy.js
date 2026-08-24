// scripts/deploy.js
// Deploys VotingSystem. The deploying wallet automatically becomes the admin.
//
// Usage:
//   npx hardhat run scripts/deploy.js                 (local Hardhat network)
//   npx hardhat run scripts/deploy.js --network amoy  (Polygon Amoy testnet)

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) {
    console.error(
      "No deployer account found. Did you set PRIVATE_KEY in your .env file?",
    );
    process.exit(1);
  }

  console.log("Deploying VotingSystem with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "POL");

  if (hre.network.name === "amoy" && balance === 0n) {
    console.error(
      "Insufficient funds on Amoy. Get free test POL at https://faucet.polygon.technology/",
    );
    process.exit(1);
  }

  // Deploy (constructor takes no arguments — deployer becomes admin)
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const votingSystem = await VotingSystem.deploy();
  await votingSystem.waitForDeployment();

  const address = await votingSystem.getAddress();
  console.log("VotingSystem deployed to:", address);
  console.log("Admin (owner):", await votingSystem.owner());

  // Save the deployment info so other team modules (e.g. the frontend)
  // can pick up the address automatically.
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  const infoFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(
    infoFile,
    JSON.stringify(
      {
        network: hre.network.name,
        contractName: "VotingSystem",
        contractAddress: address,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log("Deployment info saved to:", infoFile);

  console.log(
    `\nNext steps:\n` +
      `  1. Add candidates (admin only) via console or your admin tooling.\n` +
      `  2. Verify the source code:\n` +
      `       npx hardhat verify --network ${hre.network.name} ${address}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
