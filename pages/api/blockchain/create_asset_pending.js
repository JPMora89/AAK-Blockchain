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
    } = req.body
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
      status === null ||
      request_approval === null
    ) {
      res.status(400).json({ msg: 'Bad request' })
    }
    let data = [
      '0',
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
    let response = await nftmarketInstance.functions.createAssetPending(data)
    let event = await response.wait()
    res.status(200).json({ msg: 'Success', event: event.events[0].event })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
