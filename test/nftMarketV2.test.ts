import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { marketItemTestData, tokenUri, pendingTestData } from './testData'
const hre = require('hardhat')

describe('Test suite', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners()

    const Aero = await ethers.getContractFactory('Aero')
    const aero = await Aero.deploy()

    const NFTMarketV2 = await ethers.getContractFactory('NFTMarketV2')
    const nftMarketV2 = await NFTMarketV2.deploy()

    const NFTV2 = await ethers.getContractFactory('NFTV2')
    const nftv2 = await NFTV2.deploy(nftMarketV2.address)

    console.log('Aero deployed at:', aero.address)
    console.log('NFT V2 deployed at:', nftv2.address)
    console.log('NFT market deployed at:', nftMarketV2.address)

    // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { aero, nftv2, nftMarketV2, owner, otherAccount }
  }

  describe('Deployment', function () {
    it('description', async () => {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
    })

    it('Should assign Deployed Address To Contract Instances', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      //nft, aero
      const result = await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )
      const event = (await result.wait()).events[0].args || {}
      expect(Object.keys(event).includes('aero')).to.eq(true)
      expect(Object.keys(event).includes('nft')).to.eq(true)
    })

    it('Should Create Asset', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )

      const result = await nftMarketV2.createAsset(marketItemTestData, tokenUri)
      const event = (await result.wait()).events[1].args || {}
      expect(Object.keys(event).includes('assetHash')).to.eq(true)
    })

    it('Should get All Market Item ', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )

      await nftMarketV2.createAsset(marketItemTestData, tokenUri)
      const result = await nftMarketV2.getAllMarketItem(0, 0)
      expect(result[0]).to.be.an('Array')
    })

    it('Should Mint NFT Token', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )

      const result = await nftMarketV2.mintNFT('tokenUri', owner.address)
      const event = (await result.wait()).events[1].args || {}
      expect(Object.keys(event).includes('tokenId')).to.eq(true)
    })

    it('Create Pending Asset', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )

      const result = await nftMarketV2.createAssetPending(pendingTestData)
      const event = (await result.wait()).events[0].args || {}
      expect(Object.keys(event).includes('assetPendingHash')).to.eq(true)
    })

    it('should get Market Item', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )

      const result = await nftMarketV2.createAssetPending(pendingTestData)
      const getMarket = await nftMarketV2.getMarketItem(result.hash)
      expect(getMarket).to.be.an('Array')
    })

    it('should get Market Item Status', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )

      const result = await nftMarketV2.createAssetPending(pendingTestData)
      const getMarketItemStatus = await nftMarketV2.getMarketItemStatus(
        result.hash
      )
      expect(getMarketItemStatus).to.eq('Pending')
    })

    it('Should mint aero token', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      let totalSupply1 = (await aero.totalSupply()).toString()

      let ethersToWei = ethers.utils.parseUnits('100', 'ether')
      let tx = await aero.mint(owner.address, ethersToWei)
      await tx.wait()
      let totalSupply2 = (await aero.totalSupply()).toString()
      expect(totalSupply1).to.eq('0')
      expect(totalSupply2).to.eq('100000000000000000000')
      //   expect(await lock.unlockTime()).to.equal(unlockTime);
    })

    it('should create the signature for verification via Aero contract', async function () {
      const { aero, owner } = await loadFixture(deployOneYearLockFixture)
      const signer = owner
      const chainId = hre.network.config.chainId

      const domainData = {
        name: 'Aero',
        version: '1',
        chainId: chainId,
        verifyingContract: aero.address,
      }
      const deadline = ethers.constants.MaxUint256
      const nonce = await aero.nonces(owner.address)
      const val = 1
      console.log('ChainId', chainId)
      // The named list of all type definitions
      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      // The data to sign
      const value = {
        owner: owner.address,
        spender: aero.address,
        value: val.toString(),
        nonce: nonce.toHexString(),
        deadline,
      }

      const result = await signer._signTypedData(domainData, types, value)
      let sig = ethers.utils.splitSignature(result)
      const { v, r, s } = sig
      console.log('owner', owner.address)

      console.log('v', v)
      console.log('r', r)
      console.log('s', s)
      const data = await aero.permit(
        owner.address,
        aero.address,
        val.toString(),
        deadline,
        v,
        r,
        s
      )
      console.log('Permit Response', data)
      expect(v).to.be.an('Number')
      expect(r).to.be.an('String')
      expect(s).to.be.an('String')
    })
    it('should create the signature for verification Via nftMarketV2 Contract', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )
      await aero.mint(owner.address, 100)
      const signer = owner
      const chainId = hre.network.config.chainId

      const domainData = {
        name: 'Aero',
        version: '1',
        chainId: chainId,
        verifyingContract: aero.address,
      }
      const deadline = ethers.constants.MaxUint256
      const nonce = await aero.nonces(owner.address)
      const val = 1
      console.log('ChainId', chainId)
      // The named list of all type definitions
      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      // The data to sign
      const value = {
        owner: owner.address,
        spender: nftMarketV2.address,
        value: val.toString(),
        nonce: nonce.toHexString(),
        deadline,
      }

      const result = await signer._signTypedData(domainData, types, value)
      let sig = ethers.utils.splitSignature(result)
      const { v, r, s } = sig
      console.log('owner', owner.address)
      console.log(
        'owner Erc 20 balance',
        (await aero.balanceOf(owner.address)).toNumber()
      )

      console.log('v', v)
      console.log('r', r)
      console.log('s', s)

      let tokenid = 1
      const data = await nftMarketV2.buyAsset(
        owner.address,
        nftMarketV2.address,
        val,
        deadline,
        v,
        r,
        s,
        otherAccount.address,
        tokenid
      )
      console.log('Permit Response', data)
      expect(v).to.be.an('Number')
      expect(r).to.be.an('String')
      expect(s).to.be.an('String')
    })
    it(' should transfer token after permit', async function () {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
      await nftMarketV2.assignDeployedAddressToInstance(
        nftv2.address,
        aero.address
      )

      // <--------------Mint-ERC20--------------->
      await aero.mint(owner.address, 100000)
      // <--------------Mint-ERC721--------------->
      const nftId = await nftMarketV2.mintNFT('tokenuri', otherAccount.address)
      console.log('--NftId--', nftId)
      const signer = owner
      const chainId = hre.network.config.chainId
      // <---------ERC20 is signing to the Market---------->
      const domainData = {
        name: 'Aero',
        version: '1',
        chainId: chainId,
        verifyingContract: aero.address,
      }
      const deadline = ethers.constants.MaxUint256
      const nonce = await aero.nonces(owner.address)
      const val = 2
      console.log('ChainId', chainId)
      console.log('Owner', owner)

      // The named list of all type definitions
      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      // The data to sign
      const value = {
        owner: owner.address,
        spender: nftMarketV2.address,
        value: val,
        nonce: nonce.toHexString(),
        deadline,
      }

      const result = await signer._signTypedData(domainData, types, value)
      let sig = ethers.utils.splitSignature(result)
      const { v, r, s } = sig
      console.log('owner', owner.address)
      console.log(
        'owner Erc 20 balance',
        (await aero.balanceOf(owner.address)).toNumber()
      )

      console.log('v', v)
      console.log('r', r)
      console.log('s', s)
      console.log('deadline', deadline)
      let tokenid = 1

      //<-------ERC721 Permit----------->
      console.log('<-------ERC721 Permit----------->')
      const ERC721_Nonce = await nftv2.nonces(tokenid)

      const ERC721_TYPE = {
        Permit: [
          { name: 'spender', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const ERC721_VALUE = {
        spender: nftMarketV2.address,
        tokenId: tokenid,
        nonce: ERC721_Nonce.toHexString(),
        deadline: deadline,
      }

      const domainDataNFT = {
        name: 'AAK Metamarket',
        version: '1',
        chainId: chainId,
        verifyingContract: nftMarketV2.address,
      }

      const resultNFT = await otherAccount._signTypedData(
        domainDataNFT,
        ERC721_TYPE,
        ERC721_VALUE
      )
      let sigNft = ethers.utils.splitSignature(resultNFT)
      const { v: vN, r: rN, s: sN } = sigNft

      const data = await nftMarketV2.buyAsset(
        owner.address,
        nftMarketV2.address,
        val,
        deadline,
        v,
        r,
        s,
        otherAccount.address,
        tokenid
      )
      console.log(
        'Balance of contract NFT M',
        await aero.balanceOf(nftMarketV2.address)
      )
      console.log(
        'Balance of contract owner',
        await aero.balanceOf(owner.address)
      )

      console.log(
        'Allowance',
        await aero.allowance(owner.address, nftMarketV2.address)
      )
      await nftMarketV2.buyAssetApprove(
        otherAccount.address,
        tokenid,
        v,
        r,
        s,
        deadline,
        nonce,
        vN,
        rN,
        sN
      )
      expect(v).to.be.an('Number')
      expect(r).to.be.an('String')
      expect(s).to.be.an('String')
    })
    it('description', async () => {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
    })

    it('description', async () => {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
    })

    it('description', async () => {
      const { aero, nftv2, nftMarketV2, owner, otherAccount } =
        await loadFixture(deployOneYearLockFixture)
    })
  })
})
