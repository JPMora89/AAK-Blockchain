// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";

export default function SellAeroWithUsd(){
  // const [recipientId, setRecipientId] = useState('');
  // const [routingNumber, setRoutingNumber] = useState('');
  // const [accountNumber, setAccountNumber] = useState('')
  // const [emailId , setEmailId] = useState('')
  // const [ttlUsd, setTtlUsd]=useState()
  // const router = useRouter();
  // const { numberOfTokens } = router.query;
  // const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  
  // useEffect(()=>{
  //   totalUSD()
  // },[])

  // const handlePayout = async () => {
  //   const stripe = await stripePromise;
  //   const total = await totalCalcualtion()
  //   const ttl = numberOfTokens * total;
  //   const totalPayout =Math.round(ttl*100)
  //   console.log(totalPayout)

  //   let payoutData = {
  //     amount: totalPayout,
  //   };

  //   if (recipientId) {
  //     payoutData.recipientId = recipientId;
  //   } else {
  //     payoutData.routingNumber = routingNumber;
  //     payoutData.accountNumber = accountNumber;
  //     payoutData.emailId = emailId;
  //   }

  //   const response = await fetch('/api/blockchain/sell_aero_usd', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(payoutData)
  //   });

  //   const { sessionId } = await response.json();
  //   console.log("sessionId", sessionId)
  //   if (sessionId) {
  //     // Redirect the user to the Stripe Checkout page
  //     const { error } = await stripe.redirectToCheckout({
  //       sessionId
  //     });

  //     if (error) {
  //       console.error(error);
  //     }
  //   }
  // };

  // const totalUSD=()=>{
  //   const amt = totalCalcualtion();
  //   if(numberOfTokens==0||numberOfTokens==undefined||numberOfTokens==''){
  //     setTtlUsd(0)
  //   }else{
  //   const totalUsd = numberOfTokens * amt;
  //   setTtlUsd(totalUsd)
  //   }
  // }

  // const totalCalcualtion=()=>{
  //   const pricePerToken = 1.68;
  //   const tokenfee = 3;
  //   const total = pricePerToken - (pricePerToken* (tokenfee/100));
  //   return total
  // }
  //   return(
  //      <>
  //       <h3 style={{margin:'1% 15%'}}><b>Please enter the following details to proceed with selling Aeros</b></h3><br/>
  //     <div className="mt-2 border rounded p-4" style={{ border: 'solid black 3px', margin: '1% 15%', width: '70%', padding: '3%', }}>
     
  //     <h4><b>AER You are selling:</b> {numberOfTokens} AER</h4><br/>
  //     <h4><b>USD you receive:</b> {ttlUsd} USD</h4><br/>
  //     <div>
  //       <label>Stripe Account ID:</label>
  //       <input type="text" className="mt-2 border rounded p-4" value={recipientId} onChange={(e) => setRecipientId(e.target.value)}  placeholder="Your Stripe Account Id"/>
  //     </div><br/>
  //       <h3><b>Don't have a stripe account enter the following details</b></h3><br/>
  //       <hr style={{}}/>
  //     {!recipientId && (
  //       <div>
  //         <label>Bank Routing Number:  </label>
  //         <input type="text" className="mt-2 border rounded p-4" onChange={(e) => setRoutingNumber(e.target.value)}/><br/>

  //         <label>Bank Account Number:  </label>
  //         <input type="text" className="mt-2 border rounded p-4" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /><br/>

  //         <label>Email Id:  </label>
  //         <input type="text" className="mt-2 border rounded p-4" value={emailId} onChange={(e) => setEmailId(e.target.value)} /><br/>
  //       </div>
  //     )}

  //     <button className="font-bold text-white rounded p-4 shadow-lg" style={{ backgroundColor: "#3079AB", marginTop: "2%" }} onClick={handlePayout}>Sell</button>
  //   </div>
  //      </>
  //   )
}