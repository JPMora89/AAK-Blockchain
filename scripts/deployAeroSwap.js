import { ethers } from "hardhat";
import { aeroAddress } from "../config";

async function main() {
  const tokenPrice = ethers.utils.parseEther("0.0168");
  const feeAmount = ethers.utils.parseEther("3.65");

  const AeroSwap = await ethers.getContractFactory("AeroSwap");
  const aeroSwap = await AeroSwap.deploy(aeroAddress, tokenPrice, feeAmount);

  await aeroSwap.deployed();
  console.log("AeroSwap deployed to:", aeroSwap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
