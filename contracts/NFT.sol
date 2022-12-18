// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "hardhat/console.sol";
import "./v2/interfaces/INFT.sol";

contract NFT is ERC721URIStorage, INFT {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("AAK Metamarket", "AAM") {
        contractAddress = marketplaceAddress;
        setApprovalForAll(contractAddress, true);
    }

    function createToken(address _owner, string memory _tokenURI)
        external
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(_owner, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        return newItemId;
    }
}
