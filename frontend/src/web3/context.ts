import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import store from '../store';
import { ethereumSlice } from '../store/ethereum';
import { useEagerConnect, useInactiveListener } from './hooks';

export default function Web3Context({ children }: { children: JSX.Element }) {

  const context = useWeb3React<Web3>();
  const { connector } = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);
  
  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);
  
  useEffect(() => {
    if (triedEager && context.active) {
      // ONLY FOR DEBUG
      (window as any).web3 = context.library!;
      store.dispatch(ethereumSlice.actions.activate({
        account: context.account!,
        chainId: context.chainId!,
        active: true
      }));
  }});
  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null;
  }

  return children;

}