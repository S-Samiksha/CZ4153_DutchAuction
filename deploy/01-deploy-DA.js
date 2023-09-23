// how to deploy the fund me contract

//import
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
//main function

module.exports = async ({ getNamedAccounts, deployments }) => {
  //get these variables from hre
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  log("----------------------------------------------------");
  log("Deploying Dutch_Auction and waiting for confirmations...");

  //Arguments: reservePrice, currentPrice, NumberofAlgos, interval, tokens
  const arguments = [
    10, 50, 200, networkConfig[chainId]["keepersUpdateInterval"], 0x0
  ]
  
  const Dutch_Auction = await deploy("Dutch_Auction", {
    from: deployer,
    args: arguments,
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Dutch Auction Contract deployed at ${Dutch_Auction.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(Dutch_Auction.address, [10, 50, 200]);
  }
};

module.exports.tags = ["all", "DA"];
