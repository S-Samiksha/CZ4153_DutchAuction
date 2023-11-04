// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import "./Dutch_Auction.sol";

contract ReentranceAttack {
    Dutch_Auction target;

    constructor(address payable _target) payable {
        target = Dutch_Auction(_target);
    }

    function ReentranceAttack1() public {
        target.addBidder{value: 0.01 ether}();
    }

    // function() external payable {};
}
