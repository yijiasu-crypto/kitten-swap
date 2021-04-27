// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../uniswap/IUniswapV2Router02.sol";

abstract contract IExchangeAdapter {

    function getName() virtual external view returns (string memory name);
    function quote(uint amountA, uint reserveA, uint reserveB) virtual external view returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) virtual external view returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) virtual external view returns (uint amountIn);
    // function getReservesByToken(address token0, address token1) virtual external view returns (uint112 reserve0, uint112 reserve1);
    function getAmountOutByTokenPair(uint amountIn, address tokenIn, address tokenOut) virtual external view returns (uint amountOut);
    
}