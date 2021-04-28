import {
  IUniswapV2FactoryInstance,
  IUniswapV2PairInstance,
  IUniswapV2Router02Instance,
  KittenSwapRouterInstance,
  UniswapExchangeAdapterInstance,
} from '../types/truffle-contracts';
import {
  getDaiAddress,
  getSushiTokenPairForSushiAddress,
  getWETHAddress,
  sushiswapFactoryAddress,
  sushiswapRouterAddress,
} from './common';

const UniswapV2Factory = artifacts.require('IUniswapV2Factory');
const UniswapV2Pair = artifacts.require('IUniswapV2Pair');
const UniswapV2Router = artifacts.require('IUniswapV2Router02');
const KittenSwapRouter = artifacts.require('KittenSwapRouter');
const UniswapExchangeAdapter = artifacts.require('UniswapExchangeAdapter');

contract('ExchangeAdapter For Sushiswap', async (accounts) => {

  let daiTokenAddress: string;
  let wETHTokenAddress: string;
  let uniFactory: IUniswapV2FactoryInstance;
  let uniRouter: IUniswapV2Router02Instance;
  let daiWethPair: IUniswapV2PairInstance;
  let ksrInstance: KittenSwapRouterInstance;
  let uniAdapter: UniswapExchangeAdapterInstance;

  let reserve0: BN;
  let reserve1: BN;

  before(async () => {
    const netId = await web3.eth.net.getId();
    if (netId !== 3 && netId !== 42) {
      throw new Error("This test must be run under Ropsten or Kovan network");
    }
  })

  before(async () => {
    uniFactory = await UniswapV2Factory.at(sushiswapFactoryAddress);
    uniRouter = await UniswapV2Router.at(sushiswapRouterAddress);
    daiTokenAddress = getDaiAddress(await web3.eth.net.getId()); // Token 0(DAI)
    wETHTokenAddress = getWETHAddress(await web3.eth.net.getId()); // Token 1(WETH)
  });

  it('should discover DAI/WETH pair', async () => {
    const expectedPairAddress = getSushiTokenPairForSushiAddress(await web3.eth.net.getId());
    const pairAddress = await uniFactory.getPair(
      daiTokenAddress,
      wETHTokenAddress
    );
    console.log(`DAI/WETH Pair Address = ${pairAddress}`);

    daiWethPair = await UniswapV2Pair.at(pairAddress);

    expect(expectedPairAddress.toLowerCase()).to.equal(
      pairAddress.toLowerCase()
    );
    expect(daiTokenAddress).not.to.be.undefined;
  });

  it('should have reserve in both tokens', async () => {
    const tokenReserve = await daiWethPair.getReserves();
    reserve0 = tokenReserve['0'];
    reserve1 = tokenReserve['1'];

    console.log(`tokenReserve0 = ${reserve0.toString()}`);
    console.log(`tokenReserve1 = ${reserve1.toString()}`);

    expect(reserve0.toString()).not.to.equal('0');
    expect(reserve1.toString()).not.to.equal('0');
  });

  it('off-chain price quote calculation should be correct', async () => {
    const toBN = web3.utils.toBN;
    const inputReserve = reserve1;
    const outputReserve = reserve0;
    const inputAmount = toBN(1_000_000);

    const inputAmountWithFee = inputAmount.mul(toBN(997));
    const numerator = inputAmountWithFee.mul(outputReserve);
    const denominator = inputReserve.mul(toBN(1000)).add(inputAmountWithFee); //JSBI.add(JSBI.multiply(inputReserve.raw, _1000), inputAmountWithFee)
    const offChainPrice = numerator.div(denominator);

    console.log(`Off-chain price: ${offChainPrice.toString()}`);

    const onChainPrice = await uniRouter.getAmountOut(
      '1000000',
      inputReserve,
      outputReserve
    );
    console.log(`On-chain price: ${onChainPrice.toString()}`);

    expect(offChainPrice.toString()).to.equal(onChainPrice.toString());
  });
});
