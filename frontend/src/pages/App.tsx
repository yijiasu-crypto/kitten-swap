import { useState } from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import SwapPanel from '../components/SwapPanel';
import PricePanel from '../components/PricePanel';
import Header from '../components/Header';
import TransactionPanel from '../components/TransactionPanel';

import { useWeb3React } from '@web3-react/core';
import { injected } from '../web3/hooks';
import { useAppDispatch, useAppSelector } from '../store';
import { ethereumSlice } from '../store/ethereum';
import './App.css';
import { OptionalTokenPair, TokenPair } from '../models';
import Web3 from 'web3';
import { performSwap, queryAmountOut, uiSlice } from '../store/ui';
import { toStringNumber } from '../utils/math';
import BigNumber from 'bignumber.js';

const renderVerticalPadding = (height: number) => (
  <Row style={{height}}></Row>
);




function App() {

  const [tokenPair, setTokenPair] = useState<OptionalTokenPair>([undefined, undefined]);
  const web3Context = useWeb3React<Web3>();

  const ethereumState = useAppSelector(state => state.ethereum);
  const tokens = useAppSelector(state => state.chainData.tokens);
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui);

  const triggerConnect = () => {
    web3Context
      .activate(injected)
      .then(() => {
        console.log('123');
        dispatch(ethereumSlice.actions.activate({
          account: web3Context.account!,
          chainId: web3Context.chainId!,
          active: true
        }));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const selectTokenPairListener = (pair: OptionalTokenPair) => {
    setTokenPair(pair);
    console.log(`Select with: `, pair);
  };

  const performSwapListener = (pair: TokenPair, inAmount: string) => {
    console.log(`Perform with: `, pair);
    const stringNum = toStringNumber(inAmount, tokenPair[0]!.decimals);
    const amountOut = uiState.price.bestPriceRef!.toAmount;
    const amountOutMin = new BigNumber(amountOut)
      .multipliedBy(900)
      .dividedBy(1000)
      .toFixed(0)
      .toString();
    
    dispatch(performSwap({
      web3: web3Context.library!,
      tokenPair: tokenPair as TokenPair,
      amountIn: stringNum,
      amountOut,
      amountOutMin,
      adapterName: uiState.price.bestPriceRef!.adapter,
    }));
  };

  const performUpdateToAmount = (amount: string) => {
    console.log(tokenPair);
    console.log(`performUpdateToAmount = ${amount}`);
    const stringNum = toStringNumber(amount, tokenPair[0]!.decimals);
    console.log(`stringNum = ${stringNum}`);
    
    if (tokenPair[0] !== undefined && tokenPair[1] !== undefined) {
      if (stringNum !== '0') {
        dispatch(
          queryAmountOut({
            web3: web3Context.library!,
            tokenPair: tokenPair as TokenPair,
            amountIn: stringNum,
          })
        );     
      }
    }

  };
  
  const onEmptyTxList = () => dispatch(uiSlice.actions.clearAllTx());
  return (
    <Container>
      <Row className="large-vertical-padding" />
      <Header
        networkName={ethereumState.networkName}
        metaMaskConnected={ethereumState.active}
        onTriggerConnect={triggerConnect}
      />
      {renderVerticalPadding(10)}
      <Row>
        <Col className="no-padding" xs={8}>
          <SwapPanel
            tokens={tokens}
            onSelectTokenPair={selectTokenPairListener}
            onPerformSwap={performSwapListener}
            onUpdateInAmount={performUpdateToAmount}
            bestPriceRef={uiState.price.bestPriceRef}
          />
        </Col>
        <Col className="no-padding">
          <PricePanel bestPriceRef={uiState.price.bestPriceRef!} priceRef={uiState.price.priceRefs}/>
        </Col>
      </Row>
      {renderVerticalPadding(20)}

      <TransactionPanel onEmptyList={onEmptyTxList} recentTx={uiState.recentTx} />
    </Container>
  );
}

export default App;
