import React, { useEffect, useState } from 'react';

import {
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import { IToken, ITokenBalance } from '../../models';
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

import { CommonSwapProps, SwapDirection } from '.';

type SwapInputProps = React.PropsWithChildren<
  CommonSwapProps & {
    direction: SwapDirection;
    tokens: Array<IToken>;
    onSelectToken: SingleCallback<IToken>;
    onUpdateInAmount?: DoubleCallback<boolean, string>;
  }
>;

export const SwapInput: React.FC<SwapInputProps> = ({
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
            <Dropdown.Item
              key={`${direction}-${t.symbol}`}
              eventKey={[direction, t.symbol].join('!')}
            >
              {t.symbol}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <FormControl
          disabled={direction === 'to' || !enabled}
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
