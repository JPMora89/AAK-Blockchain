import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
const hre = require("hardhat");

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

    it('should create the signature for verification via Aero contract', async function (){
      const { aero, owner} = await loadFixture(deployOneYearLockFixture);
      const signer = owner;
      const chainId = hre.network.config.chainId;

      const domainData = {
        name: "Aero",
        version: '1',
        chainId: chainId,
        verifyingContract: aero.address,
      };
      const deadline = ethers.constants.MaxUint256;
      const nonce = await aero.nonces(owner.address);
      const val=1;
      console.log('ChainId', chainId)
      // The named list of all type definitions
      const types = {
        Permit: [
            {name:'owner',type:'address'},
            {name:'spender',type:'address'},
            {name:'value',type:'uint256'},
            {name:'nonce',type:'uint256'},
            {name:'deadline',type:'uint256'},
        ]
      };
  
      // The data to sign
      const value =  {
        owner:owner.address,
        spender:aero.address,
        value:val.toString(),
        nonce: nonce.toHexString(),
        deadline,
      };

      const result = await signer._signTypedData(domainData, types, value);
      let sig = ethers.utils.splitSignature(result);
      const {v, r, s} =  sig;
      console.log('owner', owner.address);
     
      console.log('v', v);
      console.log('r', r);
      console.log('s', s);
      const data = await  aero.permit(owner.address,aero.address,val.toString(),deadline,v,r,s);
      console.log('Permit Response', data)
      expect(v).to.be.an('Number');
      expect(r).to.be.an('String');
      expect(s).to.be.an('String');
  
    })
    it(' should create the signature for verification Via nftMarketV2 Contract', async function (){
      const { aero, nftv2, nftMarketV2, owner } = await loadFixture(deployOneYearLockFixture);
      await nftMarketV2.assignDeployedAddressToInstance(nftv2.address, aero.address)
      await aero.mint(owner.address,100);
      const signer = owner;
      const chainId = hre.network.config.chainId;

      const domainData = {
        name: "Aero",
        version: '1',
        chainId: chainId,
        verifyingContract: aero.address,
      };
      const deadline = ethers.constants.MaxUint256;
      const nonce = await aero.nonces(owner.address);
      const val=1;
      console.log('ChainId', chainId)
      // The named list of all type definitions
      const types = {
        Permit: [
            {name:'owner',type:'address'},
            {name:'spender',type:'address'},
            {name:'value',type:'uint256'},
            {name:'nonce',type:'uint256'},
            {name:'deadline',type:'uint256'},
        ]
      };
  
      // The data to sign
      const value =  {
        owner:owner.address,
        spender:aero.address,
        value:val.toString(),
        nonce: nonce.toHexString(),
        deadline,
      };

      const result = await signer._signTypedData(domainData, types, value);
      let sig = ethers.utils.splitSignature(result);
      const {v, r, s} =  sig;
      console.log('owner', owner.address);
      console.log('owner Erc 20 balance', await (await aero.balanceOf(owner.address)).toNumber());
     
      console.log('v', v);
      console.log('r', r);
      console.log('s', s);
      
      const data = await  nftMarketV2.buyAsset(owner.address,aero.address,val.toString(),deadline,v,r,s,aero.address,0);
      console.log('Permit Response', data)
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
