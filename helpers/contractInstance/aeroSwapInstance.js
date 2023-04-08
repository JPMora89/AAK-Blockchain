import { ethers } from 'ethers';
//import Web3Modal from 'web3modal';
import path from 'path';
import fs from 'fs';
import aeroSwapAddress from '../../config';
require("dotenv").config({ path: path.resolve(__dirname, '.env.local') })

export const infuraId = `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`

console.log(process.env.NEXT_PUBLIC_INFURA_KEY)

export const provider = new ethers.providers.StaticJsonRpcProvider(infuraId)
const signer = new ethers.Wallet(process.env.NEXT_PRIVATE_KEY, provider)


const aeroSwapContractAbi = () => {
    try {
      const dir = path.resolve(
        './',
        './artifacts/contracts/Aero-swap.sol/AeroSwap.json'
      )
      const file = fs.readFileSync(dir, 'utf8')
      const json = JSON.parse(file)
      const abi = json.abi
      return abi
    } catch (e) {
      console.log(`e`, e)
    }
  }

  const aeroContractAbi = () => {
    try {
      const dir = path.resolve(
        './',
        './artifacts/contracts/v2/Aero.sol/Aero.json'
      )
      const file = fs.readFileSync(dir, 'utf8')
      const json = JSON.parse(file)
      const abi = json.abi
      return abi
    } catch (e) {
      console.log(`e`, e)
    }
  }


  // export const createAeroSwapInstance = new ethers.Contract(
  //   aeroSwapAddress,
  //   aeroSwapContractAbi(),
  //   signer
  // )

  export const createAeroSwapInstance = (contractAddress, signer) => {
    return new ethers.Contract(
      contractAddress,
      aeroSwapContractAbi(),
      signer
    );
  }

  // export const createAeroInstance = (contractAddress, signer) => {
  //   return new ethers.Contract(
  //     contractAddress,
  //     aeroContractAbi(),
  //     signer
  //   );
  // }
  