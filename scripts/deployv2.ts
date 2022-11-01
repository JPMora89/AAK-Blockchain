const hre = require("hardhat");
const fs = require("fs");

export async function main() {

  // NFT Market  
  const NFTMarketV2 : any = await hre.ethers.getContractFactory("NFTMarketV2");
  const nftMarketV2 : any = await NFTMarketV2.deploy();
  const testnetExplorerLink : string = 'https://goerli.etherscan.io/address/';
  await nftMarketV2.deployed();
  console.log("nftMarketV2 deployed to:", nftMarketV2.address);
  console.log("Explorer link:", testnetExplorerLink+nftMarketV2.address);

  // NFT
  const NFTV2 : any = await hre.ethers.getContractFactory("NFTV2");
  const nftV2 : any = await NFTV2.deploy(nftMarketV2.address);
  await nftV2.deployed();
  console.log("nftV2 deployed to:", nftV2.address);
  console.log("Explorer link:", testnetExplorerLink+nftV2.address);

  // AERO ERC20
  const AeroV2 : any = await hre.ethers.getContractFactory("Aero");
  const aero : any = await AeroV2.deploy();
  await aero.deployed();
  console.log("Aero deployed to:", aero.address);
  console.log("Explorer link:", testnetExplorerLink+aero.address);


  let config : string = `
  export const nftmarketaddress = "${nftMarketV2.address}"
  export const nftaddress = "${nftV2.address}"
  export const aeroaddress = "${aero.address}"
  `;

  let data : string = JSON.stringify(config);
  fs.writeFileSync("configV2.js", JSON.parse(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
