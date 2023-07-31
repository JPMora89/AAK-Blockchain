import { useState, useEffect } from "react";
import Web3 from "web3";
import AeroSwapABI from "../artifacts/contracts/Aero-swap.sol/AeroSwap.json";
import TokenAbi from "../artifacts/contracts/v2/Aero.sol/Aero.json";
import AeroSwapUsdAbi from "../artifacts/contracts/Aero-swap-usd.sol/AeroSwapUsd.json";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { aeroAddress, aeroSwapAddress, aeroSwapUsdAddress } from "../config";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useRouter } from "next/router";
import "reactjs-popup/dist/index.css";
import Popup from "reactjs-popup";
import Stripe from "stripe";

const web3 = new Web3(Web3.givenProvider);

export default function AeroSwap() {
  const [tokenPrice, setTokenPrice] = useState(null);
  const [tokensSold, setTokensSold] = useState(null);
  const [numberOfTokens, setNumberOfTokens] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successColor, setSuccessColor] = useState("green");
  const [errorColor, setErrorColor] = useState("red");
  const [status, setStatus] = useState(false);
  const [totalAmountinUSD, setTotalAmountinUSD] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const contractAddress = aeroSwapAddress;
  const [feePercent, setFeePercent] = useState();
  const [tokenRecived, setTokenReceived] = useState();
  const [numberOfTokensToSell, setNumberOfTokensToSell] = useState();
  const [successMessageSell, setSuccessMessageSell] = useState(null);
  const [errorMessageSell, setErrorMessageSell] = useState(null);
  const [successColorSell, setSuccessColorSell] = useState("green");
  const [errorColorSell, setErrorColorSell] = useState("red");
  const [totalEthreceived, setTotalEthReceived] = useState();
  const [totalTokensSold, setTotalTokenSold] = useState();
  const [sellGasPrice, setSellGasPrice] = useState();
  const [sessionId, setSessionId] = useState(null);
  const route = useRouter();
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  useEffect(() => {
    const getInitialInfo = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const aeroSwapContract = new ethers.Contract(
        contractAddress,
        AeroSwapABI.abi,
        signer
      );
      const aerSwapUsdContract = new ethers.Contract(
        aeroSwapUsdAddress,
        AeroSwapUsdAbi.abi,
        signer
      );
      aeroSwapContract.tokenPrice().then((price) => {
        const val = ethers.utils.formatEther(price);
        setTokenPrice(Number(val));
      });

      aeroSwapContract.tokensSold().then((sold) => {
        setTokensSold(ethers.utils.formatEther(sold));
      });
      aeroSwapContract.feePercent().then((feePercent) => {
        const fee = ethers.utils.formatEther(feePercent);
        setFeePercent(Number(fee.toString()));
      });
      aerSwapUsdContract.tokensSold().then((sold) => {
        const total =
          Number(tokensSold) + Number(ethers.utils.formatEther(sold));
        setTotalTokenSold(total);
      });
    };

    getInitialInfo();
  }, [contractAddress, tokensSold]);

  useEffect(() => {
    const handleTotalAmount = async (e) => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      const gasPrice = await provider.getGasPrice();
      const gas = ethers.utils.formatEther(gasPrice);
      const totalfee = (numberOfTokens * feePercent) / 100;

      const tokenAmountinNum = Number(numberOfTokens);
      const tokenPriceinNum = Number(tokenPrice);
      const gasLimit = ethers.utils.parseEther(String(5000000)).toString();
      const tokensReceive = numberOfTokens;
      setTokenReceived(tokensReceive);
      if (numberOfTokens == "" || numberOfTokens == undefined) {
        setTokenReceived(0);
      } else {
        setTokenReceived(tokensReceive);
      }

      const totalAmount = (
        (tokenAmountinNum + totalfee) *
        tokenPriceinNum
      ).toFixed(6);
      console.log("total", totalAmount);
      if (
        numberOfTokens == "" ||
        numberOfTokens == undefined ||
        numberOfTokens == 0
      ) {
        setTotalAmount(0.0);
      } else {
        setTotalAmount(totalAmount);
      }

      //Total Usd calculation
      const tokenPriceForUSD = 1.68;
      const numberOfTokensinNum = Number(numberOfTokens);
      const total = tokenPriceForUSD + tokenPriceForUSD * (feePercent / 100);
      const totalAmountinUsd = numberOfTokensinNum * total;
      if (
        numberOfTokens == "" ||
        numberOfTokens == undefined ||
        numberOfTokens == 0
      ) {
        setTotalAmountinUSD(0);
      } else {
        setTotalAmountinUSD(totalAmountinUsd);
      }
    };
    handleTotalAmount();
  }, [numberOfTokens, feePercent, tokenPrice]);

  useEffect(() => {
    //Handle total ETH amount the user receives onSelling
    const handleTotalEth = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      console.log("provider", provider)
      const gasPrice = await provider.getGasPrice();
      const gas = Number(ethers.utils.formatEther(gasPrice));
      const totalfee = (numberOfTokensToSell * feePercent) / 100;
      const total = (numberOfTokensToSell - totalfee) * tokenPrice;
      if (
        numberOfTokensToSell == "" ||
        numberOfTokensToSell == undefined ||
        numberOfTokensToSell == 0
      ) {
        setTotalEthReceived(0);
      } else {
        setTotalEthReceived(total.toFixed(4));
      }
    };
    handleTotalEth();
  }, [numberOfTokensToSell, feePercent, tokenPrice]);

  //Function lets user buy AER token
  const handleBuyToken = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
   
    const signer = provider.getSigner();
    await window.ethereum.enable();

    const aeroSwapcontract = new ethers.Contract(
      contractAddress,
      AeroSwapABI.abi,
      signer
    );

    const tokenAddress = aeroAddress;
    const token = new ethers.Contract(tokenAddress, TokenAbi.abi, signer);
    if (numberOfTokens == "" || numberOfTokens == undefined) {
      setErrorMessage("Please enter the number of Aero Tokens.");
    } else {
      const numberOfTokensinNum = Number(numberOfTokens);
      console.log("numberOfTokensinNum", numberOfTokensinNum);
      const numberOftokensinWei = ethers.utils.parseEther(
        String(numberOfTokens)
      );
      console.log("numberOfTokensinNum", String(numberOftokensinWei));
      const ttl = tokenPrice + tokenPrice * (feePercent / 100);
      console.log(ttl);
      const totalAmount = numberOfTokensinNum * ttl;
      console.log("totalAmount", totalAmount);
      const totalAmountinWei = ethers.utils.parseEther(String(totalAmount));

      try {
        const gasPrice = await provider.getGasPrice();

        const tx = await aeroSwapcontract.buyTokens(numberOftokensinWei, {
          value: totalAmountinWei,
          gasLimit: 5000000,
        });

        await tx.wait();
        setSuccessMessage("Transaction successful!");
        window.location.reload(false);
      } catch (error) {
        console.log(error);
        setErrorMessage("Transaction failed. Please try again.");
      }
    }
  };

  //Sell tokens and get eth in return

  const handleSellToken = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    await window.ethereum.enable();

    const aeroSwapcontract = new ethers.Contract(
      contractAddress,
      AeroSwapABI.abi,
      signer
    );

    if (numberOfTokensToSell == "" || numberOfTokensToSell == undefined) {
      setErrorMessageSell("Please enter the number of Aero Tokens.");
    } else {
      await approve();

      const numberOfTokensinNum = Number(numberOfTokensToSell);
      const numberOftokensinWei = ethers.utils.parseEther(
        String(numberOfTokensToSell)
      );
      const totalfee = (numberOfTokensinNum * feePercent) / 100;
      const totalAmount = (numberOfTokensinNum - totalfee) * tokenPrice;
      const totalAmountinWei = ethers.utils.parseEther(String(totalAmount));
      try {
        const tx = await aeroSwapcontract.sellTokens(numberOftokensinWei, {
          gasLimit: 5000000,
        });
        await tx.wait();
        setSuccessMessageSell("Transaction successful!");
        window.location.reload(false);
      } catch (error) {
        console.log(error);
        setErrorMessageSell("Transaction failed. Please try again.");
      }
    }
  };

  //Approve token with ETH
  async function approve() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const tokenAddress = aeroAddress;
    const tokenContract = new ethers.Contract(
      tokenAddress,
      TokenAbi.abi,
      signer
    );
    try {
      const approveTx = await tokenContract.approve(
        aeroSwapAddress,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  //Stripe functions to buy AERO
  const buyAeroWithUsdStripe = async (amount, quantity) => {
    const stripe = Stripe('sk_test_51N1Ru0GyACoklI4QW7K3ajCvhHNepIVjU1x2e73kxYeN99bIeedisd7OOQZvHLMfQ2wxgUHNG177chVpqHncB4Bb00QYLMK83P', {
      apiVersion: "2022-11-15",
    });
    try {
      // Create a new Checkout session with Stripe API
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: "AERO",
                description: "ERC20 token",
              },
            },
            quantity: quantity,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/buyAeroSuccess?status=true&quantity=${quantity}&sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/buyAeroFail`,
      });
      console.log("session", session);
      const sessionId = session.id;
      return sessionId;
    } catch (error) {
      console.log(error);
    }
  };

  //Handling Buy tokens with USD
  const handleBuyTokenWithUsd = async () => {
    console.log("Buy with USD");
    const tokenPrice = 1.68;
    const numberOfTokensinNum = Number(numberOfTokens);
    const total = tokenPrice + tokenPrice * (feePercent / 100);

    const amount = Math.round(total * 100); //converted to cents and rounded off
    const stripe = await stripePromise;
    //Sending a request to the API route to create a new Checkout session
    const sessionId = await buyAeroWithUsdStripe(amount, numberOfTokens);
    console.log(sessionId);
    //Redirecting the user to checkout page
    const result = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });
    if (result.error) {
      console.log("error", result.error.message);
    }
  };

  //Handling selling tokens with USD
  const handleNO = async () => {
    window.location.href = "/create_connected_stripe_account";
  };

  const handleYES = () => {
    window.location.href = "/sell_aero_for_usd";
  };

  return (
    <div>
      <div
        className="flex justify-center"
        style={{
          border: "solid black 2px",
          width: "50%",
          margin: "2% 25%",
          borderRadius: "3em",
        }}
      >
        <p className="rounded mt-4 font-bold" style={{ margin: "2%" }}>
          1.68 ETH = 100 AER
        </p>
        <p className="rounded mt-4 font-bold" style={{ margin: "2%" }}>
          1 AER = $ 1.68
        </p>
        <p className="rounded mt-4 font-bold" style={{ margin: "2%" }}>
          Tokens Sold: {totalTokensSold}
        </p>
        <p className="rounded mt-4 font-bold" style={{ margin: "2%" }}>
          Fee Percent: {feePercent}%
        </p>
      </div>
      <div className="flex justify-center" style={{ marginBottom: "-6%" }}>
        <div className="w-1/2 flex flex-col pb-12" style={{ width: "30%" }}>
          <h1
            className="py-10 text-3xl flex "
            style={{ color: "#3079AB", alignSelf: "flex-start" }}
          >
            Buy Aero Tokens
          </h1>
          <div className="flex justify-center">
            <p className="rounded mt-4 font-bold" style={{ margin: "2%" }}>
              ETH you pay: {totalAmount} ETH
            </p>
            <p className="rounded mt-4 font-bold" style={{ margin: "2%" }}>
              USD you pay: {totalAmountinUSD} USD
            </p>
          </div>
          <input
            value={numberOfTokens}
            className="mt-2 border rounded p-4"
            placeholder="Number of Aero coins"
            onChange={(e) => setNumberOfTokens(e.target.value)}
          />
          <p>
            You will be paying the gas price and fee based on the network
            traffic.
          </p>
          <button
            className="font-bold text-white rounded p-4 shadow-lg"
            style={{ backgroundColor: "#3079AB", marginTop: "2%" }}
            onClick={() => handleBuyToken()}
          >
            Buy Tokens with Eth
          </button>
          <button
            className="font-bold text-white rounded p-4 shadow-lg"
            style={{ backgroundColor: "#3079AB", marginTop: "2%" }}
            onClick={() => handleBuyTokenWithUsd()}
          >
            Buy Tokens with USD
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

        <div
          className="w-1/2 flex flex-col pb-12"
          style={{ width: "30%", marginLeft: "2%" }}
        >
          <h1
            className="py-10 text-3xl flex "
            style={{ color: "#3079AB", alignSelf: "flex-start" }}
          >
            Sell Aero Tokens
          </h1>
          <div className="flex justify-center">
            <p className="rounded mt-4 font-bold" style={{ margin: "2%" }}>
              ETH you receive: {totalEthreceived} ETH
            </p>
          </div>
          <input
            value={numberOfTokensToSell}
            className="mt-2 border rounded p-4"
            placeholder="Number of Aero coins"
            onChange={(e) => setNumberOfTokensToSell(e.target.value)}
          />
          <p>
            You will be paying the gas price and fee based on the network
            traffic.
          </p>
          <button
            className="font-bold text-white rounded p-4 shadow-lg"
            style={{ backgroundColor: "#3079AB", marginTop: "2%" }}
            onClick={() => handleSellToken()}
          >
            Sell Tokens for ETH
          </button>
          <Popup
            trigger={
              <button
                className="font-bold text-white rounded p-4 shadow-lg"
                style={{ backgroundColor: "#3079AB", marginTop: "2%" }}
              >
                Sell Tokens for USD
              </button>
            }
            position="top center"
          >
            <div style={{ width: "100%" }}>
              Do you have an account Id ?
              <button
                className="font-bold text-white rounded p-4 shadow-lg"
                style={{ backgroundColor: "#3079AB", margin: "2%" }}
                onClick={() => handleNO()}
              >
                NO
              </button>
              <button
                className="font-bold text-white rounded p-4 shadow-lg"
                style={{ backgroundColor: "#3079AB", margin: "2%" }}
                onClick={() => handleYES()}
              >
                YES
              </button>
            </div>
          </Popup>
          <div
            className="w-1/2 flex flex-col pb-12"
            style={{ marginTop: "2%" }}
          >
            {successMessageSell && (
              <p style={{ color: successColorSell }}>{successMessageSell}</p>
            )}
            {errorMessageSell && (
              <p style={{ color: errorColorSell }}>{errorMessageSell}</p>
            )}
          </div>
        </div>
      </div>
      <div
        className="mt-2 border rounded p-4"
        style={{
          border: "solid black 3px",
          margin: "1% 15%",
          width: "70%",
          padding: "3%",
        }}
      >
        <h2>
          <b>Know the process:</b>
        </h2>
        <br />
        <p>
          * Please ensure your wallet is connected before making a purchase.
          <br />
          * Token value and our 3% fee are clearly stated on the page.
          <br />
          * How Fee works :<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We charge a 3% fee on token
          purchases, which means if you buy 1<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;token, which is 0.0168 ETH 3% of
          it will be charged as a fee, So you will be paying 0.017304 ETH.
          Please <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;review the ETH &apos;you pay
          field&apos; before completing your purchase.
          <br />
          * Please ensure you have enough ETH in your wallet to complete the
          transaction; otherwise, it may fail.
          <br />
          * Note that the transaction price may vary based on the gas price and
          network traffic.
          <br />
          * Add Aero Token to your wallet using the token address:
          0xA7C6009E88F6054c0FDBec12e80cB2Fdb0a8d0d3.
          <br />
          * While selling tokens 3% of the eth will be deducted as fee, which
          means for 1 AER token it is 0.0168 ETH
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;after deduction of 3% you will receive
          0.016296 ETH. Please review the &apos;Eth you receive&apos; field.
        </p>
      </div>
    </div>
  );
}
