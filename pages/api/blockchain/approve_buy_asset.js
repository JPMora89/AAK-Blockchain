import path from 'path'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import {
  nftmarketInstance,
  aeroInstance,
  nftv2Instance,
} from '../../contractInstance/contractInstance'
import { nftmarketaddress, nftaddress, aeroaddress } from '../../../configV2'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      new_env,
      user_id,
      buyer_username,
      buyer_name,
      buyer_metamask_id,
      project_owner_metamask_id,
      asset_id,
    } = req.body
    if (
      user_id === null ||
      buyer_username === null ||
      buyer_name === null ||
      buyer_metamask_id == null ||
      asset_id === null ||
      project_owner_metamask_id === null ||
      r === null ||
      s === null ||
      v === null
    ) {
      res.status(400).json({ msg: 'Bad request' })
    }
    const infuraId = `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
    const provider = new ethers.providers.StaticJsonRpcProvider(infuraId)
    const network = await provider.getNetwork()
    const chainId = network.chainId

    const domainData = {
      name: 'Aero',
      version: '1',
      chainId: chainId,
      verifyingContract: aeroaddress,
    }
    const deadline = ethers.constants.MaxUint256
    const nonce = await aeroInstance.nonces(project_owner_metamask_id)

    // The named list of all type definitions
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

    const result = await buyer_metamask_id._signTypedData(
      domainData,
      types,
      value
    )
    let sig = ethers.utils.splitSignature(result)
    const { v, r, s } = sig

    //<-------ERC721 Permit----------->
    console.log('<-------ERC721 Permit----------->')
    const ERC721_Nonce = await nftv2Instance.nonces(asset_id)

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
      tokenId: asset_id,
      nonce: ERC721_Nonce.toHexString(),
      deadline: deadline,
    }

    const domainDataNFT = {
      name: 'AAK Metamarket',
      version: '1',
      chainId: chainId,
      verifyingContract: nftmarketaddress,
    }

    const resultNFT = await project_owner_metamask_id._signTypedData(
      domainDataNFT,
      ERC721_TYPE,
      ERC721_VALUE
    )
    let sigNft = ethers.utils.splitSignature(resultNFT)
    const { v: vN, r: rN, s: sN } = sigNft
    const data = await nftmarketInstance.buyAssetApprove(
      project_owner_metamask_id,
      asset_id,
      v,
      r,
      s,
      deadline,
      nonce,
      vN,
      rN,
      sN
    )
    const timestamp = (await provider.getBlock(data.blockNumber)).timestamp

    res.status(200).json({
      success: true,
      bought_at: timestamp,
      asset_url: asset_file,
      image_url: asset_image,
    })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
