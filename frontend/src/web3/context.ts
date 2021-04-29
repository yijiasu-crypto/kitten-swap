import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
import store from '../store'
import { ethereumSlice } from '../store/ethereum'
import { useEagerConnect, useInactiveListener } from './hooks'

export default function Web3Context({ children }: { children: JSX.Element }) {

  const context = useWeb3React<Web3>()
  const { connector } = context

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>()
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])
  
  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)
  
  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true)
    }, 600)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (triedEager && context.active) {
      store.dispatch(ethereumSlice.actions.activate({
        account: context.account!,
        chainId: context.chainId!,
        active: true
      }));
  }});
  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  // // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  // if (!active && networkError) {
  //   return (
  //     <MessageWrapper>
  //       <Message>{t('unknownError')}</Message>
  //     </MessageWrapper>
  //   )
  // }

  // // if neither context is active, spin
  // if (!active && !networkActive) {
  //   return showLoader ? (
  //     <MessageWrapper>
  //       <Loader />
  //     </MessageWrapper>
  //   ) : null
  // }

  return children

}