import path from 'path'
import dotenv from 'dotenv'
import { nftmarketInstance } from '../../../helpers/contractInstance/contractInstanceV1'
dotenv.config({ path: path.resolve(__dirname, '.env') })

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      asset_id,
      permissions
    } = req.body
    if (
      asset_id === null || asset_id === undefined ||
      permissions === null || permissions === undefined
    ) {
      res.status(400).json({ msg: 'Bad request' })
    }

    const sharedAddrs = [], values = [];
    Object.keys(permissions).forEach((key) => {
      sharedAddrs.push(key);
      values.push(permissions[key]);
    });

    console.log(sharedAddrs);
    console.log(values);

    try {
      const transaction = await nftmarketInstance.functions.setSharedAddress(asset_id, sharedAddrs, values);
      await transaction.wait();
      const timestamp = new Date().getTime()
      res.status(200).json({
        success: true,
        tx_hash: transaction.transactionHash,
        share_at: timestamp,
      })
    } catch (ex) {
      res.status(500).json({
        success: false,
        msg: ex.reason
      })
    }
  } else {
    res.status(400).json({ msg: 'Bad request' })
  }
}
