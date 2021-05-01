# KittenSwap Smart Contracts

This folder contains all smart contract and deployment script for `KittenSwap`

### Available Scripts

### `yarn build`

This script will build all smart contracts inside `contracts`. This is a necessary step before running all tests or building the frontend


### `yarn test`

This script will run some test cases that're runnable on a localhost development testnet. Some test cases, such as integration tests with Uniswap or Sushiswap, must be performed on a live testnet, use `yarn test:kovan` instead. Before running this script, use `yarn ganache` to create a localhost testnet and keep it running on the background.

### `yarn test:kovan`

This script will run some test cases including on-chain deployments on Kovan testnet. A default wallet mnemonic is configured in `./test/wallet.js`. If you need to change the private key, update this file.

### `yarn gen-sc-types`

This script will generate `.d.ts` type definition files for smart contracts. Run `yarn build` to build contracts first.


### Deployment

A verified deployment of `KittenSwapRouter` is available at [0x96ab64514484FA3257Fe82A42F900cDb79b25B65](https://kovan.etherscan.io/address/0x96ab64514484FA3257Fe82A42F900cDb79b25B65).

If you need to deploy a new instace of these smart contracts manually. Please run the test `2_KittenSwapRouter` by running `yarn test:kovan ./test/2_KittenSwapRouter.test.ts`. Once the test were successfully ran, there should be a file `test_deployment.json` generate on the root folder recording addresses of deployed smart contracts.
