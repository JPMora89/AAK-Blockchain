import { nftmarketInstance, nftInstance, asset_item } from '../../../../helpers/contractInstance/contractInstanceV1'
import { ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const asset_id = req.query.id;
    try {
      const data = await nftmarketInstance.fetchMarketItemById(ethers.BigNumber.from(asset_id));
      let item = await asset_item(data);
      res.status(200).json({ success: true, data: item })
    } catch (e) {
      res.status(500).json({ msg: e })
    }
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
