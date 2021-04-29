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

  const web3Context = useWeb3React();
  // const startConnect = async () => {
  //   
  // }

  const [metaMaskConnected, setMetaMaskConnected] = useState<Boolean>(false);
  const ethereumState = useAppSelector(state => state.ethereum);
  const tokens = useAppSelector(state => state.chainData.tokens);
  const dispatch = useAppDispatch();
  useEffect(() => {

    console.log(ethereumState);  
  });

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
