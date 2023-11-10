const { ethers, getNamedAccounts } = require("hardhat");

async function myFunction() {
  const { deployer, userOne, userTwo } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", deployer);
  console.log(
    `----------------------------------------------------------------------------------------------------`
  );
  console.log(`Dutch Contract: ${Dutch_Auction.target}`);
  transactionResponse = await Dutch_Auction.calculate();
  currentPrice = await Dutch_Auction.retrieveCurrentPrice();
  totalBidders = await Dutch_Auction.retrieveTotalBidder();
  timeElapsed = await Dutch_Auction.retrieveTimeElapsed();
  unsoldAlgos = await Dutch_Auction.getUnsoldAlgos();
  auctionState = await Dutch_Auction.getAuctionState();

  console.log(
    `Time Elapsed from start: ${timeElapsed} min, Current price: ${currentPrice}, Total Bidders: ${totalBidders}, unsold tokens: ${unsoldAlgos}`
  );
  for (i = 0; i < totalBidders; i++) {
    bids = await Dutch_Auction.retrieveBidderAlgos(i);
    console.log(`Bidder: ${i} -> Total Algos/ERC20 Bidded: ${bids}`);
  }
  if (auctionState == 1) {
    console.log(`Auction is closed`);
  } else {
    console.log(`Auction is open`);
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

// after 20 min --> stop
setTimeout(() => {
  clearInterval(timerId);
  myFunction();
}, 21 * 60 * 1000);

//
