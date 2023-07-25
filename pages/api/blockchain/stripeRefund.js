import Stripe from "stripe";
import corsMiddleware, { runMiddleware } from "../../../middleware/middleware";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req,res){
	await runMiddleware(req, res, corsMiddleware);
	if(req.method == 'POST'){
		try{
     const sessionId = req.body.sessId
		 const session = await stripe.checkout.sessions.retrieve(
          sessionId
        );
        const paymentIndentId = await session.payment_intent;
        const refund = await stripe.refunds.create({
          payment_intent: paymentIndentId,
        });
		 res.status(200).json({ message : 'Refund Initiated'})
		}
		catch(error){
     console.log(error)
		}
	}
}