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

## Functions in Solidity

### Constructor

**Parameters**:
`_reservePrice`: The minimum price of tokens <br>
`_startPrice` : The starting price of a token <br>

```Solidity
constructor(uint256 _reservePrice, uint256 _startPrice) {
        require(
            _reservePrice < _startPrice,
            "reserve price is higher than current price"
        );
        i_owner = msg.sender;
        reservePrice = _reservePrice;
        currentPrice = int256(_startPrice);
        startPrice = _startPrice;

        s_auctionState = AuctionState.CLOSING;
    }

```

### startAuction

**Parameters**: <br>
`_totalAlgosAvailable`: Total number of tokens to be mint for this round of auction <br>
`_changePerMin`: rate of reduction of ETH cost per token. E.g. 10 wei/min means that the cost of one token will fall by 10 wei per min. <br>

```Solidity
function startAuction(
        uint256 _totalAlgosAvailable,
        uint256 _changePerMin
    ) public onlyOwner AuctionClosed returns (address) {
        s_auctionState = AuctionState.OPEN;
        totalAlgosAvailable = _totalAlgosAvailable;
        changePerMin = _changePerMin;
        startTime = block.timestamp; //Start time of when the contract is deployed
        DAToken = new ERC20Token(totalAlgosAvailable, address(this));
        ERC20ContractAddress = address(DAToken);
        emit startAuctionEvent(
            startTime,
            ERC20ContractAddress,
            totalAlgosAvailable,
            changePerMin
        );
        return ERC20ContractAddress;
    }
```

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
