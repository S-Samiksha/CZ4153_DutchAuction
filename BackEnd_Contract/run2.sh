#!/bin/bash

yarn hardhat run scripts/start.js --network localhost
wait

yarn hardhat run scripts/end.js --network localhost&
yarn hardhat run scripts/calculate.js --network localhost&
wait

echo "Dutch Auction Complete"