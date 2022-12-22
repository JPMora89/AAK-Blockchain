import {
  nftmarketInstance,
  provider,
} from '../../contractInstance/contractInstance'
import { ethers } from "ethers";
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      new_env,
      creator_user_id,
      creator_username,
      creator_name,
      creator_metamask_id,
      associated_project_name,
      associated_project_url,
      asset_name,
      asset_type,
      asset_description,
      asset_file,
      asset_terms,
      asset_image,
      hidden,
      privateAsset,
      multi_nft,
      asset_price,
      status,
      request_approval,
      tokenUri,
    } = req.body
    let user_url = ''

    if (
      new_env === null ||
      creator_user_id === null ||
      creator_username === null ||
      creator_name === null ||
      creator_metamask_id === null ||
      asset_name === null ||
      asset_type === null ||
      asset_description === null ||
      asset_file === null ||
      asset_image === null ||
      hidden === null ||
      privateAsset === null ||
      multi_nft === null ||
      asset_price === null ||
      request_approval === null
    ) {
      res.status(400).json({ msg: 'Bad request' })
    }
    let nftId = 0
    let data = [
      nftId,
      new_env,
      creator_user_id,
      creator_username,
      creator_name,
      creator_metamask_id,
      associated_project_name,
      associated_project_url,
      asset_name,
      asset_type,
      asset_description,
      asset_file,
      asset_terms,
      asset_image,
      hidden,
      privateAsset,
      multi_nft,
      asset_price,
      status,
      request_approval,
    ]
    //  if (new_env) {
    //    user_url = `https://web.aak-telescience.com/dashboard/${creator_username}`
    //  } else {
    //    user_url = `https://aaktelescience.com/profile/${creator_username}`
    //  }
    const response = await nftmarketInstance.functions.createAsset(
      data,
      tokenUri,
      { gasLimit: 5000000 }
    )

    let txReceipt = await response.wait()
    const timestamp = (new Date()).getTime()
    let abi = [ "event CreateAsset(bytes32 assetHash, uint256 assetId)" ];
    let iface = new ethers.utils.Interface(abi);
    
    // const timestamp = (await provider.getBlock(txReceipt.blockNumber)).timestamp
    res.status(200).json({
      success: true,
      tx_hash: txReceipt.transactionHash,
      created_at: timestamp,
      asset_url: asset_file,
      image_url: asset_image,
      asset_id: iface.decodeEventLog("CreateAsset", txReceipt.events[1].data, txReceipt.events[1].topics)[0].assetHash,
      request_approval: request_approval,
    })
  } else {
    res.status(400).json({ success: false, msg: 'Bad request' })
  }
}
