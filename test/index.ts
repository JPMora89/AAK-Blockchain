import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Test suite", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneYearLockFixture() {
 
    const [owner, otherAccount] = await ethers.getSigners();

    const Aero = await ethers.getContractFactory("Aero");
    const aero = await Aero.deploy();

    const NFTMarketV2 = await ethers.getContractFactory("NFTMarketV2");
    const nftMarketV2 = await NFTMarketV2.deploy();

    const NFTV2 = await ethers.getContractFactory("NFTV2");
    const nftv2 = await NFTV2.deploy(nftMarketV2.address);
    console.log("Aero deployed at:", aero.address);
    console.log("NFT V2 deployed at:", nftv2.address);
    console.log("NFT market deployed at:", nftMarketV2.address);
    
  
    // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
 
    return { aero, nftv2, nftMarketV2, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should mint aero token", async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);
      let totalSupply1 = (await aero.totalSupply()).toString();
      
      
      let ethersToWei = ethers.utils.parseUnits("100", "ether");
      let tx = await aero.mint(owner.address, ethersToWei);
      await tx.wait();
      let totalSupply2 = (await aero.totalSupply()).toString();
      expect(totalSupply1).to.eq("0");
      expect(totalSupply2).to.eq("100000000000000000000");
    //   expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it('description', async () => {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);
      
    })

    it('description', async () => {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);
      
    })

    it('description', async () => {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);
      
    })
  


  });

 
});
