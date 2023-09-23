// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Token is ERC20, Ownable {

    // constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20("OurToken", "OT") {
    //     _mint(msg.sender, initialSupply);
    // }

    // Melise's version
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function burn(uint256 amount) public onlyOwner{
        _burn(msg.sender, amount);
    }
}
