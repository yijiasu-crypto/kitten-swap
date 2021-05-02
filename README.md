# 🐱 KittenSwap

GitHub Repo: https://github.com/yijiasu/kitten-swap

Live Demo: https://kitten-swap.vercel.app/

Video: https://youtu.be/m5ja_MLcDo8

KittenSwap is an Ethereum token swapping dApp that helps you to swap tokens at the best exchanging rate.

Currently, KittenSwap supports swapping from Uniswap and Sushiswap. More DEX and swapping protocols can be added by implementing and deploying more adapters.

### 0. Getting Started

Before using KittenSwap, you will need some Kovan ETH. Get some free by following instructions here: https://faucet.kovan.network/

1. Wrap some ETH to WETH. KittenSwap only supports token inputs. Use any DEX to do the wrapping. Go to https://app.uniswap.org/ and:
	* Use Kovan network
	* Select ETH -> WETH pair. 
	* Don't wrap all your ETH balance otherwise you won't have balance for paying the gas fee
2. Go back to KittenSwap and use any token pair to swap. If you see 0 WETH balance after wrapping, do a page refresh.
3. After performing a swap, your transaction should be able to inspect on Etherscan.

### 1. How it works

1. You call the main entry of KittenSwap, which is the `KittenSwapRouter`, providing your designated swapping token pair and amounts you wish to swap with.
2. `KittenSwapRouter` checks all its adapters. For each adapter, it will return a quote it can perform a swap at.
3. After collecting all quotes from adapters, `KittenSwapRouter` will choose the best adapter to perform a swap.
4. The selected adapter will redirect your tokens to the underlying swapping protocol, and call its swap/trade function to finish the swap.

### 2. Limitations

Some limitations exist in current implementation due to urgentness of time. But most of them can be resolved if there's continuous work on it.

1. Only direct swapping is supported.
	In Uniswap or Sushiswap, they support multi-hop swapping if there's no direct LPs for two token pairs. `KittenSwapRouter` restricted users from inputting multi-hop paths, only allowing direct swapping. The reason for putting this restriction is to reduce complexity of on-chain price calculation. Actually, the underlying adapter does support indirect swapping, what we need to do more is to add some more logic on price quoting and more test cases on indirect swapping.
2. Some token pairs won't be working if there's no direct LPs
	The reason of this is exactly the same as (1). If you input a token pair without direct LPs, the quoting procedure will fail since the smart contract won't be able to find the direct pair. If you're using the Frontend, expect possible crashes in this case.
3. Only a few tokens were deployed on testnet.
	Currently this protocol is deployed on the Kovan testnet. Kovan is a PoA Ethereum testnet which provides higher TPS than PoW testnets like Ropsten. Since Kovan is less popular than Ropsten, there're less test tokens running on it. Thus, choices of trading pairs within Kovan are also limited.
4. Only `UniswapExchangeAdapter` is implemented, inheriting from the `IExchangeAdapter`interface.
	In the design of the entire `KittenSwap`protocol, the `IExchangeAdapter`is the abstract layer of all possible integrated DEXs and swapping protocols. Thus, it's protocol-agnostic, it's not coupled to any logic inside any specified underlying protocol. For example, the swapping rate calculation inside Uniswap protocol relies on the reserve amount of two tokens. But this concept is not used in `IExchangeAdapter`, since we consider there may be some other protocols beside Uniswap that provide different pricing mechanisms. In this perspective, any DEX or AMM protocol that provides token swapping functionality, is technically possible to be adapted on KittenSwap by implementing a new adapter that works with it.
	Since Sushiswap is also conformed to Uniswap protocol. Thus, we deployed two instances of `UniswapExchangeAdapter` to work with these two swapping protocols.

### 3. System Architecture	
![](https://raw.githubusercontent.com/yijiasu/kitten-swap/master/kittenswap.png?token=ABB54D527BT7ZZJYQ2RPFHDAS22QM)

### 4. Security

The `KittenSwapRouter` and its periphery smart contracts don't store any tokens from the user, or accept any direct Ether payments from function calls, so in general it has less concerns on security.  But there's still some points regarding our security measures on the smart contract level.

1. The `KittenSwapRouter` is ownable and stoppable.
2. The function `registerNewAdapter` of `KittenSwapRouter` is restricted to be called by the contract owner only.
3. `SafeMath` library is used to prevent attacks that utilize integer overflow vulnerability. 

Due to time urgentness, the following measures are considered at the beginning of system design, but not yet implemented.

4. Validates the bytecode of adapter smart contract before it is added to the `KittenSwapRouter`. This could prevent malicious users or attackers deploying arbitrary codes as an adapter.
6. Add a switch to enable/disable a specified adapter when its underlying protocol is malfunctioning.

### 5. Test

Some test cases were designed for testing the smart contract suite.

1. `0_ExchangeAdapterTest_Sushi.test` and `1_ExchangeAdapterTest_Uni.test` These two tests can perform basic function test on Uniswap and Sushiswap protocol itself, to make sure those two protocols are running normally. This is essential since all following tests involve functions on these two protocols.
2. `2_KittenSwapRouter.test` This test will deploy smart contracts on-chain and test its quoting and swapping functions. 
For the quoting part, the test will simulate an input token amount, then try to get a quote from the router, and get two quotes from Uniswap and Sushiswap directly. If the `KittenSwapRouter` works normally, it should provides the best quote (highest output amount) between these two protocols
For the swapping part, the test will perform two trades between `WETH` and `DAI`token, one for long trade and one for short trade. If the `KittenSwapRouter` works normally, these two trades should be executed successfully without any error.
3. `3_KittenSwapRouterAdapters.test` This test covers some cases in registering and unregistering adapters.
4. `4_KittenSwapRouterSecurity.test` This test covers some cases that could raise security issues. 

### 6. Upgradablitiy

In the design of `KittenSwap` system, the adapter part and router part are decoupled and can be deployed separately on an Ethereum blockchain. Thus, there's some degree of upgradability by deploying new adapters and removing the olds. The `KittenSwapRouter` itself, is not able to be upgraded. We can implement the `Router-Delegate` pattern on this smart contract to provide more flexibility but that's beyond the discussion on this project.

### 7. Deployment

A verified deployment of  `KittenSwapRouter`  is available at  [0x96ab64514484FA3257Fe82A42F900cDb79b25B65](https://kovan.etherscan.io/address/0x96ab64514484FA3257Fe82A42F900cDb79b25B65).

Please check https://github.com/yijiasu/kitten-swap/blob/master/chain/README.md to get more details about the deployment pipeline.


