require("@nomicfoundation/hardhat-toolbox");
const dotenv = require('dotenv');
dotenv.config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {},
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
      gas: 1100000,
      gasPrice: 1000000,
      //3000000000
      chainId: 5,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: {
      url: "https://polygon-testnet.public.blastapi.io",
      chainId: 80001,
      gas: 4100000,
      gasPrice: 60000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    fuji: {
      url: "https://ava-testnet.public.blastapi.io/ext/bc/C/rpc",
      chainId: 43113,
      gas: 4100000,
      gasPrice: 60000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    fantomtest: {
      gas: 21,
      gasPrice: 350,
      saveDeployments: true,
      url: process.env.FANTOM_TESTNET_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
