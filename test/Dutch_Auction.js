/**
 * For test the solidity contract created
 */

const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config");
const {
  time,
  helpers,
} = require("../node_modules/@nomicfoundation/hardhat-network-helpers");

/**
 * Test cases to add:
 * How to enforce successful bidder to pay Ether for the new token,
 * (I.e., they can’t cancel the bid) and how to refund bids that are invalid?
 *
 * Testing if the appropriate number of tokens are created
 *
 * Testing if the correct number of tokens are sent to the bidders
 *
 * Testing if the rest are burnt correctly
 *
 * Resistant to Re-Entry Attack
 *
 * Making testing more dynamic and less hard coded
 */

/**
 * Skips the testing if it is on a testnet, only tests on localhost
 * */
!developmentChains.includes(network.name)
  ? describe.skip
  : /**
     * Testing the ERC20 token build
     * Reference: https://github.com/PatrickAlphaC/hardhat-erc20-fcc/blob/main/test/unit/ourToken-unit.test.js
     * TODO: change the variables accordingly
     */

    describe("OurToken Unit Test", function () {
      //you need to change it to 18 decimal places because of the ERC20 Token standard
      const multiplier = 10 ** 18;
      let ourToken, deployer, user1; //there is a token, a deployer and a user

      /**
       * Deploy the token before each of the test cases
       */
      beforeEach(async function () {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        user1 = accounts.userOne;

        await deployments.fixture("all");
        ourToken = await ethers.getContract("ERC20Token", deployer);
      });

      /**
       * Testing whether the contract was deployed in the first place
       */
      it("was deployed", async () => {
        assert(ourToken.target);
      });

      /**
       * Constructor should be able to set the parameters correctly
       * This includes the initial supply, correct name and the correct symbol
       */
      describe("constructor", () => {
        it("Correct INITIAL_SUPPLY of ERC20 Token has been set", async () => {
          const totalSupply = await ourToken.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("initializes the token with the correct name and symbol ", async () => {
          const name = (await ourToken.name()).toString();
          assert.equal(name, "ERC20Token");

          const symbol = (await ourToken.symbol()).toString();
          assert.equal(symbol, "ET");
        });
      });

      /**
       * The ERC20 standard should be able to transfer the ERC20 token (10 tokens) to user1
       * Then we check he balance of user one and check whether all has been sent
       *
       * There is also a transfer event that must be emitted
       */
      describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
          const tokensToSend = ethers.parseEther("10");
          await ourToken.transfer(user1, tokensToSend);
          expect(await ourToken.balanceOf(user1)).to.equal(tokensToSend);
        });

        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            ourToken.transfer(user1, (10 * multiplier).toString())
          ).to.emit(ourToken, "Transfer");
        });
      });

      /**
       *
       */
      describe("allowances", () => {
        const amount = (20 * multiplier).toString();
        beforeEach(async () => {
          playerToken = await ethers.getContract("ERC20Token", user1);
        });
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.parseEther("5");
          //Deployer is approving that user1 can spend 5 of their precious OT's
          await ourToken.approve(user1, tokensToSpend);
          await playerToken.transferFrom(deployer, user1, tokensToSpend);
          expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend);
        });
        it("doesn't allow an unnaproved member to do transfers", async () => {
          await expect(
            playerToken.transferFrom(deployer, user1, amount)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
        it("emits an approval event, when an approval occurs", async () => {
          await expect(ourToken.approve(user1, amount)).to.emit(
            ourToken,
            "Approval"
          );
        });
        it("the allowance being set is accurate", async () => {
          await ourToken.approve(user1, amount);
          const allowance = await ourToken.allowance(deployer, user1);
          assert.equal(allowance.toString(), amount);
        });
        it("won't allow a user to go over the allowance", async () => {
          await ourToken.approve(user1, amount);
          await expect(
            playerToken.transferFrom(
              deployer,
              user1,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
      });
    });

/**
 * First Decribe function wraps the entire testing
 * @notice creates 4 accounts to be used: one deployer, and three users
 * This is to test different users bidding in the system
 * Accounts are provided by hardhat itself and are configured in hardhat.config.js
 */
// describe("Dutch_Auction", function () {
//   let Dutch_Auction_d;
//   let Dutch_Auction_u_1;
//   let Dutch_Auction_u_2;
//   let Dutch_Auction_u_3;
//   let deployer;
//   let userOne;
//   let userTwo;
//   let userThree;
//   beforeEach(async () => {
//     // const accounts = await ethers.getSigners()
//     // deployer = accounts[0]
//     deployer = (await getNamedAccounts()).deployer;
//     userOne = (await getNamedAccounts()).userOne;
//     userTwo = (await getNamedAccounts()).userTwo;
//     userThree = (await getNamedAccounts()).userThree;
//     await deployments.fixture(["all"]);
//     Dutch_Auction_d = await ethers.getContract("Dutch_Auction", deployer);
//     Dutch_Auction_u_1 = await ethers.getContract("Dutch_Auction", userOne);
//     Dutch_Auction_u_2 = await ethers.getContract("Dutch_Auction", userTwo);
//     Dutch_Auction_u_3 = await ethers.getContract(
//       "Dutch_Auction",
//       userThree
//     );
//   });

//   /**
//    * @title tests whether the constructor is working correctly
//    * @custom tests 4 functionalities
//    * 1. whether the reserve price has been set correctly
//    * 2. whether the current price has been set correctly
//    * 3. whether the number of algos has been set correctly
//    * 4. whether the contract owner has been set correctly. --> this is to prevent the owner from bidding
//    */
//   describe("constructor", function () {
//     it("sets the reservePrice addresses correctly", async () => {
//       const responseRP = await Dutch_Auction_d.retrieveReservePrice();
//       assert.equal(responseRP, 10);
//     });
//     it("sets the currentPrice addresses correctly", async () => {
//       const responseCP = await Dutch_Auction_d.retrievePrice();
//       assert.equal(responseCP, 50);
//     });
//     it("sets the number of Algos correctly", async () => {
//       const responseAlgos = await Dutch_Auction_d.retrieveTotalAlgos();
//       assert.equal(responseAlgos, 200);
//     });
//     it("sets the contract Owner correctly", async () => {
//       const response = await Dutch_Auction_d.retrieveContractOwner();
//       assert.equal(response, deployer);
//     });
//   });

//   /**
//    * @notice this describe function tests the addBidder functions and has a few functionalities to test
//    * Each functionality is described below
//    */

//   describe("addBidder", function () {
//     /**
//      * The user cannot bid if the user send less wei than rquired to buy even one algo
//      */
//     it("Fails if you send a bid value lower than the current Wei Price", async () => {
//       await expect(
//         Dutch_Auction_u_1.addBidder({
//           value: ethers.parseEther("0.00000000000000002"),
//         })
//       ).to.be.revertedWith("bidValue lower than currentPrice");
//     });
//     /**
//      * The user cannot bid if the user sends way too many wei than there is algo
//      */
//     it("Fails if you send too much money and there is not enough algo", async () => {
//       await expect(
//         Dutch_Auction_u_1.addBidder({
//           value: ethers.parseEther("0.00000000000002"),
//         })
//       ).to.be.revertedWith("Not enough algos for you!");
//     });

//     /**
//      *  The owner should not be able to bid
//      */
//     it("Fails if owner tried to bid", async () => {
//       await expect(
//         Dutch_Auction_d.addBidder({
//           value: ethers.parseEther("0.00000000000002"),
//         })
//       ).to.be.revertedWithCustomError(
//         Dutch_Auction_d,
//         `Dutch_Auction__IsOwner`
//       );
//     });

//     /**
//      * User One bids
//      * Test if the remainingAlgos, BidderAlgos and contract balance are all updated correctly
//      */
//     it("Updates the total algos unsold available for one user", async () => {
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       const response = await Dutch_Auction_u_1.retrieveAlgosRemaining();
//       const response2 = await Dutch_Auction_u_1.retrieveBidderAlgos(
//         userOne
//       );
//       const response3 = await Dutch_Auction_d.retrieveContractBalance();
//       assert.equal(response, 180);
//       assert.equal(response2, 20);
//       assert.equal(response3, 1000);
//     });

//     /**
//      * User One and Two bids
//      * Test if the remainingAlgos, BidderAlgos and contract balance are all updated correctly
//      */
//     it("Updates the total algos unsold available for two users", async () => {
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_2.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       const response = await Dutch_Auction_u_2.retrieveAlgosRemaining();
//       const response2 = await Dutch_Auction_u_2.retrieveBidderAlgos(
//         userTwo
//       );
//       const response3 = await Dutch_Auction_d.retrieveContractBalance();
//       assert.equal(response, 160);
//       assert.equal(response2, 20);
//       assert.equal(response3, 2000);
//     });

//     /**
//      * User One and Two bids, Then user one bids again
//      * Test if the remainingAlgos, BidderAlgos, TotalBidders and contract balance are all updated correctly
//      */
//     it("Updates the total algos unsold available for one existing users", async () => {
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_2.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       const response = await Dutch_Auction_u_1.retrieveAlgosRemaining();
//       const response2 = await Dutch_Auction_u_1.retrieveBidderAlgos(
//         userOne
//       );
//       const response3 = await Dutch_Auction_d.retrieveContractBalance();
//       const response4 = await Dutch_Auction_d.retrieveTotalBidder();
//       assert.equal(response, 140);
//       assert.equal(response2, 40);
//       assert.equal(response3, 3000);
//       assert.equal(response4, 2);
//     });

//     /**
//      * price drops by 10 wei after every 0.5 minutes
//      * user one puts in 1000 wei with current price 50 wei => algos = 20
//      * user two puts in 1000 wei with current price 50 wei => algos = 20
//      * user one puts in 1000 wei again with current price 50 wei => algos = 40
//      * user three puts in 1000 wei after 1.5 minutes with current price 20 wei
//      * in the end, user one: bidValue=2000 wei => algos = 100
//      *             user two: bidValue=1000 wei => algos = 50
//      *             user three: bidValue=1000 wei => algos = 50
//      *             remainingalgos = 200-100-50-50=0
//      */
//     it("Updates the total algos, price unsold available for after the price reduces", async () => {
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_2.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await time.increase(90);
//       await Dutch_Auction_u_3.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       const response = await Dutch_Auction_d.retrieveAlgosRemaining();
//       const response2 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
//       const response3 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
//       const response4 = await Dutch_Auction_d.retrieveBidderAlgos(
//         userThree
//       );
//       const response5 = await Dutch_Auction_d.retrievePrice();
//       const response6 = await Dutch_Auction_d.retrieveContractBalance();
//       const response7 = await Dutch_Auction_d.retrieveTotalBidder();
//       assert.equal(response5, 20);
//       assert.equal(response, 0);
//       assert.equal(response2, 100);
//       assert.equal(response3, 50);
//       assert.equal(response4, 50);
//       assert.equal(response6, 4000);
//       assert.equal(response7, 3);
//     });
//     /**
//      * Follow the previous set up
//      * if another user attempts to add bid values, it should revert an error saying there is all Algos are sold
//      */
//     it("Does not allow user to send wei if there are no more algos left", async () => {
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_2.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await time.increase(90);
//       await Dutch_Auction_u_3.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await expect(
//         Dutch_Auction_u_1.addBidder({
//           value: ethers.parseEther("0.000000000000001"),
//         })
//       ).to.be.revertedWith("All Algos Sold! Ending Auction! ");
//     });
//     /**
//      * Follow the previous set up
//      * if another user attempts to add bid values, it should revert an error saying there is all Algos are sold
//      */
//     it("Ends Auction when all algos are sold", async () => {
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_2.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await time.increase(90);
//       await expect(
//         Dutch_Auction_u_3.addBidder({
//           value: ethers.parseEther("0.000000000000004"),
//         })
//       ).to.be.revertedWith("Not enough algos for you!");
//     });
//     /**
//      * Follow the previous set up
//      * if another user attempts to add bid values after it is below reserve price,
//      * it should revert an error saying current price is lower than reserver price and stop the auction
//      */
//     it("Ends Auction if reserve Price is hit", async () => {
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_2.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await Dutch_Auction_u_1.addBidder({
//         value: ethers.parseEther("0.000000000000001"),
//       });
//       await time.increase(150);
//       const response = await Dutch_Auction_d.retrievePrice();

//       await expect(
//         Dutch_Auction_u_3.addBidder({
//           value: ethers.parseEther("0.000000000000001"),
//         })
//       ).to.be.revertedWith(
//         "Lower or equal to reserve price! Ending Auction!"
//       );
//       assert(response, 10);
//     });
//   });
// });
