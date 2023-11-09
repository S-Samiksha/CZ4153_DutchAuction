#!/bin/bash

yarn hardhat run node&
yarn hardhat run scripts/calculate.js  --network localhost&

wait 

echo “Dutch Auction completed"