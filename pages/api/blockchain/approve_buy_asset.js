import path from 'path'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import approveBuyAssetHelper from '../../../helpers/scripts/approveBuyAsset'
import {
  nftmarketInstance,
  aeroInstance,
  provider,
} from '../../../helpers/contractInstance/contractInstanceV2'

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
      r,
      s,
      v,
      asset_file,
      asset_image,
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
    const { vE, rE, sE, vN, rN, sN } = await approveBuyAssetHelper(
      buyer_metamask_id,
      asset_id
    )
    const deadline = ethers.constants.MaxUint256
    const nonce = await aeroInstance.nonces(buyer_metamask_id)
    const data = await nftmarketInstance.buyAssetApprove(
      project_owner_metamask_id,
      asset_id,
      vE,
      rE,
      sE,
      deadline,
      nonce,
      vN,
      rN,
      sN,
      { gasLimit: 5000000 }
    )
    // const timestamp = (await provider.getBlock(data.blockNumber)).timestamp
    const timestamp = new Date().getTime()
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
