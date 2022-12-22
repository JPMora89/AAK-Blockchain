import path from 'path'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import {
  nftmarketInstance,
  provider,
} from '../../contractInstance/contractInstance'
import { nftmarketaddress } from '../../../configV2'
import buyAssetHelper from '../../scripts/buyAsset'
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
      asset_file,
      asset_image,
      amount,
    } = req.body
    if (
      user_id === null ||
      buyer_username === null ||
      buyer_name === null ||
      buyer_metamask_id === null ||
      asset_id === null ||
      project_owner_metamask_id === null
    ) {
      res.status(400).json({ msg: 'Bad request' })
    }
    const deadline = ethers.constants.MaxUint256
    const { v, r, s } = await buyAssetHelper(buyer_metamask_id, amount)
    const data = await nftmarketInstance.buyAssetRequest(
      buyer_metamask_id,
      nftmarketaddress,
      amount,
      deadline,
      v,
      r,
      s,
      project_owner_metamask_id,
      asset_id,
      { gasLimit: 5000000 }
    )
    // const timestamp = (await provider.getBlock(data.blockNumber)).timestamp
    const timestamp = (new Date()).getTime()
    res.status(200).json({
      success: true,
      tx_hash: data.transactionHash,
      bought_at: timestamp,
      asset_url: asset_file,
      image_url: asset_image,
    })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
