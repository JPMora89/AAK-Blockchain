import { ethers } from "ethers";
//import Web3Modal from 'web3modal';
import path from "path";
import fs from "fs";
import { aeroSwapAddress, aeroAddress } from "../../config";
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });

const alchemyId = process.env.ALCHEMY_KEY;
export const infuraId = `https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`;

export const provider = new ethers.providers.StaticJsonRpcProvider(infuraId);
//const signer = new ethers.Wallet(process.env.NEXT_PRIVATE_KEY, provider)

const aeroSwapContractAbi = () => {
  try {
    const dir = path.resolve(
      "./",
      "./artifacts/contracts/Aero-swap.sol/AeroSwap.json"
    );
    const file = fs.readFileSync(dir, "utf8");
    const json = JSON.parse(file);
    const abi = json.abi;
    return abi;
  } catch (e) {
    console.log(`e`, e);
  }
};

const aeroContractAbi = () => {
  try {
    const dir = path.resolve(
      "./",
      "./artifacts/contracts/v2/Aero.sol/Aero.json"
    );
    const file = fs.readFileSync(dir, "utf8");
    const json = JSON.parse(file);
    const abi = json.abi;
    return abi;
  } catch (e) {
    console.log(`e`, e);
  }
};

// export const createAeroSwapInstance = new ethers.Contract(
//   aeroSwapAddress,
//   aeroSwapContractAbi(),
//   signer
// )

export const createAeroSwapInstance = async (signer) => {
  //const signer = new ethers.Wallet(userSigner, provider);
  return new ethers.Contract(aeroSwapAddress, aeroSwapContractAbi(), signer);
};

export const createAeroInstance = (userSigner) => {
  const signer = new ethers.Wallet(userSigner, provider);
  return new ethers.Contract(aeroAddress, aeroContractAbi(), signer);
};
