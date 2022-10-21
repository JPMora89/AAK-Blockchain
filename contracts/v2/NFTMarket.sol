// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarket is ReentrancyGuard, Ownable {
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
    uint256 nftID;
    bool new_env;
    uint creatorUserID;
    string creatorUsername;
    string creatorName;
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

  // hash of user id + nftID + asset name + asset type + asset description => Market Item
  mapping (bytes=>MarketItem) marketItems;  
 
  // list of hashes of user id + nftID + asset name + asset type + asset description  
  bytes[] allHashes;

  function getMarketItemStatus() external view{
      
  }

  function getMarketItem() external view{
      
  }

  function createAssetPending(

  ) external {
      
  }

  function approvePendingAsset() external {
      
  }

  function createAsset() external {
      
  }

  function buyAsset() external {
      
  }

  function getAllMarketItem() external view onlyOwner{
      
  }

  

  
}