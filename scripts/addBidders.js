const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { userOne } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", userOne);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Adding Bidder...");
  const transactionResponse = await Dutch_Auction.addBidder({
    value: ethers.parseEther("0.000000000000001"),
  });
  await transactionResponse.wait();
  console.log("Added User One!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
