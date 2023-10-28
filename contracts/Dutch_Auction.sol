// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

// Using our own ERC20Token
import "./ERC20Token.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

error Dutch_Auction__NotOwner();
error Dutch_Auction__IsOwner();
error Dutch_Auction__NotOpen();
error Dutch_Auction__Open();
error Dutch_Auction__UpKeepNotNeeded(uint256 auctionState);

contract Dutch_Auction is AutomationCompatibleInterface {
    int256 private currentPrice; //in wei
    uint256 private totalNumBidders = 0;
    uint256 private immutable startPrice; //in wei
    uint256 private immutable reservePrice;
    address private immutable i_owner;
    uint256 private immutable totalAlgosAvailable;
    uint256 private startTime;
    uint256 private constant AUCTION_TIME = 1200; //in seconds
    uint256 private currentUnsoldAlgos;
    uint256 private immutable i_interval;

    ERC20Token private DAToken; //importing Token
    address private ERC20ContractAddress;
    address[] biddersAddress;

    mapping(address => Bidder) public biddersList; //to be made private later <for debugging purposes>

    struct Bidder {
        uint256 bidderID;
        address walletAddress;
        uint256 bidValue; //the value they paid to the contract to purchase the algo
        uint256 totalAlgosPurchased;
        uint256 refundEth;
        bool isExist;
    }

    // Variable to indicate auction's state --> type declaration
    enum AuctionState {
        OPEN,
        CLOSING
    } // uint256 0: OPEN, 1: CLOSED

    AuctionState private s_auctionState;

    /*Constructor*/
    constructor(
        uint256 _reservePrice,
        uint256 _startPrice,
        uint256 _totalAlgosAvailable,
        uint256 _interval
    ) {
        require(
            _reservePrice < _startPrice,
            "reserve price is higher than current price"
        );
        i_owner = msg.sender;
        reservePrice = _reservePrice;
        totalAlgosAvailable = _totalAlgosAvailable;
        currentPrice = int256(_startPrice);
        startPrice = _startPrice;

        i_interval = _interval;
        s_auctionState = AuctionState.CLOSING;
    }

    /* modifiers */
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert Dutch_Auction__NotOwner();
        _; //do the rest of the function
    }

    modifier notOwner() {
        // require(msg.sender == owner);
        if (msg.sender == i_owner) revert Dutch_Auction__IsOwner();
        _; //do the rest of the function
    }

    modifier AuctionOpen() {
        // require(msg.sender == owner);
        if (AuctionState.CLOSING == s_auctionState)
            revert Dutch_Auction__NotOpen();
        _; //do the rest of the function
    }

    modifier AuctionClosed() {
        // require(msg.sender == owner);
        if (AuctionState.OPEN == s_auctionState) revert Dutch_Auction__Open();
        _; //do the rest of the function
    }

    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = AuctionState.OPEN == s_auctionState;
        // need to check (block.timestamp - last block timestamp) > interval
        bool timePassed = (block.timestamp - startTime) > i_interval;
        // if this is true, end auction and burn tokens
        upkeepNeeded = (isOpen && timePassed); // if true, end auction
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        // want some validation such that only gets called when checkupkeep is true
        (bool upkeepNeeded, ) = checkUpkeep("");
        // if ((block.timestamp - lastTimeStamp) > interval) {
        //     lastTimeStamp = block.timestamp;
        // }
        if (!upkeepNeeded) {
            revert Dutch_Auction__UpKeepNotNeeded(uint256(s_auctionState));
        }
        s_auctionState = AuctionState.CLOSING;
        // only owner can end auction

        if (upkeepNeeded) {
            // if never sell finish, burn all remaining algos
            endAuction();
        }
    }

    /***
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     */

    /**
     * public functions
     *
     * */
    event startAuctionEvent(uint256 startTime, address ERC20Address);
    event addBidderEvent(
        uint256 bidderID,
        address walletAddress,
        uint256 bidvalue
    );

    function startAuction(address _token) public onlyOwner AuctionClosed {
        s_auctionState = AuctionState.OPEN;
        startTime = block.timestamp; //Start time of when the contract is deployed
        DAToken = ERC20Token(_token);
        ERC20ContractAddress = _token;
        emit startAuctionEvent(startTime, _token);
    }

    //Reference: https://docs.soliditylang.org/en/latest/types.html#structs

    function addBidder() public payable notOwner AuctionOpen {
        //checking all the requirements
        require(msg.value > 0, "bidValue less than 0");
        require(block.timestamp - startTime < AUCTION_TIME, "time is up");

        // Adding or Updating the bidders currently in the contract
        if (!biddersList[msg.sender].isExist) {
            Bidder storage newBidder = biddersList[msg.sender];
            newBidder.bidderID = ++totalNumBidders;
            newBidder.walletAddress = msg.sender;
            newBidder.bidValue = msg.value;
            newBidder.isExist = true;
            newBidder.totalAlgosPurchased = 0;
            newBidder.refundEth = 0;
            biddersAddress.push(msg.sender);
            emit addBidderEvent(
                newBidder.bidderID,
                newBidder.walletAddress,
                newBidder.bidValue
            );
        } else {
            Bidder storage existingBidder = biddersList[msg.sender];
            existingBidder.bidValue += msg.value;
        }
    }

    /*Internal Functions */
    //TODO: make this internal later
    function updateCurrentPrice() public onlyOwner {
        currentPrice =
            int256(startPrice) -
            int256((block.timestamp - startTime) / 30) *
            10;

        if (currentPrice <= 0 || currentPrice <= int256(reservePrice)) {
            currentPrice = int256(reservePrice);
        }
    }

    /*
    triggered when either algos runs out or time runs out 
    */

    function sendTokens() public onlyOwner AuctionClosed {
        for (uint i = 0; i < biddersAddress.length; i++) {
            if (biddersList[biddersAddress[i]].totalAlgosPurchased > 0) {
                DAToken.approve(
                    biddersAddress[i],
                    biddersList[biddersAddress[i]].totalAlgosPurchased *
                        10 ** 18
                );
                DAToken.transferFrom(
                    i_owner,
                    biddersAddress[i],
                    biddersList[biddersAddress[i]].totalAlgosPurchased *
                        10 ** 18
                );
            }
        }
    }

    function calculate() public onlyOwner AuctionClosed {
        updateCurrentPrice();
        uint256 currentAlgos = totalAlgosAvailable;
        for (uint i = 0; i < biddersAddress.length; i++) {
            if (
                currentAlgos >
                biddersList[biddersAddress[i]].bidValue / uint256(currentPrice)
            ) {
                biddersList[biddersAddress[i]].totalAlgosPurchased =
                    biddersList[biddersAddress[i]].bidValue /
                    uint256(currentPrice);
                currentAlgos -=
                    biddersList[biddersAddress[i]].bidValue /
                    uint256(currentPrice);
                //or we ask them to pay in the end
            } else if (
                currentAlgos > 0 &&
                currentAlgos <=
                biddersList[biddersAddress[i]].bidValue / uint256(currentPrice)
            ) {
                biddersList[biddersAddress[i]]
                    .totalAlgosPurchased = currentAlgos;
                currentAlgos = 0;
                biddersList[biddersAddress[i]].refundEth =
                    biddersList[biddersAddress[i]].bidValue -
                    biddersList[biddersAddress[i]].totalAlgosPurchased *
                    uint256(currentPrice);
                //refundETH
                (bool callSuccess, ) = payable(
                    biddersList[biddersAddress[i]].walletAddress
                ).call{value: biddersList[biddersAddress[i]].refundEth}("");
                require(callSuccess, "Failed to send ether");
            } else if (
                currentAlgos <= 0 &&
                biddersList[biddersAddress[i]].totalAlgosPurchased == 0
            ) {
                //refund for the rest
                biddersList[biddersAddress[i]].refundEth = biddersList[
                    biddersAddress[i]
                ].bidValue;
                (bool callSuccess, ) = payable(
                    biddersList[biddersAddress[i]].walletAddress
                ).call{value: biddersList[biddersAddress[i]].refundEth}("");
                require(callSuccess, "Failed to send ether");
            }
        }
        if (currentAlgos > 0) {
            currentUnsoldAlgos = currentAlgos;
        }
    }

    function endAuction() public onlyOwner {
        s_auctionState = AuctionState.CLOSING;
        calculate();
        sendTokens();
        if (currentUnsoldAlgos > 0) {
            DAToken.burn(i_owner, currentUnsoldAlgos);
        }
    }

    fallback() external payable {
        addBidder();
    }

    receive() external payable {
        addBidder();
    }

    /**View and Pure Function */

    function retrieveTotalAlgos() public view onlyOwner returns (uint256) {
        return totalAlgosAvailable;
    }

    function retrieveReservePrice() public view onlyOwner returns (uint256) {
        return reservePrice;
    }

    function retrieveCurrentPrice() public view onlyOwner returns (int256) {
        return currentPrice;
    }

    function retrieveTotalBidder() public view onlyOwner returns (uint256) {
        return totalNumBidders;
    }

    function retrieveContractOwner() public view onlyOwner returns (address) {
        return i_owner;
    }

    function retrieveContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function retrieveBidderBidValue(
        address bidder
    ) public view onlyOwner returns (uint256) {
        return biddersList[bidder].bidValue;
    }

    function retrieveBidderAlgos(
        address bidder
    ) public view onlyOwner returns (uint256) {
        return biddersList[bidder].totalAlgosPurchased;
    }

    function retrieveRefund(
        address bidder
    ) public view onlyOwner returns (uint256) {
        return biddersList[bidder].refundEth;
    }
}
