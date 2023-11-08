#!/bin/bash

yarn hardhat node&
yarn hardhat run scripts/calculate.js  --network localhost&

wait 

echo “Dutch Auction completed"