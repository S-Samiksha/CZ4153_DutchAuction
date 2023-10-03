// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./ERC20Token.sol";

error Dutch_Auction__NotOwner();
error Dutch_Auction__IsOwner();
error Dutch_Auction__NotOpen();
error Dutch_Auction__UpKeepNotNeeded(uint256 auctionState);

contract Dutch_Auction is AutomationCompatibleInterface {

    // Variable to indicate auction's state --> type declaration
    enum AuctionState{
        OPEN,
        CLOSING
    } // uint256 0: OPEN, 1: CLOSED

    // ERC20 token
    ERC20Token public token;

    uint256 private currentPrice; //in wei
    uint256 private currentUnsoldAlgos;
    uint256 private totalNumBidders = 0;
    uint256 private startPrice; //in wei

    /* Set in constructor, cannot be changed afterwards, only retrived */
    uint256 private immutable reservePrice;
    address private immutable i_owner;
    uint256 private immutable totalAlgosAvailable;
    uint256 private deployDate; //whats this??

    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    AuctionState private s_auctionState;

    struct Bidder {
        uint256 bidderID;
        address walletAddress;
        uint256 bidValue; //the value they paid to the contract to purchase the algo
        uint256 totalAlgosPurchased; //this will change everytime somebody else bids
        bool isExist;
    }

    /*mappings and arrays*/
    address[] biddersAddress;
    mapping(address => Bidder) public biddersList; //to be made private later <for debugging purposes>

    /*Constructor*/
    constructor(
        uint256 _reservePrice,
        uint256 _startPrice,
        uint256 _totalAlgosAvailable,
        uint256 interval,
        address _token
    ) {
        require(
            _reservePrice < _startPrice,
            "reserve price is higher than current price"
        );
        i_owner = msg.sender;
        reservePrice = _reservePrice;
        totalAlgosAvailable = _totalAlgosAvailable;
        currentUnsoldAlgos = _totalAlgosAvailable;
        currentPrice = _startPrice;
        startPrice = _startPrice;
        deployDate = block.timestamp;
        s_auctionState = AuctionState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
        token = ERC20Token(_token);
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

<<<<<<< Updated upstream
    /* public functions */
=======
    /**
     *
     * @dev This is the function that ChainLink Keeper nodes call
     * They look for the `upkeepneeded` to return true
     * The following should be true in order to return true
     * 1. Time interval should have passed (20minutes)
     * 2. Subscription is funded with LINK
     * 3. Auction should be in "open" state
     *
     *
     * @notice Sam Notes:
     * Here is the variable equivalents :
     * s_lastTimeStamp ====> startTime
     * After the 20minutes is up, simply endAuction();
     * It will do the burn and send the tokens as well
     */

    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = AuctionState.OPEN == s_auctionState;
        // need to check (block.timestamp - last block timestamp) > interval
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
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

    // Function to set state to open (for testing purposes)
    function setStateToOpen() external onlyOwner{
        s_auctionState = AuctionState.OPEN;
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
>>>>>>> Stashed changes

    //Reference: https://docs.soliditylang.org/en/latest/types.html#structs
    function addBidder() public payable notOwner {
        // should i include this??? to check that we can only have bidders if auction is open
        if (s_auctionState != AuctionState.OPEN){
            revert Dutch_Auction__NotOpen();
        }

        //call updatePrice function
        updateCurrentPrice();
        //checking all the requirements
        // require(_bidValue == msg.value, "bidValue stated is not what was sent");
        uint256 _bidValue = msg.value; // alternative way
        require(
            reservePrice < currentPrice,
            "Lower or equal to reserve price! Ending Auction!"
        );
        require(currentUnsoldAlgos > 0, "All Algos Sold! Ending Auction! ");
        require(_bidValue >= currentPrice, "bidValue lower than currentPrice"); //bidValue has to be higher inorder to purchase
        require(
            _bidValue / currentPrice <= currentUnsoldAlgos,
            "Not enough algos for you!"
        );

        // Adding or Updating the bidders currently in the contract
        if (!biddersList[msg.sender].isExist) {
            Bidder storage newBidder = biddersList[msg.sender]; //get the object
            //set the variables
            newBidder.bidderID = ++totalNumBidders;
            newBidder.walletAddress = msg.sender;
            newBidder.bidValue = _bidValue;
            newBidder.totalAlgosPurchased = _bidValue / currentPrice; //need to check the math
            newBidder.isExist = true;
            biddersAddress.push(msg.sender);
        } else {
            Bidder storage existingBidder = biddersList[msg.sender]; //get the object
            existingBidder.bidValue += _bidValue;
            existingBidder.totalAlgosPurchased += _bidValue / currentPrice;
        }

        //Updating private variables in the contract
        currentUnsoldAlgos -= _bidValue / currentPrice;

        updateAllBiders();
    }

    /*Internal Functions */
    //TODO: make this internal later
    function updateCurrentPrice() public {
        //there is 60 seconds in one minute
        // 20 minutes auction
        // price drops by 10 wei every 2 minutes --> actual
        // price drops by 10 wei every 0.5 minutes --> testing purposes
        currentPrice =
            startPrice -
            (uint256((block.timestamp - deployDate)) / 30) *
            10;
    }

    //TODO: can we use IPFS to save gas and make this better?
    function updateAllBiders() internal {
        //obtain current price again in case time elapsed
        updateCurrentPrice();
        currentUnsoldAlgos = totalAlgosAvailable;
        for (uint i = 0; i < biddersAddress.length; i++) {
            biddersList[biddersAddress[i]].totalAlgosPurchased =
                biddersList[biddersAddress[i]].bidValue /
                currentPrice;
            currentUnsoldAlgos -=
                biddersList[biddersAddress[i]].bidValue /
                currentPrice;
        }
    }

/**
 * 
 * @dev This is the function that ChainLink Keeper nodes call
 * They look for the `upkeepneeded` to return true
 * The following should be true in order to return true
 * 1. Time interval should have passed (20minutes)
 * 2. Subscription is funded with LINK
 * 3. Auction should be in "open" state
 */

    function checkUpkeep(bytes memory /*checkData*/) public override returns (bool upkeepNeeded, bytes memory /* performData */){
        bool isOpen = AuctionState.OPEN == s_auctionState;
        // need to check (block.timestamp - last block timestamp) > interval
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
        // if this is true, end auction and burn tokens
        upkeepNeeded = (isOpen && timePassed); // if true, end auction
        }

     function performUpkeep(bytes calldata /* performData */) external override {
        // want some validation such that only gets called when checkupkeep is true
        (bool upkeepNeeded, ) = checkUpkeep("");
        // if ((block.timestamp - lastTimeStamp) > interval) {
        //     lastTimeStamp = block.timestamp;
        // }
        if(!upkeepNeeded){
            revert Dutch_Auction__UpKeepNotNeeded(
                uint256(s_auctionState)
            );
        }
        s_auctionState = AuctionState.CLOSING;
        // only owner can end auction 

        if (upkeepNeeded){
            // if never sell finish, burn all remaining algos
            token.burn(currentUnsoldAlgos);
        }

        // implement transferring tokens to it's respective owners
     }
    /*
    triggered when either algos runs out or time runs out 
    */
   // end auction when times up and burn tokens
    // function endAuction() external onlyOwner {
    //     // so that people cannot enter here to enter the auction
    //     require(block.timestamp >= )

    //     s_auctionState = AuctionState.OPEN;
    // }

    // function burnRemainingTokens(
    //     uint256 currentUnsoldAlgos
    // ) internal onlyOwner {
    //     // to burn the remaining tokens that were left unsold after auction closes

    //     // to open auction when all remaining tokens are burned
    //     s_auctionState = AuctionState.OPEN;
    // }

    /* View/pure Functions */

    function retrievePrice() public view returns (uint256) {
        return currentPrice;
    }

    function retrieveAlgosRemaining() public view returns (uint256) {
        return currentUnsoldAlgos;
    }

    function retrieveTotalAlgos() public view returns (uint256) {
        return totalAlgosAvailable;
    }

    function retrieveReservePrice() public view returns (uint256) {
        return reservePrice;
    }

    function retrieveTotalBidder() public view returns (uint256) {
        return totalNumBidders;
    }

    function retrieveContractOwner() public view returns (address) {
        return i_owner;
    }

    function retrieveContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function retrieveBidderAlgos(address bidder) public view returns (uint256) {
        return biddersList[bidder].totalAlgosPurchased;
    }
<<<<<<< Updated upstream
=======

    function retrieveBidderBidValue(
        address bidder
    ) public view returns (uint256) {
        return biddersList[bidder].bidValue;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getAuctionState() public view returns (AuctionState) {
        return s_auctionState;
    }
>>>>>>> Stashed changes
}
