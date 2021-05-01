import React, { useEffect, useState } from 'react';

import { ListGroup } from 'react-bootstrap';
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

import './style.css';
import { useAppSelector } from '../../store';
import { SwapInput } from './SwapInput';
import { SwapButton, SwapButtonStatus } from './SwapButton';

export type SwapDirection = 'from' | 'to';

export interface CommonSwapProps {
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
  const [sufficentBalance, setSufficentBalance] = useState(true);
  const [swapButtonStatus, setSwapButtonStatus] = useState(
    SwapButtonStatus.NOT_SELECTED
  );

  const makeTokenSelector = (direction: SwapDirection) => (token: IToken) => {
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
    
    const hasInputAmount = inAmount !== '0';

    if (testIdenticalPair) {
      setSwapButtonStatus(SwapButtonStatus.IDENTICAL_PAIR);
    } else if (!testHasSelected) {
      setSwapButtonStatus(SwapButtonStatus.NOT_SELECTED);
    } else if (!hasInputAmount) {
      setSwapButtonStatus(SwapButtonStatus.NO_INPUT_AMOUNT);
    } else if (!sufficentBalance) {
      setSwapButtonStatus(SwapButtonStatus.INSUFFICENT_BALANCE);
    } else if (uiState.busy) {
      setSwapButtonStatus(SwapButtonStatus.BUSY);
    } else {
      setSwapButtonStatus(SwapButtonStatus.OK);
    }
  }, [fromToken, toToken, inAmount, sufficentBalance, uiState.busy]);

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
