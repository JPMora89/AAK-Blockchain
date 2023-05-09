import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15'
  });
  
  export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
          const {amount,connectAccountId} = req.body;
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