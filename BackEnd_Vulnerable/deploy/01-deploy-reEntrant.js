// how to deploy the fund me contract
require("dotenv").config();
//import
const {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY_INT,
  INITIAL_SUPPLY,
  RESERVE_PRICE,
  START_PRICE,
  INTERVAL,
} = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
//main function

module.exports = async ({ getNamedAccounts, deployments }) => {
  //get these variables from hre
  const { deploy, log } = deployments;

  const { userOne } = await getNamedAccounts();
  const Dutch_Auction = await ethers.getContract("Dutch_Auction", userOne);
  const chainId = network.config.chainId;
  log("----------------------------------------------------");
  log("Deploying ReEntrant and waiting for confirmations...");

  const ReEntrancyAttack = await deploy("ReEntrancyAttack", {
    from: userOne,
    //Arguments: reservePrice, currentPrice, NumberofAlgos
    value: ethers.parseEther("0.001"),
    args: [Dutch_Auction.target],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(`ReEntrant Contract deployed at ${ReEntrancyAttack.address}`);
  log("Verifying...");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(Dutch_Auction.address, [
      RESERVE_PRICE,
      START_PRICE,
      INITIAL_SUPPLY_INT,
    ]);
  }

  // if (
  //   !developmentChains.includes(network.name) &&
  //   process.env.ETHERSCAN_API_KEY
  // ) {
  //   await verify(Dutch_Auction.address, [10, 50, 200]);
  // }
};

module.exports.tags = ["all", "DA"];
