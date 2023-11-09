const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { userThree } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", userThree);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Adding Bidder...");
  const transactionResponse = await Dutch_Auction.addBidder({
    value: ethers.parseEther("0.0000000000000024"),
  });
  await transactionResponse.wait();
  console.log("Added User Three!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
