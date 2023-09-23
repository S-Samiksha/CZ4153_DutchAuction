// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

contract Dutch_Auction {
    uint256 private currentPrice; //in wei
    uint256 private currentUnsoldAlgos;
    uint256 private totalNumBidders = 0;
    uint256 private startPrice;

    /* Set in constructor, cannot be changed afterwards, only retrived */
    uint256 private immutable reservePrice;
    address private immutable i_owner;
    uint256 private immutable totalAlgosAvailable;
    uint256 private deployDate;

    struct Bidder {
        uint256 bidderID;
        address walletAddress;
        uint256 bidValue; //the value they paid to the contract to purchase the algo
        uint256 totalAlgosPurchased; //this will change everytime somebody else bids
        bool isExist;
    }

    /*mappings */
    address[] biddersAddress;
    mapping(address => Bidder) public biddersList; //to be made private later <for debugging purposes>

    /*Constructor*/
    constructor(
        uint256 _reservePrice,
        uint256 _startPrice,
        uint256 _totalAlgosAvailable
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
    }

    /* public functions */

    //Reference: https://docs.soliditylang.org/en/latest/types.html#structs
    //TODO: needs to be changed to a payable function
    function addBidder(uint256 _bidValue) public {
        //call updatePrice function
        updateCurrentPrice();

        //checking all the requirements
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

        //updating all bidders except current bidder
        updateAllBiders(msg.sender);
    }

    /*Internal Functions */
    function updateCurrentPrice() public {
        //there is 60 seconds in one minute
        // 20 minutes auction
        // price drops by 10 wei every 2 minutes --> actual
        // price drops by 10 wei every 1 minutes --> testing purposes
        currentPrice =
            startPrice -
            (uint256((block.timestamp - deployDate)) / 60) *
            10;
    }

    //TODO: can we use IPFS to save gas and make this better?
    //TODO: updateAllBidders not working
    function updateAllBiders(address currentBidder) internal {
        //obtain current price again in case time elapsed
        updateCurrentPrice();
        for (uint i = 0; i < biddersAddress.length; i++) {
            if (biddersList[msg.sender].walletAddress == currentBidder) {
                continue;
            } else {
                biddersList[msg.sender].totalAlgosPurchased +=
                    biddersList[msg.sender].bidValue /
                    currentPrice;
            }
        }
    }

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
}
