// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../uniswap/IUniswapV2Router02.sol";

abstract contract IExchangeAdapter {

    function getName() virtual external view returns (string memory name);
    function quote(uint amountA, uint reserveA, uint reserveB) virtual external view returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) virtual external view returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) virtual external view returns (uint amountIn);
    function getAmountOutByTokenPair(uint amountIn, address tokenIn, address tokenOut) virtual external view returns (uint amountOut);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) virtual external returns (uint[] memory amounts);

}