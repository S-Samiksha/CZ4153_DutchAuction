# CZ4153_DutchAuction
Blockchain Project to build a DutchAuction 

### References:
https://github.com/lamtlo/Solidity-Dutch-Auction/blob/master/contracts/Auction.sol <br>
https://www.algorand.foundation/algo-auction-overview <br>

### Ideas:

For each bidder, keep track of how much money they bid. <br>
When they bid, reduce the supply. <br>
As the price drops periodically, each bidder will have an increasing number of algos they can receive. <br>

### Variables:
```solidity
uint256 currentPrice; //in wei <br>
```



