import React, { useEffect, useState } from 'react';

import {
  Button,
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
  ListGroup,
  Spinner,
} from 'react-bootstrap';
import { IPriceRef, IToken, ITokenBalance, OptionalTokenPair, TokenPair } from '../../models';
import { DoubleCallback, Optional, SingleCallback } from '../../utils/optional-type';
import _ from 'lodash';

import './style.css';
import { fromStringNumber, stringNumberCompare, toStringNumber } from '../../utils/math';
import { useAppSelector } from '../../store';


type SwanPanelProps = React.PropsWithChildren<{
  tokens: Array<IToken>;
  balance: Array<ITokenBalance>;
  onSelectTokenPair: SingleCallback<OptionalTokenPair>;
  onPerformSwap: DoubleCallback<TokenPair, string>;
  onUpdateInAmount: SingleCallback<string>;
  bestPriceRef?: IPriceRef;
}>;

type SwanInputProps = React.PropsWithChildren<{
  direction: Direction;
  tokens: Array<IToken>;
  balance: Array<ITokenBalance>;
  onSelectToken: SingleCallback<IToken>;
  onUpdateInAmount?: SingleCallback<string>
  bestPriceRef?: IPriceRef;
}>;

type Direction = 'from' | 'to';

enum SwapButtonStatus {
  OK = '🚀  Swap Now',
  NOT_SELECTED = 'Please Select...',
  IDENTICAL_PAIR = 'Two tokens must not be identical',
  BUSY = 'BUSY',
};



const SwapButton: React.FC<{
  buttonStatus: SwapButtonStatus;
  onPerformSwap?: SingleCallback<any>;
}> = ({ buttonStatus, onPerformSwap }) => (
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
      {buttonStatus !== SwapButtonStatus.BUSY ? (
        buttonStatus
      ) : (
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      )}
    </Button>
  </InputGroup>
);

const SwapInput: React.FC<SwanInputProps> = ({ direction, tokens, balance, onSelectToken, onUpdateInAmount, bestPriceRef }) => {
  
  const [selectedToken, setSelectedToken] = useState<Optional<IToken>>();
  const [displayBalance, setDisplayBalance] = useState('0');
  const [insufficentError, setInsufficentError] = useState(false);
  const inputRef = React.createRef<HTMLInputElement>();

  const [withBalanceToken, setWithBalanceToken] = useState<Optional<ITokenBalance>>();

  useEffect(() => {
    if (selectedToken) {
      console.log('set setWithBalanceToken');
      const withBalanceToken = _.find(balance, { token: { address: selectedToken.address } });
      setWithBalanceToken(withBalanceToken);
      if (withBalanceToken) {
        setDisplayBalance(
          `Balance: ${fromStringNumber(
            withBalanceToken.balance,
            withBalanceToken.token.decimals,
          )} ${withBalanceToken.token.symbol}`
        );
      }
    }
    else {
      setWithBalanceToken(undefined);
    }
  }, [balance, selectedToken]);

  const selectTokenListener = (eventKey: string | null) => {
    if (eventKey) {
      const [, symbol] = eventKey.split("!");
      const token = _.find(tokens, { symbol });
      if (token) {
        setSelectedToken(token);
        onSelectToken(token);
      }
    }
  };

  const checkNumerical = (event: any) => {
    if (!/[0-9]|\./.test(event.key)) {
      event.preventDefault();
    }
  };

  const checkSufficentBalance = () => {
    if (withBalanceToken) {
      if (stringNumberCompare(withBalanceToken.balance, toStringNumber(inputRef.current!.value, selectedToken!.decimals)) === -1) {
        console.log("balance not enough:" , withBalanceToken.balance, toStringNumber(inputRef.current!.value, selectedToken!.decimals));
        setInsufficentError(true);
        return false;
      }
      else {
        setInsufficentError(false);
        return true;
      }
    }
    return true;
  };

  const throttledCallback = _.throttle(() => {
    // check balance
    if (checkSufficentBalance()) {
      if (inputRef.current && onUpdateInAmount) {
        onUpdateInAmount(inputRef.current.value); 
      }
    }
  }, 1200, { trailing: true });
  const textChange = () => {
    if (direction === 'from') {
      throttledCallback();
    }
  };

  let inputBoxLabel = direction;
  let displayToAmount;

  if (bestPriceRef) {
    inputBoxLabel += `  (VIA ${bestPriceRef.adapter})`;
    displayToAmount = fromStringNumber(bestPriceRef.toAmount, bestPriceRef.toToken.decimals);
  }


  return (
    <>
      <label className="sm-label" htmlFor={`swap-input-${direction}`}>
        {inputBoxLabel.toUpperCase()}
      </label>
      <InputGroup size="lg" onChange={textChange} onKeyPress={checkNumerical}>
        <DropdownButton
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={selectedToken?.symbol ?? 'Select Token'}
          id={`swap-dropdown-${direction}`}
          onSelect={selectTokenListener}
        >
          {tokens.map((t) => (
            <Dropdown.Item eventKey={[direction, t.symbol].join('!')}>
              {t.symbol}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <FormControl
          disabled={direction === 'to'}
          value={displayToAmount}
          ref={inputRef}
          id={`swap-input-${direction}`}
        />
      </InputGroup>
      {insufficentError ? (
        <label className="balance-label">Insufficent Balance</label>
      ) : !!withBalanceToken ? (
        <label className="balance-label">{displayBalance}</label>
      ) : (
        ' '
      )}
    </>
  );
};


const SwapPanel: React.FC<SwanPanelProps> = ({ tokens, balance, onSelectTokenPair, onPerformSwap, onUpdateInAmount, bestPriceRef }) => {

  const [fromToken, setFromToken] = useState<Optional<IToken>>();
  const [toToken, setToToken] = useState<Optional<IToken>>();
  const [inAmount, setInAmount] = useState('0');
  const [swapButtonStatus, setSwapButtonStatus] = useState(SwapButtonStatus.NOT_SELECTED);
  
  const makeTokenSelector = (direction: Direction) => (token: IToken) => {
    direction === 'from' ? setFromToken(token) : setToToken(token);
    direction === 'from'
      ? onSelectTokenPair([token, toToken])
      : onSelectTokenPair([fromToken, token]);
  };

  const uiState = useAppSelector(state => state.ui);
  
  useEffect(() => {
    const testHasSelected = !(fromToken === undefined || toToken === undefined);
    const testIdenticalPair = testHasSelected && fromToken?.symbol === toToken?.symbol;

    if (testIdenticalPair) {
      setSwapButtonStatus(SwapButtonStatus.IDENTICAL_PAIR);
    }
    else if (!testHasSelected) {
      setSwapButtonStatus(SwapButtonStatus.NOT_SELECTED);
    }
    else if (uiState.busy) {
      setSwapButtonStatus(SwapButtonStatus.BUSY);
    }
    else {
      setSwapButtonStatus(SwapButtonStatus.OK);
    }
  }, [fromToken, toToken, uiState.busy]);

  
  return (
    <ListGroup>
      <ListGroup.Item className="card">
        <SwapInput
          direction="from"
          tokens={tokens}
          balance={balance}
          onSelectToken={makeTokenSelector('from')}
          onUpdateInAmount={(amount) => {
            setInAmount(amount);
            onUpdateInAmount(amount);
          }}
        />
      </ListGroup.Item>
      <ListGroup.Item className="card">
        <SwapInput
          direction="to"
          tokens={tokens}
          balance={balance}
          onSelectToken={makeTokenSelector('to')}
          bestPriceRef={bestPriceRef}
        />
      </ListGroup.Item>
      <ListGroup.Item className="card-button">
        <SwapButton
          buttonStatus={swapButtonStatus}
          onPerformSwap={() => onPerformSwap([fromToken!, toToken!], inAmount)}
        />
      </ListGroup.Item>
    </ListGroup>
  );
};

export default SwapPanel;