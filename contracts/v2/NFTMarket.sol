// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import @openzeppelin/contracts/utils/Counters.sol;
import @openzeppelin/contracts/security/ReentrancyGuard.sol;
import @openzeppelin/contracts/token/ERC721/ERC721.sol;

import hardhat/console.sol;

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable owner;
  uint256 listingPrice = 0.001 ether;       // price to list, to be discussed later  
  enum AssetType {
      SmartContract, 
      LicenseAgreement,
      Publication,
      Patent,
      Book
   }

   enum Status {Pending, Created, Sold }

  constructor() {
    owner = payable(msg.sender);  // this is the address that deploys the contract => AAK
  }

  struct MarketItem {
    uint256 nftID,
    bool new_env;
    uint creatorUserID;
    string creatorUsername;
    string creatorName: str;
    address creatorMetamaskId;
    string associatedProjectName;
    string associatedProjectUrl;
    string assetName;
    AssetType assetType;
    string assetDescription;
    string assetOffer;
    string assetTerms;
    string assetImage;
    bool isHidden;
    bool isPrivate;
    bool multiNft;
    uint256 assetPrice;
    Status status;
  }

  

  
}