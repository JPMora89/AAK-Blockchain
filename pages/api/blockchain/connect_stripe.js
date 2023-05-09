import Stripe from 'stripe';
import connectSchema from './stripeConnectSch';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {routingNumber, accountNumber,accountHolderName,emailId } = req.body;
      
      let recipientAccountId
        // Create a Custom account for the recipient
        const customAccount = await stripe.accounts.create({
          type: 'custom',
          country: 'US', 
          capabilities: {card_payments: {requested: true}, transfers: {requested: true}},
          business_type:'individual'
        });

         recipientAccountId = customAccount.id;
       
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


    // Add the recipient's bank account details
      await stripe.accounts.createExternalAccount(recipientAccountId, {
          external_account: recepientBankAccountToken.id
        });

        const accountLink = await stripe.accountLinks.create({
          account: recipientAccountId,
          refresh_url: 'http://localhost:3000/create_connected_stripe_account',
          return_url: 'http://localhost:3000/aak-swap',
          type: 'account_onboarding',
          collect:'eventually_due'
        });
        
        console.log("url",accountLink.url)
        const sessionUrl = accountLink.url

        const receipent = new connectSchema({
          recipientAccountId,
          emailId,
          accountHolderName
        })
       await receipent.save()
       res.status(200).json({ sessionUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while initiating the payout.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
