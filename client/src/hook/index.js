import { createContext, useContext, useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    isConnected();
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

  const value = {
    account,
    connect
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context);