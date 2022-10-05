# AAK-Smart Contracts

## Intro:
These smart contracts basically govern the behavior of our NFTs and of (what I called) the "MarketPlace" which is basically us, as AAK - I called it AAK MetaMarket (AAM) just for fun. ;-D

These smart contracts allow for anyone to list an NFT, attach anything to it, mint it, and share/sell it. 

So far AAK takes a little fee for all this, but I can easily modify or remove it. TBD. 

**The idea is this:**
Imagine OpenSea attached to the AAK platform. So anyone can create, mint and share NFT's as smart contracts. The user will be able to update the *name*, *description* and *features* of the NFT's metadata, with any type of contract, such as NDA, or license agreement or anything else they need. 

There are some extra function that will be more useful later as we make this more complex, that will allow the user to see the contracts they created, anything they purchased from others, allow others to see their portfolio etc...

An important next step will be to use **NFT Fragmentation** which will allow this all thing to come alive, so users can dynamically share ownership of their NFT's (contracts, licenses, their work in general). 

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
- *Solidity* to write the smart contracts
- *Infura* to use a rpc node and ipfs
- *Harthat* to compile the contracts in the Ethereum environment
- Probably other ones I'm missing, feel free to add.

### Frontend
- *Nextjs* to build the components
- *Ethers* to intercat with the blockchain

### Latest smart contract deployment:
## In Goerli testnet:
```
nftMarket deployed to: 0xfF1E2DD362Da94955713eD23A419c43624e0813a
Explorer link: https://goerli.etherscan.io/address/0xfF1E2DD362Da94955713eD23A419c43624e0813a
nft deployed to: 0xB58d50E712c455E34f91F97A168Bfa1c3c08706c
Explorer link: https://goerli.etherscan.io/address/0xB58d50E712c455E34f91F97A168Bfa1c3c08706c
```
## In Mainnet




