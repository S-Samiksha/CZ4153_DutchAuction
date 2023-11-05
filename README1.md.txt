# CZ4153_DutchAuction

Blockchain Project to build a DutchAuction

## Project Requirements
**Feature Requirement**
Dutch Auction smart contracts should:
- Firstly, define and implement your new token using the ERC20 standard --> **Implemented**
- Implement Dutch auction logic in another contract(s) --> **Implemented**
- Only elapse for 20 minutes, either all tokens get sold out at clearing price no lower than the reserved price, or only part of total token supply get sold with the remaining tokens burned by the auction contract
- Be able to distribute the token minted to legitimate bidders at the end of the auction --> **Implemented**
- (bonus) add tests to demonstrate the auction contract is resistant to reentry attack.
- What is reentry attack,
- hands-on practice on reentry.

<br><br>

**Tricky Points to Ponder** 
- How to enforce auction duration/countdown clock in blockchain?
- How to link/wrap your token contract with your auction contract? --> **Implemented**
- How to “burn” the unsold tokens? --> **Implemented**
- How to enforce successful bidder to pay Ether for the new token, (I.e., they can’t cancel the bid) and how to
refund bids that are invalid? --> **Implemented** ***Needs testing for invalid***

## Progress following project requirements:

1. Defined and implemented new token using the ERC20 Standard 
2. Implemented the Dutch Auction itself
3. Price is reduced every minute (TODO: change the test features later, currently it is set to every 0.5 minutes)
4. Bidders can be added
5. Number of Algos a bidder gets is updated whenever a new bidder is added 
6. When the `sendToken` function is called, tokens can be sent to the bidders. In other words, it is able to distribute the token minted to legitimate bidders at the end of the auction.
7. However, can they spend it?
8. Reserveprice is implemented 
9. Unit tests for ERC20 and Dutch Auctions are made for the above points
10. `addBidders.js`, `approveContract.js`, `checkTokenSentToBidders.js`, `retrieveBidders.js`, `sendTokens.js` are created to interact with the deployed scripts 
11. ERC20 Tokens can be burnt after the end of the auction

## Problems 

1. Approval takes time 
2. bidValue will reduce due to gas fees (so how much you send over is actually affected by gas price)
3. how to implement reserve price and 0 tokens
4. Loss of precision and ETH in division operations 
5. start button + update state --> KIV
6. Chainlink keepers, LINK Token 

### To run project:
```
git clone https://github.com/S-Samiksha/CZ4153_DutchAuction
cd CZ4153_DutchAuction
yarn
```

### To run the scripts

1. Approval has to be another transaction completely (outside of the contract)?? 
2. Stackexchange Link: https://stackoverflow.com/questions/77102630/erc20-insufficient-allowance-approve-function-is-not-working-for-depositing

```
yarn hardhat node 
yarn hardhat run scripts/approveContract.js --network localhost 

```

### References:

https://github.com/lamtlo/Solidity-Dutch-Auction/blob/master/contracts/Auction.sol <br>
https://www.algorand.foundation/algo-auction-overview <br>
https://github.com/reddio-com/NFT-Marketplace <br>
https://github.com/BlockchainCourseNTU/hello-dapp/tree/AY2023-AY2024 <br>