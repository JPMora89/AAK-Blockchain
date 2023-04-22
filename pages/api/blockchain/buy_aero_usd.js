import Stripe from "stripe";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req,res){
    if(req.method == 'POST'){
        try{
           // passing the total amount of the token Purchased
           const amount= req.body.amount;
           // Create a new Checkout session with Stripe API
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
                      quantity: 1,
                },
               ],
               mode: 'payment',
               success_url:'http://localhost:3000',
               cancel_url:'http://localhost:3000',
           });
           res.status(200).json({ sessionId: session.id });
        }
        catch(error){
            res.status(500).json({ error: error.message });
            console.log(error)
        } 
    }
}