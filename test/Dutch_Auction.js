/**
 * For test the solidity contract created
 */

const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
<<<<<<< Updated upstream
const { developmentChains } = require("../helper-hardhat-config");
=======
const {
  developmentChains,
  INITIAL_SUPPLY,
  INITIAL_SUPPLY_INT,
  RESERVE_PRICE,
  START_PRICE,
  INTERVAL
} = require("../helper-hardhat-config");
>>>>>>> Stashed changes
const {
  time,
  helpers,
} = require("../node_modules/@nomicfoundation/hardhat-network-helpers");

/**
 * Skips the testing if it is on a testnet, only tests on localhost
 * */
!developmentChains.includes(network.name)
  ? describe.skip
  : /**
     * First Decribe function wraps the entire testing
     * @notice creates 4 accounts to be used: one deployer, and three users
     * This is to test different users bidding in the system
     * Accounts are provided by hardhat itself and are configured in hardhat.config.js
     */
    describe("Dutch_Auction", function () {
      let Dutch_Auction_d;
      let Dutch_Auction_u_1;
      let Dutch_Auction_u_2;
      let Dutch_Auction_u_3;
      let deployer;
      let userOne;
      let userTwo;
      let userThree;
      beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer;
        userOne = (await getNamedAccounts()).userOne;
        userTwo = (await getNamedAccounts()).userTwo;
        userThree = (await getNamedAccounts()).userThree;
        await deployments.fixture(["all"]);
        Dutch_Auction_d = await ethers.getContract("Dutch_Auction", deployer);
        Dutch_Auction_u_1 = await ethers.getContract("Dutch_Auction", userOne);
        Dutch_Auction_u_2 = await ethers.getContract("Dutch_Auction", userTwo);
        Dutch_Auction_u_3 = await ethers.getContract(
          "Dutch_Auction",
          userThree
        );
<<<<<<< Updated upstream
=======
        interval = await Dutch_Auction_d.getInterval();
        const transactionResponse = await ERC20Token.approve(
          Dutch_Auction_d.target,
          INITIAL_SUPPLY
        );
        await transactionResponse.wait();
>>>>>>> Stashed changes
      });

      /**
       * @title tests whether the constructor is working correctly
       * @custom tests 4 functionalities
       * 1. whether the reserve price has been set correctly
       * 2. whether the current price has been set correctly
       * 3. whether the number of algos has been set correctly
       * 4. whether the contract owner has been set correctly. --> this is to prevent the owner from bidding
       */
      describe("constructor", function () {
        it("sets the reservePrice addresses correctly", async () => {
          const responseRP = await Dutch_Auction_d.retrieveReservePrice();
          assert.equal(responseRP, 10);
        });
        it("sets the currentPrice addresses correctly", async () => {
          const responseCP = await Dutch_Auction_d.retrievePrice();
          assert.equal(responseCP, 50);
        });
        it("sets the number of Algos correctly", async () => {
          const responseAlgos = await Dutch_Auction_d.retrieveTotalAlgos();
          assert.equal(responseAlgos, 200);
        });
        it("sets the contract Owner correctly", async () => {
          const response = await Dutch_Auction_d.retrieveContractOwner();
          assert.equal(response, deployer);
        });
        it("initialises auction state correctly", async()=>{
          const auctionState = (await Dutch_Auction_d.getAuctionState()).toString()
          assert.equal(auctionState.toString(), "0")
          assert.equal(
            interval.toString(),
            INTERVAL,
        )
        })
      });

      /**
       * @notice this describe function tests the addBidder functions and has a few functionalities to test
       * Each functionality is described below
       */

      describe("addBidder", function () {
        /**
         * The user cannot bid if the user send less wei than rquired to buy even one algo
         */
        it("Fails if you send a bid value lower than the current Wei Price", async () => {
          await expect(
            Dutch_Auction_u_1.addBidder({
              value: ethers.parseEther("0.00000000000000002"),
            })
          ).to.be.revertedWith("bidValue lower than currentPrice");
        });
        /**
         * The user cannot bid if the user sends way too many wei than there is algo
         */
        it("Fails if you send too much money and there is not enough algo", async () => {
          await expect(
            Dutch_Auction_u_1.addBidder({
              value: ethers.parseEther("0.00000000000002"),
            })
          ).to.be.revertedWith("Not enough algos for you!");
        });

        /**
         *  The owner should not be able to bid
         */
        it("Fails if owner tried to bid", async () => {
          await expect(
            Dutch_Auction_d.addBidder({
              value: ethers.parseEther("0.00000000000002"),
            })
          ).to.be.revertedWithCustomError(
            Dutch_Auction_d,
            `Dutch_Auction__IsOwner`
          );
        });

        /**
         * User One bids
         * Test if the remainingAlgos, BidderAlgos and contract balance are all updated correctly
         */
        it("Updates the total algos unsold available for one user", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const response = await Dutch_Auction_u_1.retrieveAlgosRemaining();
          const response2 = await Dutch_Auction_u_1.retrieveBidderAlgos(
            userOne
          );
          const response3 = await Dutch_Auction_d.retrieveContractBalance();
          assert.equal(response, 180);
          assert.equal(response2, 20);
          assert.equal(response3, 1000);
        });

        /**
         * User One and Two bids
         * Test if the remainingAlgos, BidderAlgos and contract balance are all updated correctly
         */
        it("Updates the total algos unsold available for two users", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const response = await Dutch_Auction_u_2.retrieveAlgosRemaining();
          const response2 = await Dutch_Auction_u_2.retrieveBidderAlgos(
            userTwo
          );
          const response3 = await Dutch_Auction_d.retrieveContractBalance();
          assert.equal(response, 160);
          assert.equal(response2, 20);
          assert.equal(response3, 2000);
        });

        /**
         * User One and Two bids, Then user one bids again
         * Test if the remainingAlgos, BidderAlgos, TotalBidders and contract balance are all updated correctly
         */
        it("Updates the total algos unsold available for one existing users", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const response = await Dutch_Auction_u_1.retrieveAlgosRemaining();
          const response2 = await Dutch_Auction_u_1.retrieveBidderAlgos(
            userOne
          );
          const response3 = await Dutch_Auction_d.retrieveContractBalance();
          const response4 = await Dutch_Auction_d.retrieveTotalBidder();
          assert.equal(response, 140);
          assert.equal(response2, 40);
          assert.equal(response3, 3000);
          assert.equal(response4, 2);
        });

        /**
         * price drops by 10 wei after every 0.5 minutes
         * user one puts in 1000 wei with current price 50 wei => algos = 20
         * user two puts in 1000 wei with current price 50 wei => algos = 20
         * user one puts in 1000 wei again with current price 50 wei => algos = 40
         * user three puts in 1000 wei after 1.5 minutes with current price 20 wei
         * in the end, user one: bidValue=2000 wei => algos = 100
         *             user two: bidValue=1000 wei => algos = 50
         *             user three: bidValue=1000 wei => algos = 50
         *             remainingalgos = 200-100-50-50=0
         */
        it("Updates the total algos, price unsold available for after the price reduces", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await time.increase(90);
          await Dutch_Auction_u_3.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const response = await Dutch_Auction_d.retrieveAlgosRemaining();
          const response2 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
          const response3 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
          const response4 = await Dutch_Auction_d.retrieveBidderAlgos(
            userThree
          );
          const response5 = await Dutch_Auction_d.retrievePrice();
          const response6 = await Dutch_Auction_d.retrieveContractBalance();
          const response7 = await Dutch_Auction_d.retrieveTotalBidder();
          assert.equal(response5, 20);
          assert.equal(response, 0);
          assert.equal(response2, 100);
          assert.equal(response3, 50);
          assert.equal(response4, 50);
          assert.equal(response6, 4000);
          assert.equal(response7, 3);
        });
        /**
         * Follow the previous set up
         * if another user attempts to add bid values, it should revert an error saying there is all Algos are sold
         */
        it("Does not allow user to send wei if there are no more algos left", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await time.increase(90);
          await Dutch_Auction_u_3.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await expect(
            Dutch_Auction_u_1.addBidder({
              value: ethers.parseEther("0.000000000000001"),
            })
          ).to.be.revertedWith("All Algos Sold! Ending Auction! ");
        });
        /**
         * Follow the previous set up
         * if another user attempts to add bid values, it should revert an error saying there is all Algos are sold
         */
        it("Ends Auction when all algos are sold", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await time.increase(90);
          await expect(
            Dutch_Auction_u_3.addBidder({
              value: ethers.parseEther("0.000000000000004"),
            })
          ).to.be.revertedWith("Not enough algos for you!");
        });
        /**
         * Follow the previous set up
         * if another user attempts to add bid values after it is below reserve price,
         * it should revert an error saying current price is lower than reserver price and stop the auction
         */
        it("Ends Auction if reserve Price is hit", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await time.increase(150);
          const response = await Dutch_Auction_d.retrievePrice();

          await expect(
            Dutch_Auction_u_3.addBidder({
              value: ethers.parseEther("0.000000000000001"),
            })
          ).to.be.revertedWith(
            "Lower or equal to reserve price! Ending Auction!"
          );
          assert(response, 10);
        });
<<<<<<< Updated upstream
=======
        /**
         * Checking if the ERC20 tokens are sent properly
         *
         */
        it("Checking if the ERC20 Tokens are sent properly", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_3.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const transactionResponse = await Dutch_Auction_d.sendTokens();
          await transactionResponse.wait();

          const response0 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
          const response1 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
          const tokensToSend = ethers.parseEther(response0.toString());
          const tokensToSend1 = ethers.parseEther(response1.toString());
          expect(await ERC20Token.balanceOf(userOne)).to.equal(tokensToSend);
          expect(await ERC20Token.balanceOf(userTwo)).to.equal(tokensToSend1);
          expect(await ERC20Token.balanceOf(userThree)).to.equal(tokensToSend1);
        });

        // it("Checking if the ERC20 Tokens are sent properly", async () => {
        //   await Dutch_Auction_u_1.addBidder({
        //     value: ethers.parseEther("0.000000000000001"),
        //   });
        //   await Dutch_Auction_u_2.addBidder({
        //     value: ethers.parseEther("0.000000000000001"),
        //   });
        //   await Dutch_Auction_u_1.addBidder({
        //     value: ethers.parseEther("0.000000000000001"),
        //   });
        //   await Dutch_Auction_u_3.addBidder({
        //     value: ethers.parseEther("0.000000000000001"),
        //   });
        //   await time.increase(150);
        //   await Dutch_Auction_u_3.addBidder({
        //     value: ethers.parseEther("0.000000000000001"),
        //   });

        //   const response0 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
        //   const response1 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
        //   const tokensToSend = ethers.parseEther(response0.toString());
        //   const tokensToSend1 = ethers.parseEther(response1.toString());
        //   expect(await ERC20Token.balanceOf(userOne)).to.equal(tokensToSend);
        //   expect(await ERC20Token.balanceOf(userTwo)).to.equal(tokensToSend1);
        //   expect(await ERC20Token.balanceOf(userThree)).to.equal(tokensToSend1);
        // });
      });
      describe("checkUpkeep", function (){
        // to test that auction will not start if status is not opened
        it("returns true if enough time has passed and raffle is open", async ()=>{
          await Dutch_Auction_d.setStateToOpen();
          const intervalNum = Number(interval);
          await network.provider.send("evm_increaseTime", [intervalNum + 1])
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeded } = await Dutch_Auction_d.callStatic.checkUpkeep("0x")
          assert(upkeepNeeded)
        });
      });
      describe("performUpkeep", function (){
        it("can only run if checkupkeep is true", async () => {
          await Dutch_Auction_d.setStateToOpen();
          const intervalNum = Number(interval);
          await network.provider.send("evm_increaseTime", [intervalNum + 1])
          await network.provider.request({ method: "evm_mine", params: [] })
          const tx = await Dutch_Auction_d.performUpkeep("0x")
          assert(tx)
      })
      it("reverts if checkupkeep is false", async () => {
        await expect(Dutch_Auction_d.performUpkeep("0x")).to.be.revertedWith(
            "Dutch_Auction__UpKeepNotNeeded",
        )
    })
        it("updates auction state and ensures endAuction is called", async ()=>{
          await Dutch_Auction_d.setStateToOpen();
          const intervalNum = Number(interval);
          await network.provider.send("evm_increaseTime", [intervalNum + 1])
          await network.provider.request({ method: "evm_mine", params: [] })
          const txResponse = await Dutch_Auction_d.performUpkeep("0x") // emits requestId
          const txReceipt = await txResponse.wait(1) // waits 1 block
          const auctionState = await Dutch_Auction_d.getAuctionState() // updates state
          const requestId = txReceipt.events[1].args.requestId
          assert(requestId.toNumber() > 0)
          assert(auctionState == 1) // 0 = open, 1 = calculating
        });
>>>>>>> Stashed changes
      });
    });
