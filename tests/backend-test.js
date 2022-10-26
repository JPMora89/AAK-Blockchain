const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function() {
  it("Should create and execute market sales", async function() {
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")
  
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice })
    
    /* Just getting test accounts */
    /* The seller is the first account and is ignored with the underscore */
    const [_, buyerAddress] = await ethers.getSigners()

    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice})

    let items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
  it.only('should create the signature for verification', async function (){

    const pKey = new ethers.Wallet.createRandom();
    const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/b93d91e7f1d442f28e9d8536b47e0b44")
    const signer = new ethers.Wallet(pKey, provider);
  
    const domainData = {
      name: "AAK",
      version: "2",
      chainId: 5,
      verifyingContract: "0x1C56346CD2A2Bf3202F771f50d3D14a367B48070",
      salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
    };

    // The data to sign
    const value =  {
      content: 'signature is giving the permit!'
    };
    // The named list of all type definitions
    const types = {
      Message: [
          { name: 'content', type: 'string' }
      ]
    };

    const result = await signer._signTypedData(domainData, types, value);
    let sig = ethers.utils.splitSignature(result);
    const {v, r, s} = sig;
    console.log('v', v);
    console.log('r', r);
    console.log('s', s);
    expect(v).to.be.an('Number');
    expect(r).to.be.an('String');
    expect(s).to.be.an('String');

  })
})
