import { ethers } from 'ethers'
import path from 'path'
import dotenv from 'dotenv'
import {
  provider,
  aeroInstance,
  nftv2Instance,
} from '../contractInstance/contractInstanceV1'
import { nftmarketaddress, aeroaddress } from '../../config'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })
export default async function buyAssetHelper(buyer_metamask_id, token_id) {
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
  const { v: vE, r: rE, s: sE } = sig

  //NFT
  const ERC721_Nonce = await nftv2Instance.nonces(token_id)
  const ERC721_TYPE = {
    Permit: [
      { name: 'spender', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  }

  const ERC721_VALUE = {
    spender: nftmarketaddress,
    tokenId: token_id,
    nonce: ERC721_Nonce.toHexString(),
    deadline: deadline,
  }

  const domainDataNFT = {
    name: 'AAK Metamarket',
    version: '1',
    chainId: chainId,
    verifyingContract: nftmarketaddress,
  }
  const signerNFT = new ethers.Wallet(process.env.NEXT_PRIVATE_KEY, provider)
  const resultNFT = await signerNFT._signTypedData(
    domainDataNFT,
    ERC721_TYPE,
    ERC721_VALUE
  )
  let sigNft = ethers.utils.splitSignature(resultNFT)
  const { v: vN, r: rN, s: sN } = sigNft
  return { vE, rE, sE, vN, rN, sN }
}
