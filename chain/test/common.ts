const getDaiAddress = (netId: number): string =>
  netId === 3
    ? '0xc2118d4d90b274016cb7a54c03ef52e6c537d957'
    : '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa';
const getWETHAddress = (netId: number): string =>
  netId === 3
    ? '0xc778417e063141139fce010982780140aa0cd5ab'
    : '0xd0a1e359811322d97991e03f863a0c30c2cf029c';

const getUniTokenPairAddress = (netId: number): string =>
  netId === 3
    ? '0xe8c6d3d1612cfd65e3d8fcab3ba90d100029a79c'
    : '0xb10cf58e08b94480fcb81d341a63295ebb2062c2';

const getSushiTokenPairForSushiAddress = (netId: number): string =>
  netId === 3
    ? '0xc4cbede6c5cc7d0c775adfc76803c5888c1530f0'
    : '0xc4cbede6c5cc7d0c775adfc76803c5888c1530f0';

    
const uniswapFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const sushiswapFactoryAddress = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4';   // on Kovan
const sushiswapRouterAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';    // on Kovan

const uniswapPairInitCode = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';
const sushiswapPairInitCode = '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303';


export {
  getDaiAddress,
  getWETHAddress,
  getUniTokenPairAddress,
  getSushiTokenPairForSushiAddress,
  uniswapFactoryAddress,
  uniswapRouterAddress,
  sushiswapFactoryAddress,
  sushiswapRouterAddress,
  uniswapPairInitCode,
  sushiswapPairInitCode
};
