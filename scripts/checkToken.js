const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer, userOne, userTwo } = await getNamedAccounts();
  const ERC20Token_u1 = await ethers.getContract("ERC20Token", deployer);
  console.log(`Got contract DA at ${ERC20Token_u1.target}`);
  console.log("Checking Bidder...");
  const transactionResponse = await ERC20Token_u1.balanceOf(userOne);
  console.log(`User One got (with 18 decimals): ${transactionResponse}`);
  console.log(
    `User One got (without 18 decimals): ${
      transactionResponse / BigInt(10 ** 18)
    }`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
