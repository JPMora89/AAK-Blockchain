// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "./NFTV2.sol";
import "./Aero.sol";

contract NFTMarketV2 is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    NFTV2 private nftContract;
    Aero private aeroContract;
    bytes32 public _PERMIT_TYPEHASH =
        keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

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

    struct BuyRequest {
        uint256 paidAmountAeroToken;
        address buyerAddress;
        address nftOwnerAddress;
        uint256 nftId;
    }
    // nftOwner -> tokenId -> buyrequest
    mapping(address => mapping(uint256 => BuyRequest)) buyerRequest;

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
    address private aeroAdd;

    function assignDeployedAddressToInstance(
        address nftContractAddress,
        address aeroContractAddress
    ) public returns (bool) {
        nftContract = NFTV2(nftContractAddress);
        aeroContract = Aero(aeroContractAddress);
        aeroAdd = aeroContractAddress;
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

    function createAssetForSell(
        MarketItem memory data,
        string memory tokenUri,
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 deadline
    ) external {
        uint256 tokenId = nftContract.createToken(tokenUri, msg.sender);
        nftContract.permit(address(this), tokenId, deadline, v, r, s);
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
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address nftOwner,
        uint256 _tokenId
    ) external returns (bool) {
        //to is the seller who sells ERC721
        //transfer Aero to contract's address
        BuyRequest memory brequest;
        brequest.paidAmountAeroToken = value;
        brequest.buyerAddress = owner;
        brequest.nftOwnerAddress = nftOwner;
        brequest.nftId = _tokenId;
        buyerRequest[nftOwner][_tokenId] = brequest;

        aeroContract.permit(owner, spender, value, deadline, v, r, s);
        aeroContract.increaseAllowance(spender, value);
        aeroContract.transferFrom(owner, address(this), value);
        return true;
    }

    function ERC20_DOMAIN_SEPARATOR() public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256(bytes("Aero")),
                    keccak256(bytes("1")),
                    block.chainid,
                    aeroAdd
                )
            );
    }

    // will be called by Nft Owner

    function buyAssetApprove(
        address nftOwner,
        uint256 _tokenId,
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 deadline,
        uint256 nonce,
        uint8 vN,
        bytes32 rN,
        bytes32 sN
    ) external returns (bool) {
        BuyRequest memory brequest;
        brequest = buyerRequest[nftOwner][_tokenId];

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                ERC20_DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        _PERMIT_TYPEHASH,
                        brequest.buyerAddress,
                        address(this),
                        brequest.paidAmountAeroToken,
                        nonce,
                        deadline
                    )
                )
            )
        );
        require(
            brequest.buyerAddress == ecrecover(digest, v, r, s),
            "Invalid Signature!"
        );
        aeroContract.transferFrom(
            address(this),
            nftOwner,
            brequest.paidAmountAeroToken
        );
        //permit the ERC721
        nftContract.permit(address(this), _tokenId, deadline, vN, rN, sN);
        //transfer token
        nftContract.transferFrom(nftOwner, brequest.buyerAddress, _tokenId);
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

    function mintNFT(address nftOwner) external returns (uint256) {
        uint256 tokenId = nftContract.createToken("tokenUri", nftOwner);
        return tokenId;
    }

    function getAllHashesLength() public view returns (uint256) {
        return allHashes.length;
    }
}
