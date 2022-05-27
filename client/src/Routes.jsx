import React, { Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { useWeb3 } from './hook';

const Home = lazy(() => import('./pages/App'));
const SignIn = lazy(() => import('./pages/SignIn'));

export default function PageRouter() {
  const { account, connect } = useWeb3();
  return (
    <Suspense fallback="loading">
      <Router>
        <Routes>
          <Route path="/" element={<Home account={account} />} />
          <Route path="/connect" element={<SignIn account={account} connect={connect} />} />
        </Routes>
      </Router>
    </Suspense>
  )
}