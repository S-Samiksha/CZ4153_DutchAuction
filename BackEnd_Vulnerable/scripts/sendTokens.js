const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer, userOne, userTwo } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Sending ERC20s to Bidder...");
  const transactionResponse = await Dutch_Auction.sendTokens();
  console.log(`Done sending!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
