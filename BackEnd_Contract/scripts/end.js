const { ethers, getNamedAccounts } = require("hardhat");

async function endFunction() {
  console.log(
    `----------------------------------------------------------------------------------------------------`
  );
  const { deployer } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);

  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  console.log("Ended Auction...");
  const transactionResponse = await Dutch_Auction.endAuction();
  await transactionResponse.wait();
  console.log("Auction Ended!");
  console.log(
    `----------------------------------------------------------------------------------------------------`
  );
}

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

setTimeout(() => {
  endFunction();
}, 120000);

//test:10 seconds -> 10000
//test: 2 minutes -> 120000
//1200000
