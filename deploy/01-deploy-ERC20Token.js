const { network } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY_INT,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const DA_Auction = await ethers.getContract("Dutch_Auction", deployer);
  log("deploying ERC20......................");
  const ourToken = await deploy("ERC20Token", {
    from: deployer,
    args: [INITIAL_SUPPLY_INT, DA_Auction.target],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`ourToken deployed at ${ourToken.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(ourToken.address, [INITIAL_SUPPLY_INT, DA_Auction.target]);
  }
};

module.exports.tags = ["all", "token"];
