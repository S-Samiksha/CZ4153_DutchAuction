// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

// Using our own ERC20Token
import "./ERC20Token.sol";

error Dutch_Auction__NotOwner();
error Dutch_Auction__IsOwner();

contract Dutch_Auction {
    uint256 private currentPrice; //in wei
    uint256 private currentUnsoldAlgos;
    uint256 private totalNumBidders = 0;
    uint256 private startPrice; //in wei

    /* Set in constructor, cannot be changed afterwards, only retrived */
    uint256 private immutable reservePrice;
    address private immutable i_owner;
    uint256 private immutable totalAlgosAvailable;
    uint256 private deployDate;

    uint256 public startTime;
    uint256 public endTime;

    ERC20Token private immutable DAToken; //importing Token

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
        DAToken = ERC20Token(_token);
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

    /* public functions */

    //Reference: https://docs.soliditylang.org/en/latest/types.html#structs
    function addBidder() public payable notOwner {
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

    /*
    triggered when either algos runs out or time runs out 
    */

    function sendTokens() public onlyOwner {
        for (uint i = 0; i < biddersAddress.length; i++) {
            biddersList[biddersAddress[i]].totalAlgosPurchased =
                biddersList[biddersAddress[i]].bidValue /
                currentPrice;
            DAToken.transferFrom(
                i_owner,
                biddersAddress[i],
                biddersList[biddersAddress[i]].totalAlgosPurchased * 10 ** 18
            );
        }
    }

    function contractAddress() public view returns (address) {
        return address(this);
    }

    function retriveDATOKEN() public view returns (uint256) {
        return DAToken.allowance(i_owner, msg.sender);
    }

    function endAuction() internal onlyOwner {}

    // function burnRemainingTokens(
    //     uint256 currentUnsoldAlgos
    // ) internal onlyOwner {
    //     // to burn the remaining tokens that were left unsold after auction closes
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
}
