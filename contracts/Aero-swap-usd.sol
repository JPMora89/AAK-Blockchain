// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./v2/Aero.sol";

contract AeroSwapUsd {
    address public admin;
    Aero public token;
    uint256 public tokensSold;

    event Sell(address indexed _buyer, uint256 _amount);

    constructor(Aero _token) {
        admin = msg.sender;
        token = _token;
    }

//To let users buy Aero Tokens for ETH
    function buyTokens(uint256 _numberOfTokens) public payable {
        
        require(token.balanceOf(address(this)) >= _numberOfTokens, "Insufficient tokens in contract");
        require(token.transfer(msg.sender, _numberOfTokens), "Token transfer failed");
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

//To let users sell their Aero Tokens for ETH
   function sellTokens(uint256 _numberOfTokens) public payable{
        
        require(token.balanceOf(msg.sender) >= _numberOfTokens, "Insufficient tokens balance");
        require(token.transferFrom(msg.sender, address(this), _numberOfTokens), "Token transfer failed");
        tokensSold -= _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }


}
