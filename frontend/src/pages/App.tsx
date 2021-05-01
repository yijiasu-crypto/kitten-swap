import { useEffect, useState } from 'react';
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
import { OptionalTokenPair, TokenPair } from '../models';
import Web3 from 'web3';
import { fetchERC20Balance, performSwap, queryAmountOut, uiSlice } from '../store/ui';
import { toStringNumber } from '../utils/math';
import BigNumber from 'bignumber.js';
import { Web3Error, Web3Modal } from './web3-modal';
import { Optional } from '../utils/optional-type';

import './App.css';

const renderVerticalPadding = (height: number) => (
  <Row style={{height}}></Row>
);

function App() {

  const [tokenPair, setTokenPair] = useState<OptionalTokenPair>([undefined, undefined]);
  const [web3Error, setWeb3Error] = useState<Optional<Web3Error>>();
  const web3Context = useWeb3React<Web3>();

  const ethereumState = useAppSelector(state => state.ethereum);
  const tokens = useAppSelector(state => state.chainData.tokens);

  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui);

  const triggerConnect = () => {
    web3Context
      .activate(injected)
      .then(() => {
        console.log(web3Context);
        if (typeof (window as any).web3 === 'undefined') {
          setWeb3Error(Web3Error.NO_METAMASK);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    if (ethereumState.active) {
      for (const token of tokens) {
        setImmediate(() => {
          dispatch(fetchERC20Balance({
            web3: web3Context.library!,
            token,
            owner: ethereumState.account
          }));
        });
      }  
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereumState.account, ethereumState.active, tokens]);

  const selectTokenPairListener = (pair: OptionalTokenPair) => {
    setTokenPair(pair);
    console.log(`Select with: `, pair);
  };

  const performSwapListener = (pair: TokenPair, inAmount: string) => {
    console.log(`Perform with: `, pair);
    const stringNum = toStringNumber(inAmount, tokenPair[0]!.decimals);
    const amountOut = uiState.price.bestPriceRef!.toAmount;
    const amountOutMin = new BigNumber(amountOut)
      .multipliedBy(990)
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
    const stringNum = toStringNumber(amount, tokenPair[0]!.decimals);
    
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
    <>
    { web3Error ? <Web3Modal error={web3Error} /> : null}
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
            enabled={ethereumState.active}
            tokens={tokens}
            balance={uiState.balance}
            bestPriceRef={uiState.price.bestPriceRef}
            onSelectTokenPair={selectTokenPairListener}
            onPerformSwap={performSwapListener}
            onUpdateInAmount={performUpdateToAmount}
          />
        </Col>
        <Col className="no-padding">
          <PricePanel bestPriceRef={uiState.price.bestPriceRef!} priceRef={uiState.price.priceRefs}/>
        </Col>
      </Row>
      {renderVerticalPadding(20)}

      <TransactionPanel onEmptyList={onEmptyTxList} recentTx={uiState.recentTx} />
    </Container>
    </>
  );
}

export default App;
