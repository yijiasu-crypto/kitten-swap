import { IUniswapV2FactoryInstance, IUniswapV2PairInstance, IUniswapV2Router02Instance, KittenSwapRouterInstance, UniswapExchangeAdapterInstance } from '../types/truffle-contracts';
import { getDaiAddress, getWETHAddress, sushiswapPairInitCode, sushiswapRouterAddress, uniswapPairInitCode } from './common';

// const UniswapV2Factory = artifacts.require("IUniswapV2Factory");
// const UniswapV2Pair = artifacts.require("IUniswapV2Pair");
// const UniswapV2Router = artifacts.require("IUniswapV2Router02");
const KittenSwapRouter = artifacts.require("KittenSwapRouter");
const UniswapExchangeAdapter = artifacts.require("UniswapExchangeAdapter");


const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

// const sushiswapFactoryAddress = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
// const sushiswapRouterAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

contract('Deploy KSR', async (accounts) => {

  
  let uniFactory: IUniswapV2FactoryInstance;
  let uniRouter: IUniswapV2Router02Instance;
  let daiWethPair: IUniswapV2PairInstance;
  let ksrInstance: KittenSwapRouterInstance;
  let uniAdapter: UniswapExchangeAdapterInstance;
  let sushiAdapter: UniswapExchangeAdapterInstance;

  let reserve0: BN;
  let reserve1: BN;

  let netId: number;

  before(async () => {
    netId = await web3.eth.net.getId();
  })


  it('Should deploy KittenSwapRouter', async () => {
    ksrInstance = await KittenSwapRouter.new()
    console.log(`Deployed KSR at: ${ksrInstance.address}`);
  })

  it('Should deploy adapter for Uniswap', async () => {
    uniAdapter = await UniswapExchangeAdapter.new(uniswapRouterAddress, 'Uniswap_Adapter', uniswapPairInitCode );
    console.log(`Deployed uniAdapter at: ${uniAdapter.address}`);
  })

  it('Should deploy adapter for SushiSwap', async () => {
    sushiAdapter = await UniswapExchangeAdapter.new(sushiswapRouterAddress, 'Sushiswap_Adapter', sushiswapPairInitCode);
    console.log(`Deployed sushiAdapter at: ${sushiAdapter.address}`);
  })

  it('Should register two adapters on KSR', async () => {
    const tx1 = await ksrInstance.addNewAdapter(uniAdapter.address);
    console.log(`Added adapter for Uniswap: ${tx1.tx}`);

    const tx2 = await ksrInstance.addNewAdapter(sushiAdapter.address);
    console.log(`Added adapter for Sushiswap: ${tx2.tx}`);
  })


  it('Should get quote from KSR', async () => {
    const daiToken = getDaiAddress(netId);
    const wethToken = getWETHAddress(netId);
    const result = await ksrInstance.getBestQuote(
      daiToken,
      wethToken,
      1_000_000
    );

    const bestAmountOut = result['0'];
    const adapterIdxUsed = result['1'];

    console.log(`bestAmountOut = ${bestAmountOut.toString()}; adapterIdxUsed = ${adapterIdxUsed.toString()}`);
  })

});

