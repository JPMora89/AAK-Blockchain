import { ethers } from "ethers";
import {
  createAeroSwapInstance,
  provider,
} from "../../../helpers/contractInstance/aeroSwapInstance";
import { aeroSwapAddress } from "../../../config";
//import Cors from "cors";
//import initMiddleware from "../../../lib/init-middleware";
import corsMiddleware, { runMiddleware } from "../../../middleware/middleware";

// Initialize the cors middleware
// const cors = initMiddleware(
//   // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
//   Cors({
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify the methods you want to allow
//     origin: "http://localhost:5397", // Your React app's domain
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true, // This will enable cookies
//   })
// );

function verifySignature(message, signature, address) {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (address === recoveredAddress) {
      const signer = provider.getSigner(recoveredAddress);
      return signer;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Failed to verify the signature:", err);
  }
}

var signer;
export default async function handler(req, res) {
  //await cors(req, res);
  await runMiddleware(req, res, corsMiddleware);

  if (req.method === "POST") {
    const { message, signature, address, numberOfTokens } = req.body;
    signer = await verifySignature(message, signature, address);
    if (signer) {
      const aeroSwapInstance = await createAeroSwapInstance(signer);
      //Checking if data is present
      const feePercent = 3.65;
      const tokenPrice = 0.0168;

      //Calculating total fee amount to pay
      const numberOfTokensinNum = Number(numberOfTokens);
      const numberOftokensinWei = ethers.utils.parseEther(
        String(numberOfTokens)
      );
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
          msg: `Transaction Failed. Please try again. Error message: ${error.toString()}`,
          signerFromSignature: signer,
        });
      }
    } else {
      res.status(400).json({ success: false, msg: "Invalid Signer" });
    }
  } else {
    res.status(400).json({
      success: false,
      msg: "Bad Request.",
    });
  }
}
