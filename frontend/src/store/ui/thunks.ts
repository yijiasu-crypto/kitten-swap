import { createAsyncThunk } from '@reduxjs/toolkit';
import _ from 'lodash';
import Web3 from 'web3';
import store from '..';
import { IPriceRef, IToken, TokenPair } from '../../models';
import { fromStringNumber } from '../../utils/math';
import {
  queryERC20Balance,
  checkERC20Approval,
  grantERC20Approval,
  performSwapOnRouter,
  queryAdapterAmountOut,
} from '../../web3/blockchain-api';

import { uiSlice } from './slice';

export const fetchERC20Balance = createAsyncThunk(
  'ui/queryERC20Balance',
  async (payload: { web3: Web3; token: IToken; owner: string }) => {
    const { web3, token, owner } = payload;
    const balance = await queryERC20Balance(web3, token.address, { owner });
    return { token, balance };
  }
);

export const queryAmountOut = createAsyncThunk(
  'ui/queryAmountOut',
  async (payload: { web3: Web3; tokenPair: TokenPair; amountIn: string }) => {
    const { web3, tokenPair, amountIn } = payload;
    const { contracts } = store.getState().chainData;
    const adapters = _.filter(contracts, { interface: 'IExchangeAdapter' })!;

    const result: Array<IPriceRef> = [];
    for (const adapter of adapters) {
      const amountOut = await queryAdapterAmountOut(web3, adapter.address, {
        tokenPair,
        amountIn,
      });

      result.push({
        fromAmount: amountIn,
        toAmount: amountOut,
        fromToken: tokenPair[0],
        toToken: tokenPair[1],
        adapter: adapter.name,
      });
    }

    return result;
  }
);

export const performSwap = createAsyncThunk(
  'ui/performSwap',
  async (payload: {
    web3: Web3;
    tokenPair: TokenPair;
    amountIn: string;
    amountOut: string;
    amountOutMin: string;
    adapterName: string;
  }) => {
    const { web3, tokenPair, amountIn, amountOut, amountOutMin, adapterName } = payload;
    const { contracts } = store.getState().chainData;
    const ksrContract = _.find(contracts, { name: 'KittenSwapRouter' })!;
    const ownerAddress = store.getState().ethereum.account;
    const isApproved = await checkERC20Approval(web3, tokenPair[0].address, {
      owner: ownerAddress,
      spender: ksrContract.address,
    });

    if (!isApproved) {
      // need ERC20 Approval
      const approveTxReceipt = await grantERC20Approval(
        web3,
        tokenPair[0].address,
        {
          owner: ownerAddress,
          spender: ksrContract.address,
        }
      );
      console.log(approveTxReceipt);
    }

    // perform actual swap
    const swapTxReceipt = await performSwapOnRouter(web3, ksrContract.address, {
      amountIn,
      amountOutMin,
      tokenPair,
      beneficiaryAddress: ownerAddress,
    });

    const state = store.getState();

    const dispFromAmountAndToken = `${fromStringNumber(amountIn, tokenPair[0].decimals, 4)} ${tokenPair[0].symbol}`;
    const dispToAmountAndToken = `${fromStringNumber(amountOut, tokenPair[1].decimals, 4)} ${tokenPair[1].symbol}`;
    
    store.dispatch(
      uiSlice.actions.enqueueTx({
        txHash: swapTxReceipt.transactionHash,
        network: state.ethereum.networkName,
        description: `Swap ${dispFromAmountAndToken} to ${dispToAmountAndToken} via ${adapterName}`,
      })
    );
    console.log(swapTxReceipt);

    setTimeout(() => {
      store.dispatch(fetchERC20Balance({
        web3,
        token: tokenPair[0],
        owner: ownerAddress
      }));
      store.dispatch(fetchERC20Balance({
        web3,
        token: tokenPair[1],
        owner: ownerAddress
      }));
    });


    return swapTxReceipt;
  }
);
