import Stripe from "stripe";
import corsMiddleware, { runMiddleware } from "../../../middleware/middleware";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req,res){
    await runMiddleware(req, res, corsMiddleware);
    if(req.method == 'POST'){
        try{
           // passing the total amount of the token Purchased
           const amount= req.body.amount;
           const quantity = req.body.numberOfTokensinNum;
        
           const session = await stripe.checkout.sessions.create({
               payment_method_types:['card'],
               line_items:[
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: amount,
                        product_data: {
                          name: 'AERO',
                          description: 'ERC20 token',
                        },
                      },
                      quantity: quantity,
                },
               ],
               mode: 'payment',
               success_url:`${process.env.NEXT_PUBLIC_HOST_URL}/buyAeroSuccess?status=true&quantity=${quantity}&sessionId={CHECKOUT_SESSION_ID}`,
               cancel_url:`${process.env.NEXT_PUBLIC_HOST_URL}/buyAeroFail`,
           })
           const sessionId = session.id;
        
           res.status(200).json({ sessionId : sessionId });
        }
        catch(error){
            res.status(500).json({ error: error.message });
            console.log(error)
        } 
    }
}