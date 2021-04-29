import React from 'react';

import {
  Button,
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
  ListGroup,
} from 'react-bootstrap';

import './style.css';

const renderSwapInput = (direction: 'from' | 'to') => (
  <>
    <label className="sm-label" htmlFor="swap-input">
      {direction.toUpperCase()}
    </label>
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

const SwapPanel = () => (
  <ListGroup>
    <ListGroup.Item className="card">{renderSwapInput('from')}</ListGroup.Item>
    <ListGroup.Item className="card">{renderSwapInput('to')}</ListGroup.Item>
    <ListGroup.Item className="card-button">
      {renderSwapButton()}
    </ListGroup.Item>
  </ListGroup>
);

export default SwapPanel;
