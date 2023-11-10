const networkConfig = {
  31337: {
    name: "localhost",
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

const INITIAL_SUPPLY_INT = 200;
const INITIAL_SUPPLY = (INITIAL_SUPPLY_INT * 10 ** 18).toString();
const RESERVE_PRICE = 10;
const START_PRICE = 50;
const INTERVAL = 30;
const CHANGEPERMIN = 15;

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY,
  INITIAL_SUPPLY_INT,
  RESERVE_PRICE,
  START_PRICE,
  INTERVAL,
  CHANGEPERMIN,
};
