import Stripe from "stripe";
import corsMiddleware, { runMiddleware } from "../../../middleware/middleware";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15'
  });
  
  export default async function handler(req, res) {
    await runMiddleware(req, res, corsMiddleware);
    if (req.method === 'POST') {
        try {
          const {amount,connectAccountId} = req.body;
          console.log(amount, connectAccountId)
          const transfer = await stripe.transfers.create({
            amount: amount,
            currency: 'usd',
            destination: connectAccountId,
          });
          console.log(transfer)
          const sessionId = transfer.id
          res.status(200).json({sessionId})
        }
        catch(error){
          res.status(500).json({message:'Something went wrong'})
          console.log(error)
        }
    }

  }
