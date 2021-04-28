import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Button,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
  ListGroup,
  Row,
  Table,
} from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import Web3 from 'web3';
import { injected } from '../web3/hooks';

const renderVerticalPadding = (height: number) => (
  <Row style={{height}}></Row>
);

const Header = () => {
  const web3Context = useWeb3React();
  const startConnect = async () => {
    await web3Context.activate(injected);
  }
  return (
    <Row>
    <Col className="header-col">
      <h2>🐱 KittenSwap</h2>
      <Button variant="outline-primary" onClick={startConnect}>Connect MetaMask</Button>{' '}
    </Col>
  </Row>
  );
}

const renderSwapInput = (direction: 'from' | 'to') => (
  <>
  <label className="sm-label" htmlFor="swap-input">{direction.toUpperCase()}</label>
  <InputGroup size="lg">
    <DropdownButton
      as={InputGroup.Prepend}
      variant="outline-secondary"
      title="DAI"
      id="input-group-dropdown-1"
    >
      <Dropdown.Item>DAI</Dropdown.Item>
      <Dropdown.Item>WETH</Dropdown.Item>
    </DropdownButton>
    <FormControl id="swap-input" aria-describedby="basic-addon1" />
  </InputGroup>
  </>
);


const renderSwapButton = () => (
  <InputGroup size="lg">
        <Button variant="primary" size="lg" block>
          🚀&nbsp;&nbsp;Swap Now!
        </Button>

  </InputGroup>
);


const renderSwapPanel = () => (
  <ListGroup>
    <ListGroup.Item className="card">{renderSwapInput('from')}</ListGroup.Item>
    <ListGroup.Item className="card">{renderSwapInput('to')}</ListGroup.Item>
    <ListGroup.Item className="card-button">{renderSwapButton()}</ListGroup.Item>
  </ListGroup>
);

const renderPricePanel = () => (
  <ListGroup>
    <ListGroup.Item className="price-panel">
      <h6 className="sm-label">PRICE COMPARE</h6>
      <ul>
        <li>UniSwap: 1 WETH = 333.22 DAI</li>
        <li>SushiSwap: 1 WETH = 333.22 DAI</li>
      </ul>
    </ListGroup.Item>
  </ListGroup>
);

function App() {
  const web3 = useWeb3React<Web3>();
  console.log(web3);

  return (
    <Container>
      <Row className="large-vertical-padding" />
      <Header />
      {renderVerticalPadding(10)}
      <Row>
        <Col className="no-padding" xs={8}>{renderSwapPanel()}</Col>
        <Col className="no-padding">{renderPricePanel()}</Col>
      </Row>
      {renderVerticalPadding(20)}

      <Row className="justify-content-md-center">
        <Col style={{ width: '300px' }}>
          <h4>Recent Transactions</h4>
        </Col>
      </Row>
      <Row>
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
      </Row>
    </Container>
  );
}

export default App;
