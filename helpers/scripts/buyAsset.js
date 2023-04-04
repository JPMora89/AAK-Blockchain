import { ethers } from 'ethers'
import path from 'path'
import dotenv from 'dotenv'
import { provider, aeroInstance } from '../contractInstance/contractInstanceV2'
import { nftmarketaddress, aeroaddress } from '../../configV2'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })
export default async function buyAssetHelper(buyer_metamask_id, amount) {
  //project owner meta id
  //amount

  const deadline = ethers.constants.MaxUint256
  const nonce = await aeroInstance.nonces(buyer_metamask_id)
  const network = await provider.getNetwork()
  const chainId = network.chainId
  const domainData = {
    name: 'Aero',
    version: '1',
    chainId: chainId,
    verifyingContract: aeroaddress,
  }
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  }

  // The data to sign
  const value = {
    owner: buyer_metamask_id,
    spender: nftmarketaddress,
    value: amount.toString(),
    nonce: nonce.toHexString(),
    deadline,
  }

  const signer = new ethers.Wallet(process.env.NEXT_PRIVATE_KEY, provider)
  const result = await signer._signTypedData(domainData, types, value)
  let sig = ethers.utils.splitSignature(result)
  const { v, r, s } = sig
  return { v, r, s }
}
