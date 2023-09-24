const { ethers, getNamedAccounts } = require("hardhat");
const { INITIAL_SUPPLY } = require("../helper-hardhat-config");

async function main() {
  const { userOne, deployer } = await getNamedAccounts();
  const ERC20Token = await ethers.getContract("ERC20Token", deployer);
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(`Got contract ERC20Token at ${ERC20Token.target}`);
  console.log("Approving Dutch Auction to hold ERC20s...");
  const transactionResponse = await ERC20Token.approve(
    Dutch_Auction.target,
    INITIAL_SUPPLY
  );
  await transactionResponse.wait();
  console.log("Approved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
