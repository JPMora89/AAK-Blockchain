import path from 'path'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import approvePendingAssetHelper from '../../scripts/approvePendingAsset'
import {
  nftmarketInstance,
  provider,
} from '../../contractInstance/contractInstance'
import { nftmarketaddress } from '../../../configV2'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      new_env,
      buyer_user_id,
      buyer_username,
      buyer_name,
      buyer_metamask_id,
      project_owner_metamask_id,
      asset_id,
      asset_file,
      asset_image,
      r,
      s,
      v,
      request_approval,
      amount,
      tokenUri,
    } = req.body
    if (
      new_env === null ||
      buyer_user_id === null ||
      buyer_username === null ||
      buyer_name === null ||
      buyer_metamask_id === null ||
      project_owner_metamask_id === null ||
      asset_id === null ||
      asset_file === null ||
      r === null ||
      s === null ||
      v === null ||
      request_approval === null
    ) {
      res.status(400).json({ msg: 'Bad request' })
    }
    const deadline = ethers.constants.MaxUint256
    const { vE, rE, sE, hash } = await approvePendingAssetHelper(
      buyer_metamask_id
    )

    const data = await nftmarketInstance.approvePendingAsset(
      hash,
      tokenUri,
      buyer_metamask_id,
      nftmarketaddress,
      project_owner_metamask_id,
      amount,
      deadline,
      vE,
      rE,
      sE,
      { gasLimit: 5000000 }
    )
    const blockNumber = await provider.getBlockNumber()
    const timestamp = (await provider.getBlock(blockNumber)).timestamp
    res.status(200).json({
      success: true,
      asset_url: asset_file,
      image_url: asset_image,
      created_at: timestamp,
      bought_at: timestamp || null,
    })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
