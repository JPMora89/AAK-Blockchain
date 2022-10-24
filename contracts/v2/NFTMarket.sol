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

  function getStatusStringValue(Status value) internal pure returns (string memory) {
      require(uint8(value) <= 3);
      if (Status.Pending == value) return "Pending";
      else if (Status.Created == value) return "Created";
      else return "Sold";
  }

  function getMarketItemStatus(bytes memory hash) external view returns(string memory){
    string memory status=getStatusStringValue(marketItems[hash].status);
    return status;
  }

  function getMarketItem(bytes memory hash) external view returns(MarketItem memory){
      return marketItems[hash];
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

  function getAllMarketItem(uint lowerBoundary,uint upperBoundary) external view onlyOwner returns(MarketItem [] memory )
  {
    uint hashesLength= allHashes.length;
    require(hashesLength >= 1,"assets are empty");
    require((lowerBoundary <= hashesLength) && !(lowerBoundary < 0),"lower boundary should be less or equal to size and non negative");
    require((upperBoundary <= hashesLength) && !(upperBoundary < 0),"upper boundary should be less or equal to size and non negative");
    MarketItem [] memory allMarkets;
    uint count=0;
    for(uint i=lowerBoundary; i<= upperBoundary; i++)
    {
       allMarkets[count++]=marketItems[allHashes[i]];
    }
    return allMarkets;    
  }
  
}