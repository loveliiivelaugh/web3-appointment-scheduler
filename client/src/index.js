import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Web3Provider } from './hook';
import Routes from './Routes';
import reportWebVitals from './reportWebVitals';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Web3Provider>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Routes />
      </LocalizationProvider>
    </Web3Provider>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
