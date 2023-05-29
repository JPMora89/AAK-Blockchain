import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { aeroSwapUsdAddress } from "../config";
import AeroSwapUsdAbi from "../artifacts/contracts/Aero-swap-usd.sol/AeroSwapUsd.json";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { aeroAddress } from "../config";
import TokenAbi from "../artifacts/contracts/v2/Aero.sol/Aero.json";
import Stripe from "stripe";

export default function SellAeroWithUsd() {
  const [emailId, setEmailId] = useState("");
  const [ttlUsd, setTtlUsd] = useState();
  const [connectAccountId, setConnectAccountId] = useState();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successColor, setSuccessColor] = useState("green");
  const [errorColor, setErrorColor] = useState("red");
  const [numberOfTokens, setNumberOfTokens] = useState();
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  useEffect(() => {
    const totalUSD = () => {
      const amt = totalCalcualtion();
      if (
        numberOfTokens == 0 ||
        numberOfTokens == undefined ||
        numberOfTokens == ""
      ) {
        setTtlUsd(0);
      } else {
        const totalUsd = numberOfTokens * amt;
        setTtlUsd(totalUsd);
      }
    };
    totalUSD();
  }, [numberOfTokens]);

  //Approve token with USD
  async function approveWithUsd() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(
      aeroAddress,
      TokenAbi.abi,
      signer
    );
    try {
      const approveTx = await tokenContract.approve(
        aeroSwapUsdAddress,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const stripeTransfer = async (amount, connectAccountId) => {
    const stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15",
    });
    try {
      const transfer = await stripe.transfers.create({
        amount: amount,
        currency: "usd",
        destination: connectAccountId,
      });
      console.log(transfer);
      const sessionId = transfer.id;
      return sessionId;
    } catch (error) {
      console.log(error);
    }
  };

  const handleTransfer = async () => {
    const stripe = await stripePromise;
    const total = await totalCalcualtion();
    const ttl = numberOfTokens * total;
    const totalPayout = Math.round(ttl * 100);
    console.log(totalPayout);

    if (
      connectAccountId == 0 ||
      connectAccountId == undefined ||
      connectAccountId == ""
    ) {
      setErrorMessage("get your account id");
    } else {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const aeroSwapUsdInstance = new ethers.Contract(
        aeroSwapUsdAddress,
        AeroSwapUsdAbi.abi,
        signer
      );

      if (
        numberOfTokens == 0 ||
        numberOfTokens == "" ||
        numberOfTokens == undefined
      ) {
        setErrorMessageSell("Please enter a valid number of tokens");
      } else {
        await approveWithUsd();

        const numberOftokensinWei = ethers.utils.parseEther(
          String(numberOfTokens)
        );

        try {
          const tx = await aeroSwapUsdInstance.sellTokens(numberOftokensinWei, {
            gasLimit: 5000000,
          });
          await tx.wait();
          setSuccessMessage("Transaction successful!");
        } catch (err) {
          console.log(err);
        }

        const sessionId = await stripeTransfer(totalPayout, connectAccountId);

        console.log("sessionId", sessionId);
        if (sessionId) {
          setSuccessMessage("Transaction Successfull");
          window.location.href = `${process.env.NEXT_PUBLIC_HOST_URL}/aak-swap`;
        } else {
          setErrorMessage("Transaction Failed Please try again later");
        }
      }
    }
  };

  const totalCalcualtion = () => {
    const pricePerToken = 1.68;
    const tokenfee = 3.65;
    const total = pricePerToken - pricePerToken * (tokenfee / 100);
    return total;
  };
  //getId from db

  //Get Account Id from DB
  // const getAccountId=async()=>{
  //   const res = await fetch('/api/blockchain/find_connect_id',{
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(emailId)
  //   })
  //   const { receipentAccountId } = await res.json();
  //   console.log(receipentAccountId)
  //   setConnectAccountId(receipentAccountId)
  // }

  return (
    <>
      <div
        className="mt-2 border rounded p-4"
        style={{
          border: "solid black 3px",
          margin: "1% 15%",
          width: "50%",
          padding: "3%",
        }}
      >
        <h1>
          <b>
            <center>Sell Tokens</center>
          </b>
        </h1>
        <hr />
        <div style={{ margin: "2%" }}>
          {/* <label>Email Id:   </label>
        <input type="text" className="mt-2 border rounded p-4" value={emailId} onChange={(e) => setEmailId(e.target.value)}  placeholder="Your Email Id"/>
        <button className="font-bold text-white rounded p-4 shadow-lg" style={{ backgroundColor: "#3079AB", margin: "1%" }} onClick={getAccountId}>Get Account Id</button><br/> */}
          <label>Account Id: </label>
          <input
            type="text"
            className="mt-2 border rounded p-4"
            onChange={(e) => setConnectAccountId(e.target.value)}
          />
          <br />
          <br />
          <label>USD you receive: {ttlUsd}</label>
          <br />
          <label>Number Of tokens: </label>
          <input
            type="text"
            className="mt-2 border rounded p-4"
            placeholder="Number of tokens"
            onChange={(e) => setNumberOfTokens(e.target.value)}
          />
          <br />
          <button
            className="font-bold text-white rounded p-4 shadow-lg"
            style={{ backgroundColor: "#3079AB", margin: "1%" }}
            onClick={handleTransfer}
          >
            Sell
          </button>
          <div
            className="w-1/2 flex flex-col pb-12"
            style={{ marginTop: "2%" }}
          >
            {successMessage && (
              <p style={{ color: successColor }}>{successMessage}</p>
            )}
            {errorMessage && (
              <p style={{ color: errorColor }}>{errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
