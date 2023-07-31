import Stripe from "stripe";
import corsMiddleware, { runMiddleware } from "../../../middleware/middleware";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);
  const routingNumber =req.body.routingNumber;
  const accountNumber = req.body.accountNumber;
  const accountHolderName = req.body.name;
  const emailId = req.body.emailId;

  if (req.method === "POST") {
     try{
      let recipientAccountId;
      // Create a Custom account for the recipient
      const customAccount = await stripe.accounts.create({
        type: 'custom',
        country: 'US', 
        capabilities: {card_payments: {requested: true}, transfers: {requested: true}},
        business_type:'individual'
      });

       recipientAccountId = customAccount.id;
       console.log("recipientAccountId", recipientAccountId)
       console.log("routingNumber",routingNumber);
       
       const recepientBankAccountToken = await stripe.tokens.create({
        bank_account: {
          country: 'US',
          currency: 'usd',
          account_holder_name: accountHolderName,
          account_holder_type: 'individual',
          routing_number: routingNumber,
          account_number: accountNumber,
        },
      });

      console.log("recepientBankAccountToken", recepientBankAccountToken)
      // Add the recipient's bank account details
      const externalAcc = await stripe.accounts.createExternalAccount(recipientAccountId, {
        external_account: recepientBankAccountToken.id
      });

      const accountLink = await stripe.accountLinks.create({
        account: recipientAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_HOST_URL}/createConnectAccount`,
        return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/aak-ventures/trade-aeros`,
        type: 'account_onboarding',
        collect:'eventually_due'
      });
      
       const sessionUrl = accountLink.url
       res.status(200).json({ sessionUrl: sessionUrl, recipientAccountId: recipientAccountId});
     }
     catch(error){
       console.log("error",error)
     }

	}
}