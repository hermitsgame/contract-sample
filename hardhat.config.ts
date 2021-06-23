import "@nomiclabs/hardhat-waffle";

export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    }
  },
  solidity: {
    version: "0.7.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000
      },
      evmVersion: "petersburg"
    }
  }
};
