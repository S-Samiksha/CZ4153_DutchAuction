const { ethers, getNamedAccounts } = require("hardhat");
let start = Date.now();

async function myFunction(currentTime) {
  const { deployer, userOne, userTwo } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(`Got contract DA at ${Dutch_Auction.target}`);
  transactionResponse = await Dutch_Auction.calculate();
  currentPrice = await Dutch_Auction.retrieveCurrentPrice();
  totalBidders = await Dutch_Auction.retrieveTotalBidder();
  timeElapsed = (currentTime - start) / 1000;
  unsoldAlgos = await Dutch_Auction.getUnsoldAlgos();

  console.log(
    `Time Elapsed: %i minutes, Current price: %i, Total Bidders: %i, unsold tokens: %i`,
    timeElapsed / 60,
    currentPrice,
    totalBidders,
    unsoldAlgos
  );
  console.log();
}

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

let timerId = setInterval(() => myFunction(Date.now()), 60000);

// after 5 seconds stop
setTimeout(() => {
  clearInterval(timerId);
  myFunction(Date.now());
}, 1200000);
