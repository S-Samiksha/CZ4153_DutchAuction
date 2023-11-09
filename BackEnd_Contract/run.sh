#!/bin/bash

yarn hardhat node&
yarn hardhat run scripts/calculate.js
wait

echo "Dutch Auction Ended!"