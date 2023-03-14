const { expect } = require("chai");

describe("AeroSwap contract", function() {
  let AeroSwap;
  let aeroSwap;
  let AeroToken;
  let aeroToken;
  let accounts;

  before(async function() {
    // Get accounts from Hardhat
    accounts = await ethers.getSigners();

    // Deploy AeroToken contract
    AeroToken = await ethers.getContractFactory("Aero");
    aeroToken = await AeroToken.deploy();
    console.log("Aer token Address", aeroToken.address)

    // Deploy AeroSwap contract and pass in the AeroToken contract address
    AeroSwap = await ethers.getContractFactory("AeroSwap");
    aeroSwap = await AeroSwap.deploy(aeroToken.address);
    console.log("Aer token Address", aeroSwap.address)
    // Transfer some Aero tokens to the AeroSwap contract to enable purchases
    await aeroToken.transfer(aeroSwap.address, ethers.utils.parseEther("100"));
  });

  it("should have a correct admin and funds address", async function() {
    const admin = await aeroSwap.admin();
    const funds = await aeroSwap.funds();

    expect(admin).to.equal(accounts[0].address);
    expect(funds).to.equal("0xb2165a8B792CF090f9eBde4206f1C76CBCB92546");
  });

  it("should return a correct ETH price from the price feed", async function() {
    const ethPrice = await aeroSwap.getETHPrice();

    expect(ethPrice).to.be.a("number");
  });

  it("should return a correct Aero token price in ETH", async function() {
    const aeroTokenPriceETH = await aeroSwap.aeroTokenPriceInETH();

    expect(aeroTokenPriceETH).to.be.a("number");
  });

  it("should sell Aero tokens and transfer ETH to funds", async function() {
    const initialFundsBalance = await ethers.provider.getBalance(aeroSwap.funds());

    // Make a purchase of 10 Aero tokens
    await aeroSwap.buyToken(ethers.utils.parseEther("10"), { value: ethers.utils.parseEther("16.8") });

    const finalAeroBalance = await aeroToken.balanceOf(accounts[0].address);
    const finalFundsBalance = await ethers.provider.getBalance(aeroSwap.funds());

    expect(finalAeroBalance).to.equal(ethers.utils.parseEther("10"));
    expect(finalFundsBalance).to.be.above(initialFundsBalance);
  });

  it("should not sell Aero tokens if the buyer doesn't send enough ETH", async function() {
    await expect(aeroSwap.buyToken(ethers.utils.parseEther("10"), { value: ethers.utils.parseEther("16.79") })).to.be.revertedWith("Buyer not sending enough ETH");
  });

  it("should not sell Aero tokens if there isn't enough available in the contract", async function() {
    await expect(aeroSwap.buyToken(ethers.utils.parseEther("101"), { value: ethers.utils.parseEther("168.8") })).to.be.revertedWith("Not enough ETH");
  });

  it("should end the sale and transfer remaining Aero tokens to admin", async function() {
    const initialAeroBalance = await aeroToken.balanceOf(aeroSwap.address);

    await aeroSwap.endSale();

    const finalAeroBalance = await aeroToken.balanceOf(aeroSwap.address);
    const adminBalance = await aeroToken.balanceOf(accounts[0].address);

    expect(finalAeroBalance).to.equal(0);
    expect(adminBalance).to.equal(initialAeroBalance);
  });
});
