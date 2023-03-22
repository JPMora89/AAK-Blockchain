import { ethers } from "hardhat";
import { aeroAddress , privateKey} from "../config";

async function main() {
  
  const tokenPrice = ethers.utils.parseEther("1.68");
  const feeAmount = 3;
  
  const add = new ethers.Wallet(privateKey)
  const feeAddress = add.address;
  const AeroSwap = await ethers.getContractFactory("AeroSwap");
  const aeroSwap = await AeroSwap.deploy(aeroAddress, tokenPrice, feeAmount, feeAddress );

  await aeroSwap.deployed();
  console.log("AeroSwap deployed to:", aeroSwap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });