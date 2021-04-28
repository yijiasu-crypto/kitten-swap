// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./interface/IExchangeAdapter.sol";
import "./uniswap/IERC20.sol";

contract KittenSwapRouter {

  address[] public _adapters;

  function getAdapterCount() view public returns (uint) {
    return _adapters.length;
  }
  
  function getAdapterNameByIndex(uint idx) view public returns (string memory name) {
    require(idx >= 0 && idx < _adapters.length, "Invalid Index");
    name = IExchangeAdapter(_adapters[idx]).getName();
  }

  function getAdapterAddressByIndex(uint idx) view public returns (address adapterAddr) {
    require(idx >= 0 && idx < _adapters.length, "Invalid Index");
    adapterAddr = _adapters[idx];
  }

  // TODO: this method should be protected
  // call by contract owners only
  function addNewAdapter(address adapterAddr) external {
    // TODO: check adapterAddr to be a valid adapter contract
    _adapters.push(adapterAddr);
  }

  function getBestQuote(
    address tokenIn,
    address tokenOut,
    uint amountIn
  ) view public returns (uint bestAmountOut, uint adapterIdxUsed) {
    bestAmountOut = 0;
    adapterIdxUsed = 0;
    for (uint i = 0; i < _adapters.length; i++) {
      uint amountOut = IExchangeAdapter(_adapters[i]).getAmountOutByTokenPair(amountIn, tokenIn, tokenOut);
      if (amountOut > bestAmountOut) {
        bestAmountOut = amountOut;
        adapterIdxUsed = i;
      }
    }
  }

  function swapExactTokensForTokens(
      uint amountIn,
      uint amountOutMin,
      address[] calldata path,
      address to,
      uint deadline
  ) external returns (uint[] memory amounts) {
    require(path.length == 2, 'Only support direct swapping');
    address tokenIn = path[0];
    address tokenOut = path[1];
    (, uint adapterIdxUsed) = getBestQuote(tokenIn, tokenOut, amountIn);

    IExchangeAdapter adapter = IExchangeAdapter(_adapters[adapterIdxUsed]);

    // // tranfer tokens to adapter
    require(IERC20(tokenIn).transferFrom(msg.sender, address(adapter), amountIn));

    // ask adapter to perform the swap
    return adapter.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
  }


}