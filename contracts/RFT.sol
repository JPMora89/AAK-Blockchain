// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

contract RFT is ERC20 {
    uint public sharePrice;
    uint public shareSupply;
    uint public dealEnd;

    uint public nftId;
    IERC721 public nft;
    IERC20 public dai;

    address public admin;

    constructor (
        string memory _name,
        string memory _symbol,
        address _nftAddress,
        uint _nftId,
        uint _sharePrice,
        uint _shareSupply,
        address _daiAddress
    )

    ERC20(_name, _symbol) {
        nftId = _nftId;
        nft = IERC721(_nftAddress);
        sharePrice = _sharePrice;
        shareSupply = _shareSupply;
        dai = IERC20(_daiAddress);
        admin = msg.sender;
    }

    function startDeal() external {
        require(msg.sender == admin, "only admin");
        nft.transferFrom(msg.sender, address(this), nftId);
        dealEnd = block.timestamp + 86400;   // one day to end deal
    } 

    function buyShare(uint shareAmount) external {
        require(dealEnd > 0, "ICO not started yet");
        require(block.timestamp <= dealEnd, "ICO is finished");
        require(totalSupply() + shareAmount <= shareSupply, "not enough shares");

        uint daiAmount = shareAmount * sharePrice;
        dai.transferFrom(msg.sender, address(this), daiAmount);

        _mint(msg.sender, shareAmount);
    }

    function withdrawProfits() external {
        require(msg.sender == admin, "only admin");
        require(block.timestamp > dealEnd, "ICO not finished yet");

        uint daiBalance = dai.balanceOf(address(this));
        if (daiBalance > 0) {
            dai.transfer(admin, daiBalance);
        }
        uint unsoldShareBalance = shareSupply - totalSupply();
        if (unsoldShareBalance > 0) {
            _mint(admin, unsoldShareBalance);
        }
    }

    
}