// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

// Using our own ERC20Token
import "./ERC20Token.sol";

error Dutch_Auction__NotOwner();
error Dutch_Auction__IsOwner();
error Dutch_Auction__NotOpen();
error Dutch_Auction__Open();

contract Dutch_Auction {
    int256 private currentPrice; //in wei
    uint256 private totalNumBidders = 0;
    uint256 private immutable startPrice; //in wei
    uint256 private immutable reservePrice;
    address private immutable i_owner;
    uint256 private totalAlgosAvailable;
    uint256 private startTime;
    uint256 private constant AUCTION_TIME = 1200; //in seconds
    uint256 private currentUnsoldAlgos;
    uint256 private changePerMin;

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

    /***
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     * -------------------------------------------------------------------------------------
     */

    /** Events
     *
     */
    event startAuctionEvent(
        uint256 startTime,
        address ERC20Address,
        uint256 totalAlgosAvailable,
        uint256 changePerMin
    );
    event addBidderEvent(
        uint256 bidderID,
        address walletAddress,
        uint256 bidvalue
    );
    event updateCurrentPriceEvent(uint256 timeElapsed, uint256 currentprice);
    event sendTokenEvent(address bidderAddress, uint256 tokensSent);
    event calculateEvent(
        address bidderAddress,
        uint256 TokensPurchased,
        uint256 refundValue
    );

    event RefundEvent(
        address bidderAddress,
        uint256 TokensPurchased,
        uint256 refundValue
    );

    event endAuctionEvent(
        uint256 totalBidders,
        uint256 burntERC20,
        uint totalETHEarned
    );

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

    /**
     * public functions
     *
     * */

    function addBidder() public payable notOwner AuctionOpen {
        //checking all the requirements
        calculate();
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

    function updateCurrentPrice() public {
        currentPrice =
            int256(startPrice) -
            int256((block.timestamp - startTime) / 60) *
            int256(changePerMin);

        if (currentPrice <= 0 || currentPrice <= int256(reservePrice)) {
            currentPrice = int256(reservePrice);
        }
        emit updateCurrentPriceEvent(
            (block.timestamp - startTime),
            uint256(currentPrice)
        );
    }

    function sendTokens() public onlyOwner AuctionClosed {
        for (uint i = 0; i < biddersAddress.length; i++) {
            if (biddersList[biddersAddress[i]].totalAlgosPurchased > 0) {
                DAToken.approve(
                    biddersAddress[i],
                    biddersList[biddersAddress[i]].totalAlgosPurchased *
                        10 ** 18
                );
                DAToken.transferFrom(
                    address(this),
                    biddersAddress[i],
                    biddersList[biddersAddress[i]].totalAlgosPurchased *
                        10 ** 18
                );
                emit sendTokenEvent(
                    biddersAddress[i],
                    biddersList[biddersAddress[i]].totalAlgosPurchased
                );
            }
        }
    }

    function refundETH() public onlyOwner AuctionClosed {
        for (uint i = 0; i < biddersAddress.length; i++) {
            if (biddersList[biddersAddress[i]].refundEth > 0) {
                //refundETH
                (bool callSuccess, ) = payable(
                    biddersList[biddersAddress[i]].walletAddress
                ).call{value: biddersList[biddersAddress[i]].refundEth}("");
                require(callSuccess, "Failed to send ether");
                emit RefundEvent(
                    biddersAddress[i],
                    biddersList[biddersAddress[i]].totalAlgosPurchased,
                    biddersList[biddersAddress[i]].refundEth
                );
            }
        }
    }

    function calculate() public {
        updateCurrentPrice();
        uint256 currentAlgos = totalAlgosAvailable;
        for (uint i = 0; i < biddersAddress.length; i++) {
            if (
                currentAlgos >=
                biddersList[biddersAddress[i]].bidValue / uint256(currentPrice)
            ) {
                biddersList[biddersAddress[i]].totalAlgosPurchased =
                    biddersList[biddersAddress[i]].bidValue /
                    uint256(currentPrice);
                currentAlgos -=
                    biddersList[biddersAddress[i]].bidValue /
                    uint256(currentPrice);
                biddersList[biddersAddress[i]].refundEth = 0;
            } else if (
                currentAlgos > 0 &&
                currentAlgos <
                biddersList[biddersAddress[i]].bidValue / uint256(currentPrice)
            ) {
                biddersList[biddersAddress[i]]
                    .totalAlgosPurchased = currentAlgos;
                currentAlgos = 0;
                biddersList[biddersAddress[i]].refundEth =
                    biddersList[biddersAddress[i]].bidValue -
                    biddersList[biddersAddress[i]].totalAlgosPurchased *
                    uint256(currentPrice);
            } else if (
                currentAlgos <= 0 &&
                biddersList[biddersAddress[i]].totalAlgosPurchased == 0
            ) {
                //refund for the rest
                biddersList[biddersAddress[i]].totalAlgosPurchased = 0;
                biddersList[biddersAddress[i]].refundEth = biddersList[
                    biddersAddress[i]
                ].bidValue;
            }
            emit RefundEvent(
                biddersAddress[i],
                biddersList[biddersAddress[i]].totalAlgosPurchased,
                biddersList[biddersAddress[i]].refundEth
            );
        }

        if (currentAlgos > 0) {
            currentUnsoldAlgos = currentAlgos;
        } else {
            s_auctionState = AuctionState.CLOSING;
            currentUnsoldAlgos = 0;
        }
    }

    function endAuction() public onlyOwner {
        s_auctionState = AuctionState.CLOSING;
        calculate();
        sendTokens();
        refundETH();
        if (currentUnsoldAlgos > 0) {
            DAToken.burn(address(this), currentUnsoldAlgos);
        }
        emit endAuctionEvent(
            totalNumBidders,
            currentUnsoldAlgos,
            address(this).balance
        );
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

    function balanceOfBidder(address bidder) public view returns (uint256) {
        return DAToken.balanceOf(bidder);
    }

    fallback() external payable {
        addBidder();
    }

    receive() external payable {
        addBidder();
    }

    function getAuctionState() public view returns (AuctionState) {
        return s_auctionState;
    }
}
