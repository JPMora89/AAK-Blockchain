// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";

contract NFTMarket is ReentrancyGuard, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  NFT public nftContract;

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

 function assignDeployedAddressToInstance(address nftContractAddress) public returns(bool){
    nftContract=NFT(nftContractAddress);
    return true;
  }

 function createHash(bytes memory data) internal pure returns (bytes32)
  {
    return keccak256(data);
  }

  function getMarketItemStatus() external view{
      
  }

  function getMarketItem() external view{
      
  }

  function createAssetPending(MarketItem memory data) public  returns(bool) {
  bytes memory hash= abi.encode(createHash(abi.encodePacked(data.creatorUserID, data.nftID, data.assetName,data.assetType,data.assetDescription)));
  marketItems[hash]=data;
  allHashes.push(hash);
  return true;
  }

  function approvePendingAsset(bytes memory hash,string memory tokenUri) external returns(bool) {
  uint tokenId= nftContract.createToken(tokenUri,msg.sender);
  marketItems[hash].nftID=tokenId;
  marketItems[hash].status=Status.Created;
  return true;
  }

  function createAsset(MarketItem memory data,string memory tokenUri) external returns(bool) {
  uint tokenId= nftContract.createToken(tokenUri,msg.sender);
  data.nftID= tokenId;
  bytes memory hash= abi.encode(createHash(abi.encodePacked(data.creatorUserID, data.nftID, data.assetName,data.assetType,data.assetDescription)));
  marketItems[hash]=data;
  allHashes.push(hash);
  return true;
  }

  function buyAsset() external {
      
  }

  function getAllMarketItem() external view onlyOwner{
      
  }

  

  
}