// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract ERC20Token is Context, ERC20 {
    constructor(uint256 initialSupply) ERC20("ERC20Token", "ET") {
        //To Note: there are 18 decimals by default
        // If initial supply is 50, we have to put in 50e18 or 50 * 10**18
        _mint(msg.sender, initialSupply * (10 ** 18)); //Allows us to create the intial amount of tokens
    }

    function burn(uint256 amount) public {
        _burn(address(this), amount * (10 ** 18));
    }
}
