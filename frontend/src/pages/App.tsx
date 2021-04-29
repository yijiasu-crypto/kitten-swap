import { useEffect, useState } from 'react';
import {
  Col,
  Container,
  Row,
  Table,
} from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../web3/hooks';
import SwapPanel from '../components/SwapPanel';
import PricePanel from '../components/PricePanel';
import Header from '../components/Header';
import { useAppDispatch, useAppSelector } from '../store';
import { ethereumSlice } from '../store/ethereum';
import './App.css';
import { IToken, TokenPair } from '../models';
import { wrapWithWeb3 } from '../web3/blockchain-api/base';
import Web3 from 'web3';
import _ from 'lodash';
import { KittenSwapRouter } from '../contracts/types/KittenSwapRouter';
import { queryAmountOut } from '../store/ui';

const renderVerticalPadding = (height: number) => (
  <Row style={{height}}></Row>
);



const TransactionList = () => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
      </tbody>
    </Table>
  );
};

function App() {
  // const web3 = useWeb3React<Web3>();
  // console.log(web3);

  const web3Context = useWeb3React<Web3>();
  // const startConnect = async () => {
  //   
  // }

  const [metaMaskConnected, setMetaMaskConnected] = useState<Boolean>(false);
  const ethereumState = useAppSelector(state => state.ethereum);
  const chainDataState = useAppSelector(state => state.chainData);

  const tokens = useAppSelector(state => state.chainData.tokens);

  const dispatch = useAppDispatch();
  useEffect(() => {

    console.log(ethereumState);  
  });

  useEffect(() => {
    if (ethereumState.active) {
      console.log("Web3 is OK");
      // (window as any).web3 = web3Context.library!;
      const ksrContract = _.find(chainDataState.contracts, { name: "KittenSwapRouter" })!;
      // (window as any).contract = ksrContract;      
      const ksrRouter = wrapWithWeb3<KittenSwapRouter>(web3Context.library!, ksrContract);
      ksrRouter.methods.getAdapterCount().call().then(e => console.log(`adatery c= ${e}`));
      ksrRouter.methods.getAdapterNameByIndex(0).call().then(e => console.log(`adatery c= ${e}`));

    }

  }, [ethereumState.active]);

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
        setMetaMaskConnected(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const selectTokenPairListener = (pair: any) => {
    console.log(`Select with: `, pair);
  }

  const performSwapListener = (pair: TokenPair) => {
    console.log(`Perform with: `, pair);
    dispatch(
      queryAmountOut({
        web3: web3Context.library!,
        tokenPair: pair,
        amountIn: '1000000',
      })
    ); 
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
          <SwapPanel tokens={tokens} onSelectTokenPair={selectTokenPairListener} onPerformSwap={performSwapListener} />
        </Col>
        <Col className="no-padding">
          <PricePanel />
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

export default App;
