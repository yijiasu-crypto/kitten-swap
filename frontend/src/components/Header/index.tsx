import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const Header = ({
  metaMaskConnected,
  networkName,
  onTriggerConnect,
}: {
  metaMaskConnected: Boolean;
  networkName: string;
  onTriggerConnect: () => any;
}) => {
  const showText = !metaMaskConnected ? '🔌\u00A0\u00A0\u00A0Connect MetaMask' : `${networkName} Connected`
  return (
    <Row>
      <Col className="header-col">
        <h2>🐱 KittenSwap</h2>
        <Button variant={!metaMaskConnected ? "outline-primary" : "outline-success"} onClick={onTriggerConnect}>
          {showText}
        </Button>
      </Col>
    </Row>
  );
};

export default Header;
