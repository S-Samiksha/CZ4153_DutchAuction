const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer, userOne, userTwo } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Checking Bidder...");
  const transactionResponse = await Dutch_Auction.retrieveBidderAlgos(userOne);
  console.log(`User One bidded: ${transactionResponse}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
