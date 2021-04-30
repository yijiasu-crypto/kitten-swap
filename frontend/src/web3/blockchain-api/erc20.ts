import _ from 'lodash';
import Web3 from 'web3';
import { IERC20, IExchangeAdapter } from '../../contracts/types';
import { KittenSwapRouter } from '../../contracts/types/KittenSwapRouter';
import { TokenPair } from '../../models';
import store from '../../store';
import { wrapWithWeb3Interface } from './base';

export const checkERC20Approval = async (
  web3: Web3,
  contractAddress: string,
  { owner, spender }: { owner: string; spender: string }
) => {
  const { interfaces } = store.getState().chainData;
  const contractInterface = _.find(interfaces, { interface: 'IERC20' })!;

  const tokenContract = wrapWithWeb3Interface<IERC20>(
    web3,
    contractAddress,
    contractInterface
  );
  const allowance = await tokenContract.methods
    .allowance(owner, spender)
    .call();
  return allowance !== '0';
};


export const grantERC20Approval = async (
  web3: Web3,
  contractAddress: string,
  { owner, spender }: { owner: string; spender: string }
) => {
  const { interfaces } = store.getState().chainData;
  const contractInterface = _.find(interfaces, { interface: 'IERC20' })!;

  const tokenContract = wrapWithWeb3Interface<IERC20>(
    web3,
    contractAddress,
    contractInterface
  );

  return tokenContract.methods
    .approve(
      spender,
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
    .send({
      from: owner,
    });
  // const allowance = await tokenContract.methods
  //   .allowance(owner, spender)
  //   .call();
  // return allowance !== '0';
};

export const performSwapOnRouter = async (
  web3: Web3,
  contractAddress: string,
  { amountIn, amountOutMin, tokenPair, beneficiaryAddress }: { amountIn: string, amountOutMin: string, tokenPair: TokenPair, beneficiaryAddress: string }
) => {
  const state = store.getState();

  const { interfaces } = state.chainData;

  // const bestPriceRef = state.ui.price.bestPriceRef!;
  // const bestAdapter = _.find(state.chainData.contracts, { name: bestPriceRef.adapter });
  // const minOutAmount = bestPriceRef.toAmount;
  const contractInterface = _.find(interfaces, {
    interface: 'KittenSwapRouter',
  })!;

  const ksrContract = wrapWithWeb3Interface<KittenSwapRouter>(
    web3,
    contractAddress,
    contractInterface
  );

  const deadline = Math.round(+new Date()/1000) + 10000;

  return ksrContract.methods.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [
      tokenPair[0].address,
      tokenPair[1].address
    ],
    beneficiaryAddress,
    deadline
  ).send({
    from: beneficiaryAddress
  });

};

export const queryAdapterAmountOut = async (
  web3: Web3,
  contractAddress: string,
  { tokenPair, amountIn }: { tokenPair: TokenPair; amountIn: string }
) => {
  const { interfaces } = store.getState().chainData;
  const contractInterface = _.find(interfaces, {
    interface: 'IExchangeAdapter',
  })!;

  const adapterContract = wrapWithWeb3Interface<IExchangeAdapter>(
    web3,
    contractAddress,
    contractInterface
  );

  const amountOut = await adapterContract.methods
    .getAmountOutByTokenPair(
      amountIn,
      tokenPair[0].address,
      tokenPair[1].address
    )
    .call();

  return amountOut;
};
