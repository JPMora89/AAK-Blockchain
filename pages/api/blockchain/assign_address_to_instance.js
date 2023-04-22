import { nftmarketInstance } from '../../../helpers/contractInstance/contractInstanceV1'
import { nftaddress, aeroaddress } from '../../../config'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    let data = await nftmarketInstance.assignDeployedAddressToInstance(
      nftaddress,
      aeroaddress
    )
    res.status(200).json({ msg: 'Success', data })
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
