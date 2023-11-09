const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { userTwo } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", userTwo);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Adding Bidder...");
  const transactionResponse = await Dutch_Auction.addBidder({
    value: ethers.parseEther("0.000000000000002"),
  });
  await transactionResponse.wait();
  console.log("Added User Two!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
