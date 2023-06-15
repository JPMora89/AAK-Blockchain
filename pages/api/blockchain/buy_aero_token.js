import { ethers } from "ethers";
import {
  createAeroSwapInstance,
  provider,
} from "../../../helpers/contractInstance/aeroSwapInstance";
import { aeroSwapAddress } from "../../../config";

var signer;
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { numberOfTokens, signature, address } = req.body;
    
    //verifying signature
  signer = await verifySignature(numberOfTokens, signature, address);
  if(signer){
    const aeroSwapInstance = await createAeroSwapInstance(signer);
    //Checking if data is present
    const feePercent = 3.65;
    const tokenPrice = 0.0168;

    //Calculating total fee amount to pay
    const numberOfTokensinNum = Number(numberOfTokens);
    const numberOftokensinWei = ethers.utils.parseEther(String(numberOfTokens));
    const pricePerToken = tokenPrice + tokenPrice * (feePercent / 100);
    const totalAmount = numberOfTokensinNum * pricePerToken;
    const totalAmountinWei = ethers.utils.parseEther(String(totalAmount));
  //   //Set up contract instance
    //const aeroSwapInstance = await createAeroSwapInstance(signer);
   // Buy tokens
    try {
      const tx = await aeroSwapInstance.functions.buyTokens(
        numberOftokensinWei,
        {
          value: totalAmountinWei,
          gasLimit: 5000000,
        }
      );
      await tx.wait();
      res.status(200).json({ success: true, msg: "Transaction Successful." });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        msg: "Transaction Failed. Please try again.",
      });
    }
  }else{
    res.status(400).json({ success: false, msg: "Invalid Signer" });
  }
  } else {
    res.status(400).json({ success: false, msg: "Bad request." });
    }
}

//Verifying the signature
async function verifySignature(numberOfTokens, signature, address) {
  try {
    const signingAddress = await ethers.utils.verifyMessage(numberOfTokens, signature);
    signingAddress.toLowerCase() === address.toLowerCase();
    const signer = await provider.getSigner(signingAddress);
    //const provide = provider.getSigner(signingAddress);
    return signer;

  } catch (error) {
    console.error("error3",error);
    return false;
  }
}
