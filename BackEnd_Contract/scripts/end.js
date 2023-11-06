const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  const ERC20Token = await ethers.getContract("ERC20Token", deployer);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Ended Auction...");
  const transactionResponse = await Dutch_Auction.endAuction();
  await transactionResponse.wait();
  console.log("Auction Ended!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
