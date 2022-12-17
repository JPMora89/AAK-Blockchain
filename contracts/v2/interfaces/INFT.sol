// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface INFT {
    /**
     * @dev Create NFT
     */
    function createToken(address _owner, string memory _tokenURI)
        external
        returns (uint256);
}
