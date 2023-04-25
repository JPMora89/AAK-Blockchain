import { nftmarketInstance } from '../../../helpers/contractInstance/contractInstanceV1'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    let { lowerBoundary, upperBoundary } = req.query
    let data = await nftmarketInstance.getAllMarketItem(
      lowerBoundary,
      upperBoundary
    )
    res.status(200).json({ success: true, data })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
