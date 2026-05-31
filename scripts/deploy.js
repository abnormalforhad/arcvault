const { ethers } = require("hardhat");

async function main() {
  // USDC address on ARC Testnet — replace with actual deployed USDC address
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Circle USDC on testnet
  
  console.log("Deploying ArcVault to ARC Testnet...");
  console.log("USDC Address:", USDC_ADDRESS);
  
  const ArcVault = await ethers.getContractFactory("ArcVault");
  const vault = await ArcVault.deploy(USDC_ADDRESS);
  await vault.waitForDeployment();
  
  const address = await vault.getAddress();
  console.log("ArcVault deployed to:", address);
  console.log("\nUpdate src/config/contracts.js with this address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
