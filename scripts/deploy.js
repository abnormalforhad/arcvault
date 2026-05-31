const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const USDC = "0x3600000000000000000000000000000000000000";
  const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

  // 1. Deploy ArcVault
  console.log("\n--- Deploying ArcVault ---");
  const Vault = await hre.ethers.getContractFactory("ArcVault");
  const vault = await Vault.deploy(USDC);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("ArcVault deployed to:", vaultAddr);

  // 2. Deploy ArcSwap
  console.log("\n--- Deploying ArcSwap ---");
  const Swap = await hre.ethers.getContractFactory("ArcSwap");
  const swap = await Swap.deploy(USDC, EURC);
  await swap.waitForDeployment();
  const swapAddr = await swap.getAddress();
  console.log("ArcSwap deployed to:", swapAddr);

  // 3. Deploy ArcNFT
  console.log("\n--- Deploying ArcNFT ---");
  const NFT = await hre.ethers.getContractFactory("ArcNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddr = await nft.getAddress();
  console.log("ArcNFT deployed to:", nftAddr);

  console.log("\n═══════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log("  VAULT: '" + vaultAddr + "',");
  console.log("  SWAP:  '" + swapAddr + "',");
  console.log("  NFT:   '" + nftAddr + "',");
  console.log("═══════════════════════════════════════");
  console.log("\nUpdate src/config/contracts.js with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
