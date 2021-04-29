import React from 'react';

import { ListGroup } from 'react-bootstrap';

import './style.css';

const PricePanel = () => (
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

export default PricePanel;
