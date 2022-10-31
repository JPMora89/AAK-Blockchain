// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFTV2.sol";
import "./Aero.sol";

contract NFTMarketV2 is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    NFTV2 public nftContract;
    Aero public aeroContract;

    uint256 listingPrice = 0.001 ether; // price to list, to be discussed later
    enum AssetType {
        SmartContract,
        LicenseAgreement,
        Publication,
        Patent,
        Book
    }

    enum Status {
        Pending,
        Created,
        Sold
    }

    constructor() {}

    struct MarketItem {
        uint256 nftID;
        bool new_env;
        uint256 creatorUserID;
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
    mapping(bytes => MarketItem) marketItems;

    // list of hashes of user id + nftID + asset name + asset type + asset description
    bytes[] allHashes;

    function assignDeployedAddressToInstance(
        address nftContractAddress,
        address aeroContractAddress
    ) public returns (bool) {
        nftContract = NFTV2(nftContractAddress);
        aeroContract = Aero(aeroContractAddress);
        return true;
    }

    function createHash(bytes memory data) internal pure returns (bytes32) {
        return keccak256(data);
    }

    function getStatusStringValue(Status value)
        internal
        pure
        returns (string memory)
    {
        require(uint8(value) <= 3);
        if (Status.Pending == value) return "Pending";
        else if (Status.Created == value) return "Created";
        else return "Sold";
    }

    function getMarketItemStatus(bytes memory hash)
        external
        view
        returns (string memory)
    {
        string memory status = getStatusStringValue(marketItems[hash].status);
        return status;
    }

    function getMarketItem(bytes memory hash)
        external
        view
        returns (MarketItem memory)
    {
        return marketItems[hash];
    }

    function createAssetPending(MarketItem memory data) public returns (bool) {
        bytes memory hash = abi.encode(
            createHash(
                abi.encodePacked(
                    data.creatorUserID,
                    data.nftID,
                    data.assetName,
                    data.assetType,
                    data.assetDescription
                )
            )
        );
        marketItems[hash] = data;
        allHashes.push(hash);
        return true;
    }

    // sign contract
    function approvePendingAsset(
        bytes memory hash,
        string memory tokenUri,
        address signer,
        address projectOwner,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 amount
    ) external returns (bool) {
        uint256 tokenId = nftContract.createToken(tokenUri, msg.sender);
        marketItems[hash].nftID = tokenId;
        marketItems[hash].status = Status.Created;
        aeroContract.permit(signer, address(this), value, deadline, v, r, s);
        aeroContract.transferFrom(signer, projectOwner, amount);
        return true;
    }

    function createAsset(MarketItem memory data, string memory tokenUri)
        external
        returns (bool)
    {
        uint256 tokenId = nftContract.createToken(tokenUri, msg.sender);
        data.nftID = tokenId;
        bytes memory hash = abi.encode(
            createHash(
                abi.encodePacked(
                    data.creatorUserID,
                    data.nftID,
                    data.assetName,
                    data.assetType,
                    data.assetDescription
                )
            )
        );
        marketItems[hash] = data;
        allHashes.push(hash);
        return true;
    }

    function buyAsset(
        address signer,
        address nftOwner,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 amount,
        uint256 _tokenId
    ) external returns (bool) {
        //to is the seller who sells ERC721
        //from is the buyer who pays erc20 for NFT
        aeroContract.permit(signer, nftOwner, value, deadline, v, r, s);
        aeroContract.transferFrom(signer, address(this), amount);
        nftContract.transferFrom(nftOwner, signer, _tokenId);
        return true;
    }

    function getAllMarketItem(uint256 lowerBoundary, uint256 upperBoundary)
        external
        view
        onlyOwner
        returns (MarketItem[] memory)
    {
        uint256 hashesLength = allHashes.length;
        require(hashesLength >= 1, "assets are empty");
        require(
            (lowerBoundary <= hashesLength) && !(lowerBoundary < 0),
            "lower boundary should be less or equal to size and non negative"
        );
        require(
            (upperBoundary <= hashesLength) && !(upperBoundary < 0),
            "upper boundary should be less or equal to size and non negative"
        );
        MarketItem[] memory allMarkets;
        uint256 count = 0;
        for (uint256 i = lowerBoundary; i <= upperBoundary; i++) {
            allMarkets[count++] = marketItems[allHashes[i]];
        }
        return allMarkets;
    }

    function getAllHashesLength() public view returns (uint256) {
        return allHashes.length;
    }
}
