const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) {
    throw new Error(
      "No deployer account found. Check PRIVATE_KEY in your .env file.",
    );
  }

  console.log("Deploying ElectionFactory with:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Account balance:", hre.ethers.formatEther(balance), "POL");

  const Factory = await hre.ethers.getContractFactory("ElectionFactory");

  const factory = await Factory.deploy();

  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();

  console.log("\nElectionFactory deployed successfully!");
  console.log("Factory address:", factoryAddress);
  console.log("Factory owner:", await factory.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
