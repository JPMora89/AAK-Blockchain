import { ethers } from "hardhat";
import { aeroAddress} from "../config";
import { aeroAddress } from "../config";
async function main() {
  
  const AeroSwapUsd = await ethers.getContractFactory("AeroSwapUsd");
  const aeroSwapUsd = await AeroSwapUsd.deploy(aeroAddress);

  await aeroSwapUsd.deployed();
  console.log("AeroSwapUsd deployed to:", aeroSwapUsd.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });