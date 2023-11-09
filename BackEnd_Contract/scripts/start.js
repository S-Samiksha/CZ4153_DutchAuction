const { ethers, getNamedAccounts } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY_INT,
  CHANGEPERMIN,
} = require("../helper-hardhat-config");

async function main() {
  console.log(
    `----------------------------------------------------------------------------------------------------`
  );
  const { deployer } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Starting Auction...");
  const transactionResponse = await Dutch_Auction.startAuction(
    INITIAL_SUPPLY_INT,
    CHANGEPERMIN
  );
  await transactionResponse.wait();

  currentPrice = await Dutch_Auction.retrieveCurrentPrice();
  totalBidders = await Dutch_Auction.retrieveTotalBidder();
  unsoldAlgos = await Dutch_Auction.getUnsoldAlgos();

  console.log(
    `Current price: ${currentPrice}, Total Bidders: ${totalBidders}, unsold tokens: ${unsoldAlgos}`
  );

  console.log("Auction Started!");
  console.log(
    `----------------------------------------------------------------------------------------------------`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
