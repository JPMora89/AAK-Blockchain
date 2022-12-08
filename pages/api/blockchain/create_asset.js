import { nftmarketInstance } from '../../contractInstance/contractInstance'
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
    let eventName = await response.wait()
    res.status(200).json({ msg: 'Success', event: eventName.events[1].event })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
