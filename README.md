# CZ4153_DutchAuction

Blockchain Project to build a DutchAuction

# install packages
- hardhat
- hardhat deploy 

# Environment 
- WSL Ubuntu 


### Ideas:

For each bidder, keep track of how much money they bid. <br>
When they bid, reduce the supply. <br>
As the price drops periodically, each bidder will have an increasing number of algos they can receive. <br>
After 20 minutes, "end the auction" <br>

1. Distribute tokens to bidders
2. Burn remaining tokens that were left unsold

### Problems:

1. Timestamp --> running the functions every minute
   Update: no need to run every minute, can just use a function to keep track of number of tokens left
2. FrontEnd Connection

### Bonus:

Add tests to demonstrate auction contract is resistant to re-entry attack <br>
https://www.certik.com/resources/blog/3K7ZUAKpOr1GW75J2i0VHh-what-is-a-reentracy-attack

- basically is when another contract attacks our contract by constantly calling the withdraw function to withdraw the funds
- occurs b/c vulnerable smart contract first checking the balance, then sending the funds, and then finally updating its balance

### To run project:
```
git clone https://github.com/S-Samiksha/CZ4153_DutchAuction
cd CZ4153_DutchAuction
yarn
```

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
// 6. UpdateAllBiders and the current price as well
}

function updateAllBiders(){
//called only when the price falls
//price falls, then update each mapping by totalAlgosPurchased = bidValue/currentPrice
}

// to time that 20mins have passed
// run this immediately when contract deployed
function find20Min(){
//????
}

function endAuction(){
// Using the currentprice, send the eth to the wallet address
}

function burnRemainingTokens(uint256 currentUnsoldAlgos){
// to burn the remaining tokens that were left unsold after auction closes
}


```
### Deployed to testnet (for testing, SEPOLIA):
1. https://sepolia.etherscan.io/address/0x75bc2A1f9097837A3313C198A332f376fd7b587f#code

### References:

https://github.com/lamtlo/Solidity-Dutch-Auction/blob/master/contracts/Auction.sol <br>
https://www.algorand.foundation/algo-auction-overview <br>

