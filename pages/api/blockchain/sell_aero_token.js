import { ethers } from "ethers";
import {
  createAeroSwapInstance,
  provider,
  createAeroInstance,
} from "../../../helpers/contractInstance/aeroSwapInstance";
import { aeroSwapAddress, aeroAddress } from "../../../config";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Check if data is present
    const numberOfTokens = req.body.numberOfTokens;
    const userAddress = req.body.userAddress;
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
    // connect to user wallet
    //const signer = provider.getSigner(userAddress);

    const numberOftokensinWei = ethers.utils.parseEther(String(numberOfTokens));

    // Set up contract instance
    const aeroSwapInstance = await createAeroSwapInstance(userAddress);
    const tokenContract = await createAeroInstance(userAddress);

    try {
      // Approve token
      const approveTx = await tokenContract.approve(
        aeroSwapAddress,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();

      // Sell tokens
      const tx = await aeroSwapInstance.functions.sellTokens(
        numberOftokensinWei,
        {
          gasLimit: 5000000,
        }
      );
      await tx.wait();
      res.status(200).json({ success: true, msg: "Transaction Successful." });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, msg: "Transaction Failed. Please try again." });
    }
  } else {
    res.status(400).json({ success: false, msg: "Bad request." });
  }
}
