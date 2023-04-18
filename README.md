# AAK-Smart Contracts

## Intro:

These smart contracts basically govern the behavior of our NFTs and of (what I called) the "MarketPlace" which is basically us, as AAK - I called it AAK MetaMarket (AAM) just for fun. ;-D

These smart contracts allow for anyone to list an NFT, attach anything to it, mint it, and share/sell it.

So far AAK takes a little fee for all this, but I can easily modify or remove it. TBD.

**The idea is this:**
Imagine OpenSea attached to the AAK platform. So anyone can create, mint and share NFT's as smart contracts. The user will be able to update the _name_, _description_ and _features_ of the NFT's metadata, with any type of contract, such as NDA, or license agreement or anything else they need.

There are some extra function that will be more useful later as we make this more complex, that will allow the user to see the contracts they created, anything they purchased from others, allow others to see their portfolio etc...

An important next step will be to use **NFT Fragmentation** which will allow this all thing to come alive, so users can dynamically share ownership of their NFT's (contracts, licenses, their work in general).

## Environmental Variable Files:

`.env` -> Used for smart contract development
`.env.local` -> Used for Next js frontend app

Rename `.env.example` to `.env` and `.env.local.example` to `.env.local`. Then put the values fo environment variables.

## HIW:

### installation

To run the docker container:

```
docker run -it aak-smart-contracts/docker-contracts /bin/bash
```

Then run this command in order to run a private test node provided by hardhat with 20 accounts:

```
npx hardhat node&
```

To compile:

```
npm run compile
```

Then run the scripts in order to deploy the smart contracts on hardhat local testnet:

```
npm run deploy
```

Then run the scripts in order to deploy the smart contracts on `Goerli` testnet:

```
npm run deploy:goerli
```

To run test cases:

```
npm run test
```

- Verify on etherscan

```
npx hardhat verify --network goerli <YOUR_CONTRACT_ADDRESS>
```

To see the front-end on your localhost run:

```
npm run dev
```

### Metamask

You need the Metamask Chrome extension on your browser. Once you have it you need to import 2 accounts from the list of accounts that shows up on your terminal.
Copy the private keys and import them in Metamask.

You need two accounts in order to simulate one NFT creator and one buyer.

### Debugging

Quickest debugging solution if you have an error is to reset both Metamask accounts (this will clear the history).

Whilst you can use the same accounts over and over when testing, every time you kill the process and start the node again (the node, in this case, is basically the blockchain version of a server) you **MUST reset your Metamask accounts**.

## Technologies Used:

### Backend

- _Solidity_ to write the smart contracts
- _Infura_ to use a rpc node and ipfs
- _Harthat_ to compile the contracts in the Ethereum environment
- Probably other ones I'm missing, feel free to add.

### Frontend

- _Nextjs_ to build the components
- _Ethers_ to intercat with the blockchain

### Latest smart contract deployment:

## In Goerli testnet:

```
nftMarket deployed to: 0xfF1E2DD362Da94955713eD23A419c43624e0813a
Explorer link: https://goerli.etherscan.io/address/0xfF1E2DD362Da94955713eD23A419c43624e0813a
nft deployed to: 0xB58d50E712c455E34f91F97A168Bfa1c3c08706c
Explorer link: https://goerli.etherscan.io/address/0xB58d50E712c455E34f91F97A168Bfa1c3c08706c
```

## In Mainnet

//address --goerli network
config.js
export const aeroAddress = "0xA7C6009E88F6054c0FDBec12e80cB2Fdb0a8d0d3"
export const nftmarketaddress = "0x58Ff05879e6E670F54AA1F5D072dD6D282807179"
export const nftaddress = "0x71AEdE498c35Da82C95B77E8958b4A233a5c9f0d"
export const aeroSwapAddress = "0x989e3E7b51D205654f80D2d64fd259D06c2602F0"
configV2.js
export const nftmarketaddress = "0x8dBb0b29F89012FC5597B43A89C1830969541A52"
export const nftaddress = "0x02F0984330782475362769A540A7C3EF1c7F0980"
export const aeroaddress = "0xDB0028DDCc22F205Bb79D27754cB9C70e19ebd5E"

//address --sepolia network
config.js
export const aeroAddress = "0xE3eB8C408Bc38C2eab47EBA114c0c59Cb3891670"
export const nftmarketaddress = "0x9eaFF9b5B091cf5E357A37b30bf2BE266103e91a"
export const nftaddress = "0x51077749EFC675BE1B00911b1Aa24460C33c83CF"
export const aeroSwapAddress = "0x8275407d49A3c22d326f6c09893267DAAa2C7Bf5"
