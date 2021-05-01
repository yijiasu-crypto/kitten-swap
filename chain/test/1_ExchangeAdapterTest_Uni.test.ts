import {
  IUniswapV2FactoryInstance,
  IUniswapV2PairInstance,
  IUniswapV2Router02Instance,
  KittenSwapRouterInstance,
  UniswapExchangeAdapterInstance,
} from '../types/truffle-contracts';
import {
  calculateOutAmount,
  getDaiAddress,
  getUniTokenPairAddress,
  getWETHAddress,
  uniswapFactoryAddress,
  uniswapRouterAddress,
} from './common';

const UniswapV2Factory = artifacts.require('IUniswapV2Factory');
const UniswapV2Pair = artifacts.require('IUniswapV2Pair');
const UniswapV2Router = artifacts.require('IUniswapV2Router02');

contract('ExchangeAdapter For Uniswap', async (accounts) => {

  let daiTokenAddress: string;
  let wETHTokenAddress: string;
  let uniFactory: IUniswapV2FactoryInstance;
  let uniRouter: IUniswapV2Router02Instance;
  let daiWethPair: IUniswapV2PairInstance;

  let reserve0: BN;
  let reserve1: BN;

  before(async function() {
    const netId = await web3.eth.net.getId();
    if (netId !== 3 && netId !== 42) {
      console.log("This test must be run under Ropsten or Kovan network");
      this.skip();
    }
  })

  before(async () => {
    uniFactory = await UniswapV2Factory.at(uniswapFactoryAddress);
    uniRouter = await UniswapV2Router.at(uniswapRouterAddress);
    daiTokenAddress = getDaiAddress(await web3.eth.net.getId()); // Token 0(DAI)
    wETHTokenAddress = getWETHAddress(await web3.eth.net.getId()); // Token 1(WETH)
  });

  it('should discover DAI/WETH pair', async () => {
    const expectedPairAddress = getUniTokenPairAddress(await web3.eth.net.getId());
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
    const inReserve = reserve1;
    const outReserve = reserve0;
    const inAmount = toBN(1_000_000);

    const offChainPrice = calculateOutAmount({ inReserve, outReserve, inAmount });
    console.log(`Off-chain price: ${offChainPrice.toString()}`);

    const onChainPrice = await uniRouter.getAmountOut(
      '1000000',
      inReserve,
      outReserve
    );
    console.log(`On-chain price: ${onChainPrice.toString()}`);

    expect(offChainPrice.toString()).to.equal(onChainPrice.toString());
  });
});
