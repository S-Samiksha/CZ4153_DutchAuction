# CZ4153_DutchAuction
Blockchain Project to build a DutchAuction 

### References:
https://github.com/lamtlo/Solidity-Dutch-Auction/blob/master/contracts/Auction.sol <br>
https://www.algorand.foundation/algo-auction-overview <br>

### Ideas:
For each bidder, keep track of how much money they bid. <br>
When they bid, reduce the supply. <br>
As the price drops periodically, each bidder will have an increasing number of algos they can receive. <br>

### Problems:
1. Timestamp --> running the functions every minute
2. FrontEnd Connection 


### Pseudocode:
```solidity

uint256 currentPrice; //in wei
uint256 currentUnsoldAlgos;
uint256 totalAlgosAvailable;
uint256 totalNumBidders = 0;
uint256 reservePrice;

struct bidder{
uint256 bidderID;
address walletAddress;
uint256 bidValue; //the value they bidded
uint256 totalAlgosPurchased; //this will change everytime somebody else bids 
}

//an array of bidders for FIFO allocation at the end of the auction
//mapping to allow changes to the structure

function addBid(uint256 walletAddress, uint256 bidValue){
// 1. check if the bidder exists
// 2. if does not exist, create a structure and add to the mapping
// 3. if exists, replace  the bidValue
// 4. decrement the currentUnsoldAlgos according to the current price => currentUnsoldAlgos -= bidValue/Price
// 5. Check if there are enough algos as well --> clearing price 
}

function updateAllBiders(){
//called only when the price falls
//price falls, then update each mapping by totalAlgosPurchased = bidValue/currentPrice
}

function decrementPrice(){
//every minute, reduce the currentPrice by x amount of ETH
//call the updateAllBiders function
//check if it hits the reserve price
// if it does, allocate the algos 
}

function endAuction(){
// Using the currentprice, send the eth to the wallet address
}

```



