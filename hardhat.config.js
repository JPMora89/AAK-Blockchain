require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const privateKey = process.env.PRIVATE_KEY;
const infuraId = process.env.INFURA_KEY;
const ETHERSCAN_API_KEY  = process.env.ETHERSCAN_API_KEY;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${infuraId}`,
      accounts: [`${privateKey}`],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraId}`,
      accounts: [`${privateKey}`],
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY
    }
  }
};
