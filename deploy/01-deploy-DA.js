// how to deploy the fund me contract

//import
const {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY_INT,
  INITIAL_SUPPLY,
  RESERVE_PRICE,
  START_PRICE,
} = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
//main function

module.exports = async ({ getNamedAccounts, deployments }) => {
  //get these variables from hre
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();
  const ERC20Token = await ethers.getContract("ERC20Token", deployer);
  const chainId = network.config.chainId;
  log("----------------------------------------------------");
  log("Deploying Dutch_Auction and waiting for confirmations...");

  const Dutch_Auction = await deploy("Dutch_Auction", {
    from: deployer,
    //Arguments: reservePrice, currentPrice, NumberofAlgos
    args: [RESERVE_PRICE, START_PRICE, INITIAL_SUPPLY_INT, ERC20Token.target],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Dutch Auction Contract deployed at ${Dutch_Auction.address}`);

  // if (
  //   !developmentChains.includes(network.name) &&
  //   process.env.ETHERSCAN_API_KEY
  // ) {
  //   await verify(Dutch_Auction.address, [10, 50, 200]);
  // }
};

module.exports.tags = ["all", "DA"];
