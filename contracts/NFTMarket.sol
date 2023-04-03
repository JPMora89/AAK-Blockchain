// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./v2/Aero.sol";
import "./NFT.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    Aero private aeroToken; // Aero Token For currency on Marketplace
    address payable owner;
    uint256 listingPrice = 0.001 ether; // price to list, to be discussed later

    constructor(address aeroTokenAddress) {
        owner = payable(msg.sender); // this is the address that deploys the contract => AAK
        aeroToken = Aero(aeroTokenAddress);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        address owner;
        address[] sharedAddrs;
        uint8[] sharedItemPermissions;
        uint256 price;
        bool isPrivateAsset;
        bool sold;
        UrlParameters urlParameters;
    }

    struct UrlParameters {
        string profileName;
        string profileUserName;
        string projectName;
        string projectSlug;
        string environment; // 1- react django,0- elgg
        string userType; //researcher-0, invester-1, institution stuff -2, institution-3, service provider-4,, events-5, projects-6,team-7
    }

    /* this mapping will allow us to get values associated with an item ID */
    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        address[] sharedAddrs,
        uint8[] sharedItemPermissions,
        uint256 price,
        bool isPrivateAsset,
        bool sold,
        UrlParameters urlParameters
    );

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Places an item for sale on the marketplace */
    /* Maybe we need to discuss how this item will be sent over the other party */
    /* Maybe instead of the item itself user1 could just send a link */
    function createMarketItem(
        address nftContract,
        string memory tokenURI,
        uint256 price,
        bool isPrivateAsset,
        UrlParameters memory urlParameters
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Transaction fee must be equal to listing price"
        );

        uint256 _tokenId = INFT(nftContract).createToken(msg.sender, tokenURI);

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            _tokenId,
            msg.sender,
            address(0), // nobody owns the item yet, bacause it's for sale
            new address[](0),
            new uint8[](0),
            price,
            isPrivateAsset,
            false,
            urlParameters
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), _tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            _tokenId,
            msg.sender,
            address(0),
            new address[](0),
            new uint8[](0),
            price,
            isPrivateAsset,
            false,
            urlParameters
        );
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(
        address nftContract,
        uint256 itemId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public nonReentrant {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            aeroToken.balanceOf(msg.sender) >= price,
            "Please submit the asking price in order to complete the purchase"
        );

        aeroToken.permit(msg.sender, address(this), price, deadline, v, r, s);
        aeroToken.increaseAllowance(idToMarketItem[itemId].seller, price);
        aeroToken.transferFrom(
            msg.sender,
            idToMarketItem[itemId].seller,
            price
        );

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = msg.sender;
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);
    }

    /* Returns all unsold market items */
    /* We might not need it, it depends what kind of features we want */
    /* But it could be useful in the future */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            /* detect unsold items - if there is no address for the owner */
            /* then the item has not been sold yet */
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns market item by Token Id */
    /* We might not need it, it depends what kind of features we want */
    /* But it could be useful in the future */
    function fetchMarketItemById(
        uint256 id
    ) public view returns (MarketItem memory) {
        require(id <= _itemIds.current(), "Invalid Item Id");
        MarketItem memory item = idToMarketItem[id];
        return item;
    }

    /* Returns only items that a user has purchased */
    /* This will be useful to show the items (contracts history) of one account */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has created */
    /* Important when we create a user's portfolio to show their contracts */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* set shared addresses to MarketItem */
    function setSharedAddress(
        uint256 id,
        address[] memory addrs,
        uint8[] memory permissions
    ) public {
        require(
            idToMarketItem[id].isPrivateAsset,
            "Market item is not private"
        );
        idToMarketItem[id].sharedAddrs = addrs;
        idToMarketItem[id].sharedItemPermissions = permissions;
    }

    /* set permission of a address to MarketItem */
    function setPermissionSharedAddress(
        uint256 id,
        address addr,
        uint8 permission
    ) public {
        require(
            idToMarketItem[id].isPrivateAsset,
            "Market item is not private"
        );

        for (uint256 i = 0; i < idToMarketItem[id].sharedAddrs.length; i++) {
            if (idToMarketItem[id].sharedAddrs[i] == addr) {
                idToMarketItem[id].sharedItemPermissions[i] = permission;
            }
        }
    }
}
