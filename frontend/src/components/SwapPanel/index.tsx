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
import {
  IPriceRef,
  IToken,
  ITokenBalance,
  OptionalTokenPair,
  TokenPair,
} from '../../models';
import {
  DoubleCallback,
  Optional,
  SingleCallback,
} from '../../utils/optional-type';
import _ from 'lodash';

import './style.css';
import {
  fromStringNumber,
  stringNumberCompare,
  toStringNumber,
} from '../../utils/math';
import { useAppSelector } from '../../store';

interface CommonSwapProps {
  enabled: boolean;
  tokens: Array<IToken>;
  balance: Array<ITokenBalance>;
  bestPriceRef?: IPriceRef;
}

type SwapPanelProps = React.PropsWithChildren<
  CommonSwapProps & {
    onSelectTokenPair: SingleCallback<OptionalTokenPair>;
    onPerformSwap: DoubleCallback<TokenPair, string>;
    onUpdateInAmount: SingleCallback<string>;
  }
>;

type SwapInputProps = React.PropsWithChildren<
  CommonSwapProps & {
    direction: Direction;
    tokens: Array<IToken>;
    onSelectToken: SingleCallback<IToken>;
    onUpdateInAmount?: DoubleCallback<boolean, string>;
  }
>;

type Direction = 'from' | 'to';

enum SwapButtonStatus {
  OK = '🚀  Swap Now',
  NOT_SELECTED = 'Please Select...',
  IDENTICAL_PAIR = 'Two tokens must not be identical',
  INSUFFICENT_BALANCE = 'Insufficent balance',
  BUSY = 'BUSY',
}

const SwapButton: React.FC<{
  enabled: boolean;
  buttonStatus: SwapButtonStatus;
  onPerformSwap?: SingleCallback<any>;
}> = ({ enabled, buttonStatus, onPerformSwap }) => (
  <InputGroup size="lg">
    <Button
      variant={
        buttonStatus === SwapButtonStatus.IDENTICAL_PAIR ||
        buttonStatus === SwapButtonStatus.INSUFFICENT_BALANCE
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

const SwapInput: React.FC<SwapInputProps> = ({
  enabled,
  direction,
  tokens,
  balance,
  onSelectToken,
  onUpdateInAmount,
  bestPriceRef,
}) => {
  const [selectedToken, setSelectedToken] = useState<Optional<IToken>>();
  const [displayBalance, setDisplayBalance] = useState('0');
  const [insufficentError, setInsufficentError] = useState(false);
  const inputRef = React.createRef<HTMLInputElement>();

  const [withBalanceToken, setWithBalanceToken] = useState<
    Optional<ITokenBalance>
  >();

  useEffect(() => {
    if (selectedToken) {
      console.log('Updating balance...');
      const withBalanceToken = _.find(balance, {
        token: { address: selectedToken.address },
      });
      setWithBalanceToken(withBalanceToken);
      if (withBalanceToken) {
        setDisplayBalance(
          `Balance: ${fromStringNumber(
            withBalanceToken.balance,
            withBalanceToken.token.decimals
          )} ${withBalanceToken.token.symbol}`
        );
      }
    } else {
      setWithBalanceToken(undefined);
    }
  }, [balance, selectedToken]);

  const selectTokenListener = (eventKey: string | null) => {
    if (eventKey) {
      const [, symbol] = eventKey.split('!');
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
      if (
        stringNumberCompare(
          withBalanceToken.balance,
          toStringNumber(inputRef.current!.value, selectedToken!.decimals)
        ) === -1
      ) {
        setInsufficentError(true);
        return false;
      } else {
        setInsufficentError(false);
        return true;
      }
    }
    return true;
  };

  const throttledCallback = _.throttle(
    () => {
      // check balance
      const checkBalance = checkSufficentBalance();
      if (inputRef.current && onUpdateInAmount) {
        onUpdateInAmount(checkBalance, inputRef.current.value);
      }
    },
    1200,
    { trailing: true }
  );
  const textChange = () => {
    if (direction === 'from') {
      throttledCallback();
    }
  };

  let inputBoxLabel = direction;
  let displayToAmount;

  if (bestPriceRef) {
    inputBoxLabel += `  (VIA ${bestPriceRef.adapter})`;
    displayToAmount = fromStringNumber(
      bestPriceRef.toAmount,
      bestPriceRef.toToken.decimals
    );
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
            <Dropdown.Item key={`${direction}-${t.symbol}`} eventKey={[direction, t.symbol].join('!')}>
              {t.symbol}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <FormControl
          disabled={direction === 'to' || (!enabled)}
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

const SwapPanel: React.FC<SwapPanelProps> = ({
  enabled,
  tokens,
  balance,
  onSelectTokenPair,
  onPerformSwap,
  onUpdateInAmount,
  bestPriceRef,
}) => {
  const [fromToken, setFromToken] = useState<Optional<IToken>>();
  const [toToken, setToToken] = useState<Optional<IToken>>();
  const [inAmount, setInAmount] = useState('0');
  const [sufficentBalance, setSufficentBalance] = useState(false);
  const [swapButtonStatus, setSwapButtonStatus] = useState(
    SwapButtonStatus.NOT_SELECTED
  );

  const makeTokenSelector = (direction: Direction) => (token: IToken) => {
    direction === 'from' ? setFromToken(token) : setToToken(token);
    direction === 'from'
      ? onSelectTokenPair([token, toToken])
      : onSelectTokenPair([fromToken, token]);
  };

  const uiState = useAppSelector((state) => state.ui);

  useEffect(() => {
    const testHasSelected = !(fromToken === undefined || toToken === undefined);
    const testIdenticalPair =
      testHasSelected && fromToken?.symbol === toToken?.symbol;

    if (testIdenticalPair) {
      setSwapButtonStatus(SwapButtonStatus.IDENTICAL_PAIR);
    } else if (!testHasSelected) {
      setSwapButtonStatus(SwapButtonStatus.NOT_SELECTED);
    } else if (!sufficentBalance) {
      setSwapButtonStatus(SwapButtonStatus.INSUFFICENT_BALANCE);
    } else if (uiState.busy) {
      setSwapButtonStatus(SwapButtonStatus.BUSY);
    } else {
      setSwapButtonStatus(SwapButtonStatus.OK);
    }
  }, [fromToken, toToken, sufficentBalance, uiState.busy]);

  return (
    <ListGroup>
      <ListGroup.Item className="card">
        <SwapInput
          enabled={enabled}
          direction="from"
          tokens={tokens}
          balance={balance}
          onSelectToken={makeTokenSelector('from')}
          onUpdateInAmount={(hasSufficentBalance, amount) => {
            setSufficentBalance(hasSufficentBalance);
            setInAmount(amount);
            if (swapButtonStatus === SwapButtonStatus.OK) {
              onUpdateInAmount(amount);
            }
          }}
        />
      </ListGroup.Item>
      <ListGroup.Item className="card">
        <SwapInput
          enabled={enabled}
          direction="to"
          tokens={tokens}
          balance={balance}
          onSelectToken={makeTokenSelector('to')}
          bestPriceRef={bestPriceRef}
        />
      </ListGroup.Item>
      <ListGroup.Item className="card-button">
        <SwapButton
          enabled={enabled}
          buttonStatus={swapButtonStatus}
          onPerformSwap={() => onPerformSwap([fromToken!, toToken!], inAmount)}
        />
      </ListGroup.Item>
    </ListGroup>
  );
};

export default SwapPanel;
