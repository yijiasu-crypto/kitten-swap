// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./uniswap/IUniswapV2Router02.sol";
import "./uniswap/IUniswapV2Factory.sol";
import "./uniswap/IUniswapV2Pair.sol";

import "./interface/IExchangeAdapter.sol";

contract UniswapExchangeAdapter is IExchangeAdapter {

    IUniswapV2Router02 public uniswapRouter;
    string public adapterName;
    bytes private initCodeHash;

    constructor(address _uniswapRouter, string memory _adapterName, bytes memory _initCodeHash) {
      uniswapRouter = IUniswapV2Router02(_uniswapRouter);
      adapterName = _adapterName;
      initCodeHash = _initCodeHash;
    }

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
    }

    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(uint160(uint256(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token0, token1)),
                initCodeHash
                // hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
            )))));
    }


    function getName() override public view returns (string memory name) {
      name = adapterName;
    }

    function quote(uint amountA, uint reserveA, uint reserveB) override public view returns (uint amountB) {
      amountB = uniswapRouter.quote(amountA, reserveA, reserveB);
    }
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) override public view returns (uint amountOut) {
      amountOut = uniswapRouter.getAmountOut(amountIn, reserveIn, reserveOut);
    }
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) override public view returns (uint amountIn) {
      amountIn = uniswapRouter.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountOutByTokenPair(uint amountIn, address tokenIn, address tokenOut) override public view returns (uint amountOut) {
      address factory = uniswapRouter.factory();
      (uint reserve0, uint reserve1, ) = IUniswapV2Pair(pairFor(factory, tokenIn, tokenOut)).getReserves();
      (uint reseverIn, uint reserveOut) = tokenIn < tokenOut ? (reserve1, reserve0) : (reserve0, reserve1);
      amountOut = getAmountOut(amountIn, reseverIn, reserveOut);
    }

}