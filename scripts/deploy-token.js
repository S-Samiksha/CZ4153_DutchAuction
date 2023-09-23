const { ethers } = require("hardhat");

async function main(){
    const Token = await ethers.getContractFactory("ERC20Token");
    const token = await Token.deploy("ERC20Token","OurToken", 10); //shows the name, symbol, initial supply
    await token.deployed();

    console.log("Token deployed to: ", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });