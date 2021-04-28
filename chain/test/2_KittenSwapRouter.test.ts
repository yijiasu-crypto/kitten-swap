import {
  IERC20Instance,
  KittenSwapRouterInstance,
  UniswapExchangeAdapterInstance,
} from '../types/truffle-contracts';
import {
  calculateOutAmount,
  getDaiAddress,
  getSushiTokenPairForSushiAddress,
  getUniTokenPairAddress,
  getWETHAddress,
  sushiswapPairInitCode,
  sushiswapRouterAddress,
  toBN,
  uniswapPairInitCode,
  uniswapRouterAddress,
} from './common';
import { readDeployState, saveDeployState } from './test_state_persistance';

const KittenSwapRouter = artifacts.require('KittenSwapRouter');
const UniswapExchangeAdapter = artifacts.require('UniswapExchangeAdapter');
const UniswapV2Pair = artifacts.require('IUniswapV2Pair');
const ERC20 = artifacts.require('IERC20');

contract('KittenSwapRouter', async (accounts) => {


  let ksrInstance: KittenSwapRouterInstance;
  let uniAdapter: UniswapExchangeAdapterInstance;
  let sushiAdapter: UniswapExchangeAdapterInstance;

  let netId: number;

  before(async function() {
    netId = await web3.eth.net.getId();
  });


  describe('Deploy KittenSwapRouter and two adapters', async function() {

    before(async function () {
      const lastDeployState = await readDeployState();
      if (lastDeployState && lastDeployState.chainId === netId) {
        console.log("Found last deploy state... Skip deploy!")
  
        ksrInstance = await KittenSwapRouter.at(lastDeployState.kittenSwapRouter);
        uniAdapter = await UniswapExchangeAdapter.at(lastDeployState.uniAdapter);
        sushiAdapter = await UniswapExchangeAdapter.at(lastDeployState.sushiAdapter);

        this.skip();
      }
    });

    it('Should deploy KittenSwapRouter', async function() {
      ksrInstance = await KittenSwapRouter.new();
      console.log(`Deployed KSR at: ${ksrInstance.address}`);
    });
  
    it('Should deploy adapter for Uniswap', async function() {
      uniAdapter = await UniswapExchangeAdapter.new(
        uniswapRouterAddress,
        'Uniswap_Adapter',
        uniswapPairInitCode
      );
      console.log(`Deployed uniAdapter at: ${uniAdapter.address}`);
    });
  
    it('Should deploy adapter for SushiSwap', async function() {
      sushiAdapter = await UniswapExchangeAdapter.new(
        sushiswapRouterAddress,
        'Sushiswap_Adapter',
        sushiswapPairInitCode
      );
      console.log(`Deployed sushiAdapter at: ${sushiAdapter.address}`);
    });
  
    it('Should register two adapters on KSR', async function() {
      const tx1 = await ksrInstance.addNewAdapter(uniAdapter.address);
      console.log(`Added adapter for Uniswap: ${tx1.tx}`);
  
      const tx2 = await ksrInstance.addNewAdapter(sushiAdapter.address);
      console.log(`Added adapter for Sushiswap: ${tx2.tx}`);
    });
  
    it('Should save deployment state', async() => {
      await saveDeployState({
        chainId: netId,
        kittenSwapRouter: ksrInstance.address,
        sushiAdapter: sushiAdapter.address,
        uniAdapter: uniAdapter.address,
      });
    });
  
  })



  describe('Test KSR On-chain Functions', async function() {

    let bestAmountOut: BN;
    let adapterIdxUsed: BN;

    before(() => {
      if (netId !== 3 && netId !== 42) {
        throw new Error("This test must be run under Ropsten or Kovan network");
      }
    })
  
    it('Should get quote from KSR', async function() {
      const daiToken = getDaiAddress(netId);
      const wethToken = getWETHAddress(netId);
      const result = await ksrInstance.getBestQuote(
        daiToken,
        wethToken,
        1_000_000
      );
  
      bestAmountOut = result['0'];
      adapterIdxUsed = result['1'];
  
      console.log(
        `bestAmountOut = ${bestAmountOut.toString()}; adapterIdxUsed = ${adapterIdxUsed.toString()}`
      );
    });
  
    it('Should use adapter that provides higher amountOut', async function() {
      const sushiPairAddress = getSushiTokenPairForSushiAddress(netId);
      const uniPairAddress = getUniTokenPairAddress(netId);
  
      const sushiPair = await UniswapV2Pair.at(sushiPairAddress);
      const uniPair = await UniswapV2Pair.at(uniPairAddress);
  
      const sushiReserve = await sushiPair.getReserves();
      const uniReserve = await uniPair.getReserves();
  
      const sushiOutAmount = calculateOutAmount({
        inReserve: sushiReserve['1'],
        outReserve: sushiReserve['0'],
        inAmount: web3.utils.toBN(1_000_000),
      });
  
      const uniOutAmount = calculateOutAmount({
        inReserve: uniReserve['1'],
        outReserve: uniReserve['0'],
        inAmount: web3.utils.toBN(1_000_000),
      });
  
      console.log(
        `[0]UniOutAmount=${uniOutAmount.toString()}; [1]SushiOutAmount=${sushiOutAmount.toString()};`
      );
      const adapters = ['Uniswap_Adapter', 'Sushiswap_Adapter'];
  
      const expectedBestAdapter = sushiOutAmount.gt(uniOutAmount)
        ? 'Sushiswap_Adapter'
        : 'Uniswap_Adapter';
      const actualBestAdapter = adapters[adapterIdxUsed.toNumber()];
  
      expect(expectedBestAdapter).to.equal(actualBestAdapter);
    });

  })

  describe('Test KSR Token Swapping: WETH->DAI', async function() {

    let bestAmountOut: BN;
    let wethERC20: IERC20Instance;

    before(() => {
      if (netId !== 3 && netId !== 42) {
        throw new Error("This test must be run under Ropsten or Kovan network");
      }
    })

    before(async function () {
      const daiToken = getDaiAddress(netId);
      const wethToken = getWETHAddress(netId);
      const result = await ksrInstance.getBestQuote(
        daiToken,
        wethToken,
        1_000_000
      );
  
      bestAmountOut = result['0'];
    })

    it('Approve WETH on KSR', async() => {
      wethERC20 = await ERC20.at(getWETHAddress(netId));
      const currentAllowance = await wethERC20.allowance(accounts[0], ksrInstance.address);
      if (currentAllowance.eq(web3.utils.toBN(0))) {
        await wethERC20.approve(ksrInstance.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      }
      else {
        console.log("WETH contract already approved");
      }
    })

    it('Has some WETH amount', async function() {
      const requiredAmount = web3.utils.toBN(1_000_000);
      const actualAmount = await wethERC20.balanceOf(accounts[0]);
      if (actualAmount.gte(requiredAmount)) {
        console.log(`Current WETH balance: ${actualAmount.toString()}`);
      }
      else {
        throw new Error('Insufficent WETH amount');
      }
    });

    it('Should perform token WETH->DAI swapping', async function() {
      
      const toSwapAmount = toBN(1_000_000);
      const minSwapAmount = bestAmountOut.mul(toBN(950)).div(toBN(1000));
      const unixTime = Math.round(+new Date()/1000);
      const swapTx = await ksrInstance.swapExactTokensForTokens(
        toSwapAmount,
        minSwapAmount,
        [
          getWETHAddress(netId),
          getDaiAddress(netId),
        ],
        accounts[0],
        unixTime + 10000,
      )

      console.log(swapTx);
    })

    
  });



  describe('Test KSR Token Swapping: DAI->WETH', async function() {

    let bestAmountOut: BN;
    let daiERC20: IERC20Instance;

    before(() => {
      if (netId !== 3 && netId !== 42) {
        throw new Error("This test must be run under Ropsten or Kovan network");
      }
    })

    before(async function () {
      const daiToken = getDaiAddress(netId);
      const wethToken = getWETHAddress(netId);
      const result = await ksrInstance.getBestQuote(
        wethToken,
        daiToken,
        500_000_000
      );
  
      bestAmountOut = result['0'];
    })

    it('Approve DAI on KSR', async() => {
      daiERC20 = await ERC20.at(getDaiAddress(netId));
      const currentAllowance = await daiERC20.allowance(accounts[0], ksrInstance.address);
      if (currentAllowance.eq(web3.utils.toBN(0))) {
        await daiERC20.approve(ksrInstance.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      }
      else {
        console.log("DAI contract already approved");
      }
    })

    it('Has some DAI amount', async function() {
      const requiredAmount = web3.utils.toBN(500_000_000);
      const actualAmount = await daiERC20.balanceOf(accounts[0]);
      if (actualAmount.gte(requiredAmount)) {
        console.log(`Current DAI balance: ${actualAmount.toString()}`);
      }
      else {
        throw new Error('Insufficent DAI amount');
      }
    });

    it('Should perform token DAI->WETH swapping', async function() {
      
      const toSwapAmount = toBN(500_000_000);
      const minSwapAmount = bestAmountOut.mul(toBN(950)).div(toBN(1000));
      const unixTime = Math.round(+new Date()/1000);
      const swapTx = await ksrInstance.swapExactTokensForTokens(
        toSwapAmount,
        minSwapAmount,
        [
          getDaiAddress(netId),
          getWETHAddress(netId),
        ],
        accounts[0],
        unixTime + 10000,
      )

      console.log(swapTx);
    })

    
  });

});
