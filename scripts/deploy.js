const hre = require("hardhat");
const fs = require("fs");

async function main() {

  const AeroToken = await hre.ethers.getContractFactory("Aero");
  const aeroToken = await AeroToken.deploy();

  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy(aeroToken.address);
  const testnetExplorerLink = 'https://goerli.etherscan.io/address/';

  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);
  console.log("Explorer link:", testnetExplorerLink + nftMarket.address);
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);
  console.log("Explorer link:", testnetExplorerLink + nft.address);

  let config = `
  export const aeroAddress = "${aeroToken.address}"
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const aeroSwapAddress = "0x8275407d49A3c22d326f6c09893267DAAa2C7Bf5"
  export const privateKey = "b1746c0133b5e1d696fda2d98d3c240fcf96ddaeeddd688b86baab2e53111a12"
  `;

  let data = JSON.stringify(config);
  fs.writeFileSync("config.js", JSON.parse(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
