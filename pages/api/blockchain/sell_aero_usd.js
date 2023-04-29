import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27'
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, recipientId, routingNumber, accountNumber,emailId } = req.body;
      
      let recipientAccountId;
      
      if (recipientId) {
        recipientAccountId = recipientId;
      } else {
        // Create a Custom account for the recipient
        const account = await stripe.accounts.create({
          type: 'custom',
          country: 'US',
          email: emailId,
          capabilities: {
            card_payments: {requested: true},
            transfers: {requested: true},
          },
        });

        recipientAccountId = account.id;
        console.log("customAccount",account)
        // Add the recipient's bank account details
      await stripe.accounts.createExternalAccount(recipientAccountId, {
          external_account: {
            object: 'bank_account',
            country: 'US', 
            currency: 'usd',
            routing_number: routingNumber,
            account_number: accountNumber
          }
        });
      }
    
     // Create a payout to the recipient's account
      const payout = await stripe.payouts.create({
        amount,
        currency: 'usd',
        method: 'standard',
        destination: recipientAccountId
      });

      // // //Create a session ID to pass back to the client
      const sessionId = payout.id;

      res.status(200).json({ sessionId });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while initiating the payout.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
