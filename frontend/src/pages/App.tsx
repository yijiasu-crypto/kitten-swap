import { useEffect, useState } from 'react';
import {
  Col,
  Container,
  Row,
  Table,
} from 'react-bootstrap';

import SwapPanel from '../components/SwapPanel';
import PricePanel from '../components/PricePanel';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';

import { useWeb3React } from '@web3-react/core';
import { injected } from '../web3/hooks';
import { useAppDispatch, useAppSelector } from '../store';
import { ethereumSlice } from '../store/ethereum';
import './App.css';
import { IToken, OptionalTokenPair, TokenPair } from '../models';
import Web3 from 'web3';
import _ from 'lodash';
import { performSwap, queryAmountOut, uiSlice } from '../store/ui';
import { toStringNumber } from '../utils/math';
import BigNumber from 'bignumber.js';

const renderVerticalPadding = (height: number) => (
  <Row style={{height}}></Row>
);




function App() {
  // const web3 = useWeb3React<Web3>();
  // console.log(web3);

  const [tokenPair, setTokenPair] = useState<OptionalTokenPair>([undefined, undefined]);
  const web3Context = useWeb3React<Web3>();
  // const startConnect = async () => {
  //   
  // }

  const ethereumState = useAppSelector(state => state.ethereum);
  const chainDataState = useAppSelector(state => state.chainData);

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
  }

  const performSwapListener = (pair: TokenPair, inAmount: string) => {
    console.log(`Perform with: `, pair);
    const stringNum = toStringNumber(inAmount, tokenPair[0]!.decimals);
    const bestOutAmount = uiState.price.bestPriceRef!.toAmount;
    const amountOutMin = new BigNumber(bestOutAmount)
      .multipliedBy(900)
      .dividedBy(1000)
      .toFixed(0)
      .toString();
    
    // dispatch(uiSlice.actions.becomeBusy());
    dispatch(performSwap({
      web3: web3Context.library!,
      tokenPair: tokenPair as TokenPair,
      amountIn: stringNum,
      amountOutMin,
    }));
  }

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

  }
  
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

      <Row className="justify-content-md-center">
        <Col style={{ width: '300px' }}>
          <h4>Recent Transactions</h4>
        </Col>
      </Row>
      <Row>
        <TransactionList />
      </Row>
    </Container>
  );
}

  // useEffect(() => {

  //   console.log(ethereumState);  
  // });

  // useEffect(() => {
  //   if (ethereumState.active) {
  //     console.log("Web3 is OK");
  //     // (window as any).web3 = web3Context.library!;
  //     const ksrContract = _.find(chainDataState.contracts, { name: "KittenSwapRouter" })!;
  //     // (window as any).contract = ksrContract;      
  //     const ksrRouter = wrapWithWeb3<KittenSwapRouter>(web3Context.library!, ksrContract);
  //     ksrRouter.methods.getAdapterCount().call().then(e => console.log(`adatery c= ${e}`));
  //     ksrRouter.methods.getAdapterNameByIndex(0).call().then(e => console.log(`adatery c= ${e}`));

  //   }

  // }, [ethereumState.active]);


export default App;
