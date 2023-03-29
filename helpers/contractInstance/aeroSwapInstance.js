import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

export const infuraId = `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`

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

  export const aeroSwapInstance = new ethers.Contract(
    nftaddress,
    aeroSwapContractAbi(),
    signer
  )
  