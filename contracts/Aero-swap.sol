// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./v2/Aero.sol";

contract AeroSwap {
    address public admin;
    Aero public token;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    uint256 public feePercent;
    address public feeAddress;

    event Sell(address indexed _buyer, uint256 _amount);

    constructor(Aero _token, uint256 _tokenPrice,uint256 _feePercent, address _feeAddress) {
        admin = msg.sender;
        token = _token;
        tokenPrice = _tokenPrice;
        feePercent = _feePercent;
        feeAddress = _feeAddress;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        uint256 pricePerToken = tokenPrice/(10**18);
        uint256 totalFee = (_numberOfTokens * feePercent)/100;
        uint256 totalAmount = (_numberOfTokens-totalFee)* pricePerToken;

        require(msg.value >= totalAmount, "Invalid amount of ether sent");
        require(token.balanceOf(address(this)) >= _numberOfTokens, "Insufficient tokens in contract");
        require(token.transfer(msg.sender, _numberOfTokens - totalFee), "Token transfer failed");
        require(token.transfer(feeAddress, totalFee),"Token transfer failed");
        tokensSold += _numberOfTokens - totalFee;
        emit Sell(msg.sender, _numberOfTokens-totalFee);
    }

    function endSale() public {
        require(msg.sender == admin, "Only admin can end sale");
        require(token.transfer(admin, token.balanceOf(address(this))), "Token transfer failed");
        payable(admin).transfer(address(this).balance);
    }
}
