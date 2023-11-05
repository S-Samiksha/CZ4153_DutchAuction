# CZ4153_DutchAuction

Blockchain Project to build a DutchAuction

## Project members
- Sankar Samiksha
- Poon Yan Xin Melise 

## Project Requirements
**Feature Requirement**
Dutch Auction smart contracts should:
- Firstly, define and implement your new token using the ERC20 standard 
- Implement Dutch auction logic in another contract(s) 
- Only elapse for 20 minutes, either all tokens get sold out at clearing price no lower than the reserved price, or only part of total token supply get sold with the remaining tokens burned by the auction contract
- Be able to distribute the token minted to legitimate bidders at the end of the auction
- (bonus) add tests to demonstrate the auction contract is resistant to reentry attack.
- What is reentry attack,
- hands-on practice on reentry.

<br><br>

**Tricky Points to Ponder** 
- How to enforce auction duration/countdown clock in blockchain?
- How to link/wrap your token contract with your auction contract? 
- How to “burn” the unsold tokens?
- How to enforce successful bidder to pay Ether for the new token, (I.e., they can’t cancel the bid) and how to
refund bids that are invalid? 


## Re Entrancy Attack 


### To run project:
```
git clone https://github.com/S-Samiksha/CZ4153_DutchAuction
cd CZ4153_DutchAuction
```

### To run the scripts

```
yarn 
yarn hardhat node # to deploy the contracts in local host 
yarn hardhat run scripts/start.js --network localhost # to interact with the deployed contract on localhost

```

### References:

https://github.com/lamtlo/Solidity-Dutch-Auction/blob/master/contracts/Auction.sol <br>
https://www.algorand.foundation/algo-auction-overview <br>
https://github.com/reddio-com/NFT-Marketplace <br>
https://github.com/BlockchainCourseNTU/hello-dapp/tree/AY2023-AY2024 <br>