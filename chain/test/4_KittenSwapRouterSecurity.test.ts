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

async function expectRevert(promise: Promise<Truffle.TransactionResponse<any>>) {
  try {
    await promise;
  } catch (error) {
    if (error.message.indexOf('revert') === -1) {
      expect('revert').to.equal(error.message, 'Wrong kind of exception received');
    }
    return;
  }
  expect.fail('Expected an exception but none was received');
}

contract('KittenSwapRouter Adapters Test', async (accounts) => {


  let ksrInstance: KittenSwapRouterInstance;
  let uniAdapter: UniswapExchangeAdapterInstance;
  let sushiAdapter: UniswapExchangeAdapterInstance;

  let netId: number;

  before(async function() {
    netId = await web3.eth.net.getId();
  });


  describe('Deploy KittenSwapRouter, register and unregister', async function() {

    before(async function() {
      if (netId === 3 || netId === 42) {
        console.log("This test should be run under localhost network");
        this.skip();
      }
    })

    it('Should deploy KittenSwapRouter', async function() {
      ksrInstance = await KittenSwapRouter.new();
      console.log(`Deployed KSR at: ${ksrInstance.address}`);
      expect(ksrInstance.address).not.to.be.undefined;
    });
  
    it('Should deploy adapter for Uniswap', async function() {
      uniAdapter = await UniswapExchangeAdapter.new(
        uniswapRouterAddress,
        'Uniswap_Adapter',
        uniswapPairInitCode,
        ksrInstance.address
      );
      console.log(`Deployed uniAdapter at: ${uniAdapter.address}`);
      expect(uniAdapter.address).not.to.be.undefined;
    });
  
    it('Should deploy adapter for SushiSwap', async function() {
      sushiAdapter = await UniswapExchangeAdapter.new(
        sushiswapRouterAddress,
        'Sushiswap_Adapter',
        sushiswapPairInitCode,
        ksrInstance.address
      );
      console.log(`Deployed sushiAdapter at: ${sushiAdapter.address}`);
      expect(sushiAdapter.address).not.to.be.undefined;
    });
  
    it('Should register two adapters on KSR', async function() {
      const tx1 = await ksrInstance.registerAdapter(uniAdapter.address);
      console.log(`Added adapter for Uniswap: ${tx1.tx}`);
  
      const tx2 = await ksrInstance.registerAdapter(sushiAdapter.address);
      console.log(`Added adapter for Sushiswap: ${tx2.tx}`);
    });

    it('Should pause by owner', async function() {
      const tx = await ksrInstance.pause();
      console.log(`Pause Transaction: ${tx.tx}`);
    });

    it('Should unpause by owner', async function() {
      const tx = await ksrInstance.unpause();
      console.log(`Unpause Transaction: ${tx.tx}`);
    });

    it('Should not pause by others', async function() {
      const tx = await expectRevert(ksrInstance.pause({ from: accounts[1] }));
    });


  })


});