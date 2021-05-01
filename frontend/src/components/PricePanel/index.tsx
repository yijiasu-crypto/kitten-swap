import React from 'react';

import { ListGroup } from 'react-bootstrap';
import { IPriceRef } from '../../models';
import { fromStringNumber } from '../../utils/math';

import './style.css';

const PricePanel: React.FC<{
  bestPriceRef: IPriceRef;
  priceRef: Array<IPriceRef>;
}> = ({ bestPriceRef, priceRef }) => (
  <ListGroup>
    <ListGroup.Item className="price-panel">
      <h6 className="sm-label">PRICE COMPARE</h6>
      <ul>
        {priceRef.map((pr) => {
          const fromAmount = fromStringNumber(
            pr.fromAmount,
            pr.fromToken.decimals
          );
          const toAmount = fromStringNumber(
            pr.toAmount,
            pr.toToken.decimals,
            5
          );
          const isBest = pr.adapter === bestPriceRef.adapter;
          return (
            <li key={`compare-${pr.adapter}`} style={isBest ? { color: 'green', fontWeight: 'bold' } : {}}>
              {isBest ? '✅ ' : ''}
              {pr.adapter}:<br /> {fromAmount} {pr.fromToken.symbol} ={' '}
              {toAmount} {pr.toToken.symbol}
            </li>
          );
        })}
      </ul>
    </ListGroup.Item>
  </ListGroup>
);

export default PricePanel;
