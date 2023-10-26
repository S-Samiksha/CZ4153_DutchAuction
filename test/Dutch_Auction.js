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

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Dutch_Auction", function () {
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
        await deployments.fixture("all");
        ERC20Token = await ethers.getContract("ERC20Token", deployer);
        Dutch_Auction_d = await ethers.getContract("Dutch_Auction", deployer);
        Dutch_Auction_u_1 = await ethers.getContract("Dutch_Auction", userOne);
        Dutch_Auction_u_2 = await ethers.getContract("Dutch_Auction", userTwo);
        Dutch_Auction_u_3 = await ethers.getContract(
          "Dutch_Auction",
          userThree
        );
        const transactionResponse = await ERC20Token.approve(
          Dutch_Auction_d.target,
          INITIAL_SUPPLY
        );
        await transactionResponse.wait();
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
          expect(await ERC20Token.balanceOf(userOne)).to.equal(tokensToSend);
          expect(await ERC20Token.balanceOf(userTwo)).to.equal(tokensToSend1);
          expect(await ERC20Token.balanceOf(userThree)).to.equal(tokensToSend1);
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
          await time.increase(90);

          const transactionResponse = await Dutch_Auction_d.endAuction();
          await transactionResponse.wait();

          const response0 = await Dutch_Auction_d.retrieveBidderAlgos(userOne);
          const response1 = await Dutch_Auction_d.retrieveBidderAlgos(userTwo);
          const tokensToSend = ethers.parseEther(response0.toString());
          const tokensToSend1 = ethers.parseEther(response1.toString());
          expect(await ERC20Token.balanceOf(userOne)).to.equal(tokensToSend);
          expect(await ERC20Token.balanceOf(userTwo)).to.equal(tokensToSend1);
          expect(await ERC20Token.balanceOf(userThree)).to.equal(tokensToSend1);
        });
      });
    });
