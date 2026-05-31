require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      // Add your private key here for deployment:
      // accounts: [process.env.PRIVATE_KEY],
      gasPrice: "auto",
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
};
