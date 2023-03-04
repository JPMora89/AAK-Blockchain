import { nftmarketInstance } from '../../../helpers/contractInstance/contractInstance'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { asset_id, metamask_id, new_env } = req.query
    if (asset_id === null || metamask_id === null || new_env === null) {
      res.status(400).json({ msg: 'Bad request' })
    }
    let lowerBoundary = 0
    let allhashesLength =
      (await nftmarketInstance.getAllHashesLength()).toNumber() - 1
    let data = await nftmarketInstance.getAllMarketItem(
      lowerBoundary,
      allhashesLength
    )
    let tempData = ''
    tempData = data
      .filter((d) => {
        // creator metamask id
        if (metamask_id == d[5]) {
          return d
        }
      })
      .map((d) => ({
        asset_id: d[0].toNumber(),
        new_env: d[1],
        owner_user_id: d[2].toNumber(),
        owner_username: d[3],
        owner_name: d[4],
        owner_metamask_id: d[5],
        associated_project_name: d[6],
        associated_project_url: d[7],
        asset_name: d[8],
        asset_type: d[9],
        asset_description: d[10],
        asset_file_name: d[11],
        asset_terms: d[12],
        asset_url: d[13],
        image_url: d[13],
        asset_price: d[17].toNumber(),
        for_sale: d[18],
        created_at: '',
        bought_at: '',
        request_approval: d[19],
      }))
    if (tempData.length == 0) {
      tempData = data
        .filter((d) => {
          // not private
          if (!d[15]) {
            return d
          }
        })
        .map((d) => ({
          asset_id: d[0].toNumber(),
          new_env: d[1],
          owner_user_id: d[2].toNumber(),
          owner_username: d[3],
          owner_name: d[4],
          owner_metamask_id: d[5],
          associated_project_name: d[6],
          associated_project_url: d[7],
          asset_name: d[8],
          asset_type: d[9],
          asset_description: d[10],
          asset_file_name: d[11],
          asset_terms: d[12],
          asset_url: d[13],
          image_url: d[13],
          asset_price: d[17].toNumber(),
          for_sale: d[18],
          created_at: '',
          bought_at: '',
          request_approval: d[19],
        }))
    }
    res.status(200).json({ success: true, data: tempData })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
