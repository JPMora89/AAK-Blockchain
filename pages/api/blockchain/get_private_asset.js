import { nftmarketInstance } from '../../../helpers/contractInstance/contractInstanceV1'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    let lowerBoundary = 0
    let allhashesLength =
      (await nftmarketInstance.getAllHashesLength()).toNumber() - 1
    let { asset_id, metamask_id } = req.query
    let data = await nftmarketInstance.getAllMarketItem(
      lowerBoundary,
      allhashesLength
    )
    let tempData = data
      .filter((d) => {
        //assetId, assetOwnerId, isprivate
        if (d[0].toNumber() == asset_id && metamask_id == d[5] && d[15]) {
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
    res.status(200).json({ success: true, data: tempData })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
