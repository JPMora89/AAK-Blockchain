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

    it.only('should create the signature for verification', async function (){
      const { aero, nftv2, nftMarketV2, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);
      const signer = owner;
    
      const domainData = {
        name: "AAK",
        version: "2",
        chainId: 5,
        verifyingContract: "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8",
      };
  
      // The data to sign
      const value =  {
        content: 'signature is giving the permit!',
        from:'0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
        to:'0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8'
      };
      // The named list of all type definitions
      const types = {
        Message: [
            { name: 'content', type: 'string'},
            {name:'from', type: 'string'},
            {name:'to', type: 'string'}
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
