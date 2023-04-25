import { ethers } from 'ethers'
import path from 'path'
import dotenv from 'dotenv'
import {
  provider,
  aeroInstance,
  nftmarketInstance,
} from '../contractInstance/contractInstanceV1'
import { nftmarketaddress, aeroAddress } from '../../config'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })
export default async function buyAssetHelper(buyer_metamask_id) {
  //project owner meta id
  //amount
  let amount = 1
  const deadline = ethers.constants.MaxUint256
  const nonce = await aeroInstance.nonces(buyer_metamask_id)
  const network = await provider.getNetwork()
  const chainId = network.chainId
  const domainData = {
    name: 'Aero',
    version: '1',
    chainId: chainId,
    verifyingContract: aeroAddress,
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
  const { v: vE, r: rE, s: sE } = sig
  let pendingTestData = [
    1,
    true,
    17,
    'john',
    'john',
    '0xEE0e7396caD7f2C0A5a31337452200AcbCAEE0a1',
    'Project',
    'ProjectUrl',
    'dummyAsset',
    1,
    'loreum',
    'loreum',
    'loreum',
    'loreum',
    false,
    false,
    false,
    100,
    1,
  ]

  const response = await nftmarketInstance.createAssetPending(pendingTestData)
  const event = (await response.wait()).events[0].args || {}
  const hash = event['assetPendingHash']
  return { vE, rE, sE, hash }
}
