import { nftmarketInstance } from '../../contractInstance/contractInstance'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    let { lowerBoundary, upperBoundary } = req.query
    let data = await nftmarketInstance.getAllMarketItem(
      lowerBoundary,
      upperBoundary
    )
    res.status(200).json({ msg: 'Success', data })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
