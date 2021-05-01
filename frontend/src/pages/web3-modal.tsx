import React from 'react';
import { Modal } from 'react-bootstrap';

export enum Web3Error {
  NO_METAMASK = 'no-metamask',
  WRONG_NETWORK = 'wrong-network',
}

const modalText = {
  [Web3Error.NO_METAMASK]: {
    title: 'MetaMask Not Found',
    content: 'KittenSwap needs MetaMask to work with Ethereum blockchain. Install MetaMask and try again.',
  },
  [Web3Error.WRONG_NETWORK]: {
    title: 'Please use Kovan testnet',
    content:
      'Please switch to Kovan testnet and then make a page refresh. Other networks are not supported.',
  },
};
export function Web3Modal({ error }: { error: Web3Error }) {
  return (
    <Modal
      show={true}
      backdrop="static"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          {modalText[error].title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{modalText[error].content}</p>
      </Modal.Body>
    </Modal>
  );
}
