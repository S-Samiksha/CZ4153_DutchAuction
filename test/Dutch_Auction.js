const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const {
  time,
  helpers,
} = require("../node_modules/@nomicfoundation/hardhat-network-helpers");

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
        await deployments.fixture(["all"]);
        Dutch_Auction_d = await ethers.getContract("Dutch_Auction", deployer);
        Dutch_Auction_u_1 = await ethers.getContract("Dutch_Auction", userOne);
        Dutch_Auction_u_2 = await ethers.getContract("Dutch_Auction", userTwo);
        Dutch_Auction_u_3 = await ethers.getContract(
          "Dutch_Auction",
          userThree
        );
      });

      describe("constructor", function () {
        it("sets the reservePrice addresses correctly", async () => {
          const responseRP = await Dutch_Auction_d.retrieveReservePrice();
          assert.equal(responseRP, 10);
        });
        it("sets the currentPrice addresses correctly", async () => {
          const responseCP = await Dutch_Auction_d.retrievePrice();
          assert.equal(responseCP, 50);
        });
        it("sets the number of Algos addresses correctly", async () => {
          const responseAlgos = await Dutch_Auction_d.retrieveTotalAlgos();
          assert.equal(responseAlgos, 200);
        });
      });

      describe("addBidder", function () {
        it("Fails if you send a bid value larger than the current Wei Price", async () => {
          await expect(
            Dutch_Auction_u_1.addBidder({
              value: ethers.parseEther("0.00000000000000002"),
            })
          ).to.be.revertedWith("bidValue lower than currentPrice");
        });

        it("Fails if you send too much money and there is not enough algo", async () => {
          await expect(
            Dutch_Auction_u_1.addBidder({
              value: ethers.parseEther("0.00000000000002"),
            })
          ).to.be.revertedWith("Not enough algos for you!");
        });

        //updates within the time limit
        it("Updates the total algos unsold available for one user", async () => {
          await Dutch_Auction_u_1.addBidder({
            value: ethers.parseEther("0.000000000000001"),
          });
          const response = await Dutch_Auction_u_1.retrieveAlgosRemaining();
          const response2 = await Dutch_Auction_u_1.retrieveBidderAlgos(
            userOne
          );
          assert.equal(response, 180);
          assert.equal(response2, 20);
        });

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
          assert.equal(response, 160);
          assert.equal(response2, 20);
        });

        //if user one wants to add more bids, it updates accordingly
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
          assert.equal(response, 140);
          assert.equal(response2, 40);
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
          assert.equal(response5, 20);
          assert.equal(response, 0);
          assert.equal(response2, 100);
          assert.equal(response3, 50);
          assert.equal(response4, 50);
        });
        /**
         * Follow the previous set up
         * if another user attempts to add bid values, it should revert an error saying there is not enough
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
          ).to.be.revertedWith("Not enough algos for you!");
        });
      });
    });
