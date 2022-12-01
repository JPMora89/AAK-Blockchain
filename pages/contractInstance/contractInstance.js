import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import { nftmarketaddress, nftaddress, aeroaddress } from '../../configV2'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const infuraId = `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`

const provider = new ethers.providers.StaticJsonRpcProvider(infuraId)
const signer = new ethers.Wallet(process.env.NEXT_PUBLIC_WALLET_KEY, provider)
const getTheMarketAbi = () => {
  try {
    const dir = path.resolve(
      './',
      './artifacts/contracts/v2/NFTMarketV2.sol/NFTMarketV2.json'
    )
    const file = fs.readFileSync(dir, 'utf8')
    const json = JSON.parse(file)
    const abi = json.abi
    return abi
  } catch (e) {
    console.log(`e`, e)
  }
}

export const nftmarketInstance = new ethers.Contract(
  nftmarketaddress,
  getTheMarketAbi(),
  signer
)
