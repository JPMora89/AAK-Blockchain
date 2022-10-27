// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";



contract NFTV2 is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    modifier onlyMarketplace() {
        require(msg.sender == contractAddress, "Not called by marketplace");
        _;
    }

    constructor(address marketplaceAddress) ERC721("AAK Metamarket", "AAM") {
        contractAddress = marketplaceAddress;
    }

    
    function createToken(string memory tokenURI, address nftOwner) onlyMarketplace public returns (uint256)  {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(nftOwner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}
