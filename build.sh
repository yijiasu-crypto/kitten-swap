#!/bin/bash
# exit when any command fails
set -e

cd chain
yarn install
yarn build
cd ..
cd frontend
yarn gen-sc-types
yarn build