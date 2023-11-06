const { ethers, getNamedAccounts } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY_INT,
  CHANGEPERMIN,
} = require("../helper-hardhat-config");

async function main() {
  const { deployer } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Starting Auction...");
  const transactionResponse = await Dutch_Auction.startAuction(
    INITIAL_SUPPLY_INT,
    CHANGEPERMIN
  );
  await transactionResponse.wait();
  console.log("Auction Started!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
