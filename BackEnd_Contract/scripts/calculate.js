const { ethers, getNamedAccounts } = require("hardhat");
let start = Date.now();

async function myFunction(currentTime) {
  const { deployer, userOne, userTwo } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(
    `----------------------------------------------------------------------------------------------------`
  );
  console.log(`Dutch Contract: ${Dutch_Auction.target}`);
  auctionState = await Dutch_Auction.getAuctionState();
  if (auctionState == 0) {
    transactionResponse = await Dutch_Auction.calculate();
    currentPrice = await Dutch_Auction.retrieveCurrentPrice();
    totalBidders = await Dutch_Auction.retrieveTotalBidder();
    timeElapsed = (currentTime - start) / 1000;
    unsoldAlgos = await Dutch_Auction.getUnsoldAlgos();

    console.log(
      `Time Elapsed from contract deployment: ${
        timeElapsed / 60
      }, Current price: ${currentPrice}, Total Bidders: ${totalBidders}, unsold tokens: ${unsoldAlgos}`
    );
  } else {
    console.log(`Auction is closed`);
  }
  console.log(
    `----------------------------------------------------------------------------------------------------`
  );
  console.log(` `);
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
