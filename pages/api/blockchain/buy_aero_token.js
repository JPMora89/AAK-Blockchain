import { ethers } from "ethers";
import {
  createAeroSwapInstance,
  provider,
} from "../../../helpers/contractInstance/aeroSwapInstance";
import { aeroSwapAddress } from "../../../config";
//import cors from "cors";

export default async function handler(req, res) {
  if (req.method === "POST") {
    //Check if data is present
    const numberOfTokens = req.body.numberOfTokens;
    const userAddress = req.body.userAddress;
    console.log("numberOfTokens", numberOfTokens);
    console.log("userAddress", userAddress);
    if (
      numberOfTokens === undefined ||
      numberOfTokens === "" ||
      numberOfTokens === 0
    ) {
      res
        .status(400)
        .json({ success: false, msg: "Number of tokens is required." });
      return;
    }

    const feePercent = 3;
    const tokenPrice = 0.0168;

    //Calculating total fee amount to pay
    const numberOfTokensinNum = Number(numberOfTokens);
    const numberOftokensinWei = ethers.utils.parseEther(String(numberOfTokens));
    const totalfee = (numberOfTokensinNum * feePercent) / 100;
    const totalAmount = (numberOfTokensinNum - totalfee) * tokenPrice;
    const totalAmountinWei = ethers.utils.parseEther(String(totalAmount));
    const signer = provider.getSigner(userAddress);

    //Set up contract instance
    const aeroSwapInstance = createAeroSwapInstance(aeroSwapAddress, signer);
    console.log(aeroSwapInstance);
    //Buy tokens
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
  } else {
    res.status(400).json({ success: false, msg: "Bad request." });
  }
}
