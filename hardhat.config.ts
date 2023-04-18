import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-etherscan'
// require("@nomiclabs/hardhat-waffle");
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '.env') })

const privateKey = process.env.PRIVATE_KEY
const infuraId = process.env.INFURA_KEY
const alchemyId = process.env.ALCHEMY_KEY

// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
  //   hardhat: {
  //     chainId: 1337,
  //   },
  //   ropsten: {
  //     url: `https://ropsten.infura.io/v3/${infuraId}`,
  //     accounts: [`${privateKey}`],
  //   },
    // goerli: {
    //   url: `https://goerli.infura.io/v3/${infuraId}`,
    //   accounts: [`${privateKey}`],
    // },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`,
      accounts: [`${privateKey}`],
    },

    sepolia :{
      url:  `https://sepolia.infura.io/v3/${infuraId}`,
      accounts: [`${privateKey}`],
    }
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  // etherscan: {
  //   apiKey: {
  //     goerli: ETHERSCAN_API_KEY as string,
  //   },
  // },
  etherscan: {
    apiKey: "FUPPD5PFIQ9TQQS7IX562K1BECX3D56X8B"
  },
}

export default config
