import React, { useEffect, useState } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';

const Home = React.lazy(() => import('./pages/App'))
const SignIn = React.lazy(() => import('./pages/SignIn'))

export default function PageRouter() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    isConnected()
  },[])

  const isConnected = async () => {
    const provider = await detectEthereumProvider();
    const accounts = await provider.request({ method: 'eth_accounts' });
    console.log({ accounts })

    if (accounts) {
      setAccount(accounts[0]);
      // window.location.assign('/');
    }
    else console.error('No authorized account found.')
  }

  const connect = async () => {
    try {
      const provider = await detectEthereumProvider();
      // returns an array of accounts
      const accounts = await provider.request({ method: 'eth_requestAccounts' });

      // check if array at least one element
      if (accounts.length) {
        console.info('account found', { accounts });
        setAccount(accounts[0])
        window.location.assign('/');
      } 
      else {
        alert('No account found');
        window.location.assign('/connect');
      }
    } catch (error) {
      console.error('Error connecting to wallet provider.', { error })
    }
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home account={account} />} />
        <Route path="/connect" element={<SignIn account={account} connect={connect} />} />
      </Routes>
    </Router>
  )
}