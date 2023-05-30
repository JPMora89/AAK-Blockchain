import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";
import Swal from "sweetalert2";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function CreateConnectedStripeAccount(){
    const [routingNumber, setRoutingNumber] = useState();
    const[accountNumber, setAccountNumber] = useState();
    const [name, setName] = useState();
    const[emailId, setEmailId]= useState();
    const [status, setStatus]= useState(false)

    //Creating stripe Connected account 
    const stripeConnectAccount=async(routingNumber, accountNumber,accountHolderName,emailId )=>{
      const stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15'
      });
      try {
        let recipientAccountId
          // Create a Custom account for the recipient
          const customAccount = await stripe.accounts.create({
            type: 'custom',
            country: 'US', 
            capabilities: {card_payments: {requested: true}, transfers: {requested: true}},
            business_type:'individual'
          });
  
           recipientAccountId = customAccount.id;
           console.log("recipientAccountId", recipientAccountId)

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
            refresh_url: `${process.env.NEXT_PUBLIC_HOST_URL}/create_connected_stripe_account`,
            return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/aak-swap`,
            type: 'account_onboarding',
            collect:'eventually_due'
          });
          
         const sessionUrl = accountLink.url

          console.log("sessionUrl", sessionUrl)

        if(sessionUrl){
          Swal.fire({
            title: 'Account Id',
            text:`${recipientAccountId} Save this account id ,it cannot be recovered later`,
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            denyButtonText: `Don't save`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              window.location.href = sessionUrl
            } 
          })
        }
        //   const receipent = new connectSchema({
        //     recipientAccountId,
        //     emailId,
        //     accountHolderName
        //   })
        //  await receipent.save()
      } catch (error) {
        console.error(error);
      }
    } 
    //Connecting user's account to AAK's connect and storing user details in DB
    const handleConnect=async()=>{
       await stripeConnectAccount(routingNumber, accountNumber, name, emailId) 
    }

   return(
    <>
      <div className="mt-2 border rounded p-4" style={{ border: 'solid black 3px', margin: '1% 23%', width: '50%', padding: '3%', }}>
          <h2><b>Know the process:</b></h2><br />
          <p>
            * Please ensure that you provide the correct details below. The USD equivalent of your AERO will be transferred to the account you provide.<br/>
            * After submitting the form, you will be redirected to the Stripe page where you will need to provide additional information. Please ensure that you provide accurate information.<br/>
            * Save the Account Id , it will be used for your future transactions.<br/>
            * Once the process is complete, you will be redirected back to the Aero-swap page where you can initiate the sell process after 5 minutes.<br/>
            * After completing the process, please select NO when asked if you are selling AERO with us for the first time.
          </p>
      </div>
      <div className="mt-2 border rounded p-4" style={{ border: 'solid black 3px', margin: '1% 23%', width: '50%', padding: '3%', }}>
          <label>Bank Routing Number:</label>
          <input type="text"  onChange={(e) => setRoutingNumber(e.target.value)} className="mt-2 border rounded p-4"/><br/>

          <label>Bank Account Number:</label>
          <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-2 border rounded p-4"/><br/>

          <label>Account holder name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 border rounded p-4"/><br/>

          <label>Email Id:</label>
          <input type="text" value={emailId} onChange={(e) => setEmailId(e.target.value)} className="mt-2 border rounded p-4"/><br/>

          <button className="font-bold text-white rounded p-4 shadow-lg" style={{ backgroundColor: "#3079AB", margin: "2%" }} onClick={handleConnect}><center>Submit</center></button>
        </div>
    </>
   )
}