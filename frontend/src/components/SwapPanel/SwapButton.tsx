import React from 'react';
import { Button, InputGroup, Spinner } from 'react-bootstrap';
import { SingleCallback } from '../../utils/optional-type';

import './style.css';

export enum SwapButtonStatus {
  OK = '🚀  Swap Now',
  NOT_SELECTED = 'Please elect...',
  IDENTICAL_PAIR = 'Two tokens must not be identical',
  INSUFFICENT_BALANCE = 'Insufficent balance',
  NO_INPUT_AMOUNT = 'Please input amount...',
  BUSY = 'BUSY',
}

export const SwapButton: React.FC<{
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
          : buttonStatus === SwapButtonStatus.NOT_SELECTED ||
            buttonStatus === SwapButtonStatus.NO_INPUT_AMOUNT
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
