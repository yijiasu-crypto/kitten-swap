import React, { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
  ListGroup,
} from 'react-bootstrap';
import { IToken, OptionalTokenPair, TokenPair } from '../../models';
import { GenericCallback, Optional, SingleCallback } from '../../utils/optional-type';
import _ from 'lodash';

import './style.css';


type SwanPanelProps = React.PropsWithChildren<{
  tokens: Array<IToken>,
  onSelectTokenPair: SingleCallback<OptionalTokenPair>,
  onPerformSwap: SingleCallback<TokenPair>,
}>;

type SwanInputProps = React.PropsWithChildren<{
  direction: Direction, tokens: Array<IToken>, onSelectToken: SingleCallback<IToken>
}>;

type Direction = 'from' | 'to';

enum SwapButtonStatus {
  OK = '🚀  Swap Now',
  NOT_SELECTED = 'Please Select...',
  IDENTICAL_PAIR = 'Two tokens must not be identical'
};



const SwapButton: React.FC<{ buttonStatus: SwapButtonStatus, onPerformSwap?: GenericCallback }> = ({
  buttonStatus,
  onPerformSwap
}) => (
  <InputGroup size="lg">
    <Button
      variant={
        buttonStatus === SwapButtonStatus.IDENTICAL_PAIR
          ? 'danger'
          : buttonStatus === SwapButtonStatus.NOT_SELECTED
          ? 'secondary'
          : 'primary'
      }
      disabled={buttonStatus !== SwapButtonStatus.OK}
      size="lg"
      onClick={onPerformSwap}
      block
    >
      {buttonStatus}
    </Button>
  </InputGroup>
);

const SwapInput: React.FC<SwanInputProps> = ({ direction, tokens, onSelectToken }) => {
  
  const [selectedToken, setSelectedToken] = useState<Optional<IToken>>();

  const selectTokenListener = (eventKey: string | null) => {
    if (eventKey) {
      const [, symbol] = eventKey.split("!");
      const token = _.find(tokens, { symbol });
      if (token) {
        setSelectedToken(token);
        onSelectToken(token);
      }
    }
  }

  return (
    <>
      <label className="sm-label" htmlFor={`swap-input-${direction}`}>
        {direction.toUpperCase()}
      </label>
      <InputGroup size="lg">
        <DropdownButton
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={selectedToken?.symbol ?? 'Select Token'}
          id={`swap-dropdown-${direction}`}
          onSelect={selectTokenListener}
        >
          {tokens.map((t) => (
            <Dropdown.Item eventKey={[direction, t.symbol].join("!")}>{t.symbol}</Dropdown.Item>
          ))}
        </DropdownButton>
        <FormControl id={`swap-input-${direction}`} />
      </InputGroup>
    </>
  );
};


const SwapPanel: React.FC<SwanPanelProps> = ({ tokens, onSelectTokenPair, onPerformSwap }) => {
  const [fromToken, setFromToken] = useState<Optional<IToken>>();
  const [toToken, setToToken] = useState<Optional<IToken>>();
  const [swapButtonStatus, setSwapButtonStatus] = useState(SwapButtonStatus.NOT_SELECTED);
  
  const makeTokenSelector = (direction: Direction) => (token: IToken) => {
    direction === 'from' ? setFromToken(token) : setToToken(token);
    direction === 'from'
      ? onSelectTokenPair([token, toToken])
      : onSelectTokenPair([fromToken, token]);
  };


  useEffect(() => {
    const testHasSelected = !(fromToken === undefined || toToken === undefined);
    const testIdenticalPair = testHasSelected && fromToken?.symbol === toToken?.symbol;

    if (testIdenticalPair) {
      setSwapButtonStatus(SwapButtonStatus.IDENTICAL_PAIR);
    }
    else if (!testHasSelected) {
      setSwapButtonStatus(SwapButtonStatus.NOT_SELECTED);
    }
    else {
      setSwapButtonStatus(SwapButtonStatus.OK);
    }
  }, [fromToken, toToken]);

  
  return (
    <ListGroup>
      <ListGroup.Item className="card">
        <SwapInput direction="from" tokens={tokens} onSelectToken={makeTokenSelector('from')} />
      </ListGroup.Item>
      <ListGroup.Item className="card">
        <SwapInput direction="to" tokens={tokens} onSelectToken={makeTokenSelector('to')} />
      </ListGroup.Item>
      <ListGroup.Item className="card-button">
        <SwapButton buttonStatus={swapButtonStatus} onPerformSwap={() => onPerformSwap([fromToken!, toToken!])} />
      </ListGroup.Item>
    </ListGroup>
  );
};

export default SwapPanel;
