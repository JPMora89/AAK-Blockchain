import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function CreateConnectedStripeAccount(){
    const [routingNumber, setRoutingNumber] = useState();
    const[accountNumber, setAccountNumber] = useState();
    const [name, setName] = useState();
    const[emailId, setEmailId]= useState();
  
    const connectdata ={
       routingNumber: routingNumber,
       accountNumber: accountNumber,
       accountHolderName: name,
       emailId: emailId
    }
    //Connecting user's account to AAK's connect and storing user details in DB
    const handleConnect=async()=>{
        const response = await fetch('/api/blockchain/connect_stripe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(connectdata)
          });
      
          const { sessionUrl } = await response.json();
          console.log("sessionUrl", sessionUrl)
          window.location.href = sessionUrl
    }

   return(
    <>
      <div className="mt-2 border rounded p-4" style={{ border: 'solid black 3px', margin: '1% 23%', width: '50%', padding: '3%', }}>
          <h2><b>Know the process:</b></h2><br />
          <p>
            * Please ensure that you provide the correct details below. The USD equivalent of your AERO will be transferred to the account you provide.<br/>
            * After submitting the form, you will be redirected to the Stripe page where you will need to provide additional information. Please ensure that you provide accurate information.<br/>
            * Once the process is complete, you will be redirected back to the Aero-swap page where you can initiate the sell process after 5 minutes.<br/>
            * After completing the process, please select 'NO' when asked if you are selling AERO with us for the first time.
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