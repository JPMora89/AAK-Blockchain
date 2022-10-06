const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy();
  const testnetExplorerLink = 'https://goerli.etherscan.io/address/';
  
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);
  console.log("Explorer link:", testnetExplorerLink+nftMarket.address);
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);
  console.log("Explorer link:", testnetExplorerLink+nft.address);

  let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
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
