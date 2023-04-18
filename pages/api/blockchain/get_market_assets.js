import { nftmarketInstance, asset_item } from '../../../helpers/contractInstance/contractInstanceV1'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const data = await nftmarketInstance.fetchMarketItems();

    const items =
      await Promise.all(
        data.map(async (i) => {
          console.log(i);
          return await asset_item(i);
        })
      );

    res.status(200).json({ success: true, data: items })

  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
