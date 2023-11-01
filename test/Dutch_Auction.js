/**
 * For test the solidity contract created
 */

const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
  INITIAL_SUPPLY_INT,
  RESERVE_PRICE,
  START_PRICE,
  CHANGEPERMIN,
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

/**
 * First Decribe function wraps the entire testing
 * @notice creates 4 accounts to be used: one deployer, and three users
 * This is to test different users bidding in the system
 * Accounts are provided by hardhat itself and are configured in hardhat.config.js
 */

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Dutch_Auction", function () {
      let Dutch_Auction_d;
      let Dutch_Auction_u_1;
      let Dutch_Auction_u_2;
      let Dutch_Auction_u_3;
      let ERC20Token;
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
        await deployments.fixture("all");
        Dutch_Auction_d = await ethers.getContract("Dutch_Auction", deployer);
        Dutch_Auction_u_1 = await ethers.getContract("Dutch_Auction", userOne);
        Dutch_Auction_u_2 = await ethers.getContract("Dutch_Auction", userTwo);
        Dutch_Auction_u_3 = await ethers.getContract(
          "Dutch_Auction",
          userThree
        );

        const transactionResponse0 = await Dutch_Auction_d.startAuction(
          INITIAL_SUPPLY_INT,
          CHANGEPERMIN
        );
        await transactionResponse0.wait();
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
          assert.equal(responseRP, RESERVE_PRICE);
        });
        it("sets the currentPrice addresses correctly", async () => {
          const responseCP = await Dutch_Auction_d.retrieveCurrentPrice();
          assert.equal(responseCP, START_PRICE);
        });
        it("sets the number of Algos correctly", async () => {
          const responseAlgos = await Dutch_Auction_d.retrieveTotalAlgos();
          assert.equal(responseAlgos, INITIAL_SUPPLY_INT);
        });
        it("sets the contract Owner correctly", async () => {
          const response = await Dutch_Auction_d.retrieveContractOwner();
          assert.equal(response, deployer);
        });
      });

      /**
       * @notice this describe function tests the addBidder functions and has a few functionalities to test
       * Each functionality is described below
       */

      describe("addBidder", function () {
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
        it("Updates the contract balance for one user", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const response = await Dutch_Auction_d.retrieveContractBalance();
          assert.equal(response, 1000);
        });

        /**
         * User One and Two bids
         * Test if the remainingAlgos, BidderAlgos and contract balance are all updated correctly
         */
        it("Updates the current balance for two users", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const response = await Dutch_Auction_d.retrieveContractBalance();
          assert.equal(response, 2000);
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
          const response1 = await Dutch_Auction_d.retrieveContractBalance();
          const response2 = await Dutch_Auction_d.retrieveTotalBidder();
          const response3 = await Dutch_Auction_d.retrieveBidderBidValue(
            userOne
          );
          const response4 = await Dutch_Auction_d.retrieveBidderBidValue(
            userTwo
          );
          assert.equal(response1, 3000);
          assert.equal(response2, 2);
          assert.equal(response3, 2000);
          assert.equal(response4, 1000);
        });

        /**
         * Checking if the ERC20 tokens are sent properly
         *
         */
        it("Checking if the ERC20 Tokens are sent properly part 1", async () => {
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

          const transactionResponse = await Dutch_Auction_d.endAuction();
          await transactionResponse.wait();

          const response0 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
          const response1 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
          const tokensToSend = ethers.parseEther(response0.toString());
          const tokensToSend1 = ethers.parseEther(response1.toString());
          expect(await Dutch_Auction_d.balanceOfBidder(userOne)).to.equal(
            tokensToSend
          );
          expect(await Dutch_Auction_d.balanceOfBidder(userTwo)).to.equal(
            tokensToSend1
          );
          expect(await Dutch_Auction_d.balanceOfBidder(userThree)).to.equal(
            tokensToSend1
          );
          assert.equal(response0, 40);
          assert.equal(response1, 20);
        });

        it("Checking if the ERC20 Tokens are sent properly part 2", async () => {
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
          await time.increase(120);
          await Dutch_Auction_d.updateCurrentPrice();
          const response = await Dutch_Auction_d.retrieveCurrentPrice();
          assert.equal(response, 20);

          const transactionResponse = await Dutch_Auction_d.endAuction();
          await transactionResponse.wait();

          const response0 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
          const response1 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
          const tokensToSend = ethers.parseEther(response0.toString());
          const tokensToSend1 = ethers.parseEther(response1.toString());

          expect(await Dutch_Auction_d.balanceOfBidder(userOne)).to.equal(
            tokensToSend
          );
          expect(await Dutch_Auction_d.balanceOfBidder(userTwo)).to.equal(
            tokensToSend1
          );
          expect(await Dutch_Auction_d.balanceOfBidder(userThree)).to.equal(
            tokensToSend1
          );
          assert.equal(response0, 100);
          assert.equal(response1, 50);
        });

        it("Checking if the ERC20 Tokens are sent properly part 3", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_2.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });

          const userTwoBalanceBegin = await ethers.provider.getBalance(userTwo);
          await time.increase(180);

          await Dutch_Auction_u_3.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const ContractBalance = await ethers.provider.getBalance(
            Dutch_Auction_d.target
          );
          assert.equal(ContractBalance, 4000);

          const transactionResponse = await Dutch_Auction_d.endAuction();
          await transactionResponse.wait();

          const response0 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
          const response1 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
          assert.equal(response0, 200);
          assert.equal(response1, 0);

          const tokensToSend = ethers.parseEther(response0.toString());
          const tokensToSend1 = ethers.parseEther(response1.toString());

          expect(await Dutch_Auction_d.balanceOfBidder(userOne)).to.equal(
            tokensToSend
          );
          expect(await Dutch_Auction_d.balanceOfBidder(userTwo)).to.equal(
            tokensToSend1
          );
          expect(await Dutch_Auction_d.balanceOfBidder(userThree)).to.equal(
            tokensToSend1
          );

          const EndContractBalance = await ethers.provider.getBalance(
            Dutch_Auction_d.target
          );
          assert.equal(EndContractBalance, 2000);

          const response2 = await Dutch_Auction_d.retrieveRefund(userTwo);
          assert.equal(response2, 1000);

          const userTwoBalanceEnd = await ethers.provider.getBalance(userTwo);
          assert.equal(userTwoBalanceEnd - userTwoBalanceBegin, 1000);
        });
      });
    });
