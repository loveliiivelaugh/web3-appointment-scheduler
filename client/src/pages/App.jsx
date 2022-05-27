import React, { useState, useEffect } from 'react';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import { Scheduler, WeekView, Appointments, AppointmentForm } from '@devexpress/dx-react-scheduler-material-ui';
import { SiSolidity } from 'react-icons/si';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { 
  Box, Button, CircularProgress, Container, Dialog, Grid, Paper, Slider, Stack, Typography 
} from '@mui/material';
import { ethers } from 'ethers';
import abi from '../abis/Calend3.json';
import logo from '../logo.svg';
import '../App.css';

const contractAddress = '0x8Be276ceFb509aB04aC10e687E9446773907a782';
const contractABI = abi.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(contractAddress, contractABI, provider.getSigner());

const App = ({ account }) => { 
  console.log(account, provider, contract);
  // if (!account) window.location.assign('/connect');
  return (
  <Container maxWidth={false} className="App">
    <Grid container>
      <img src={logo} className="App-logo" alt="logo" />
      <SiSolidity className="App-logo" style={{ fontSize: '60px' }} />
    </Grid>
    <Stack>
      <Typography variant="h2">
        Calend3 Training
      </Typography>
      <Typography variant="h5">
        Web3 Appointment Scheduler for Trainers
      </Typography>
    </Stack>
    {account && <Calendar account={account} /> }
    <Grid container sx={{ height: '10vh' }}>
      <Grid item justifyContent="end">
        <Typography variant="body1">
          Powered by the Ethereum blockchain
        </Typography>
      </Grid>
    </Grid>
  </Container>
);
}
export default App;

const schedulerData = [
  { startDate: '2022-05-02T09:45', endDate: '2022-05-02T10:45', title: 'Jasmines Bday' },
  { startDate: '2022-05-16T12:00', endDate: '2022-05-16T04:45', title: 'My Bday' },
  { startDate: '2022-05-25T3:00', endDate: '2022-05-25T03:45', title: 'Noahs Bday' },
];

const Calendar = ({ account }) => {
  console.log({ account, contract })
  // admin rate setting functionality
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [rate, setRate] = useState(0);
  const [appointments, setAppointments] = useState([]);

  const [showDialog, setShowDialog] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [mined, setMined] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  
  const transformAppointmentData = appointmentData => appointmentData.map(({ title, startTime, endTime }) => ({
    title,
    startDate: new Date(startTime * 1000),
    endDate: new Date(endTime * 1000),
  }));
  
  const getData = async () => {
    // get contract owner and set admin if connected account is owner
    const owner = await contract.owner();
    console.log({ owner })
    setIsAdmin(owner.toUpperCase() === account?.toUpperCase());

    const { value } = await contract.getRate();
    console.log(value);
    const formattedRate = ethers.utils.formatEther(value.toString());
    console.log({ formattedRate });
    setRate(formattedRate);

    const appointmentData = await contract.getAppointments();
    console.log('got appointments');
    console.log(appointmentData);
    setAppointments(transformAppointmentData(appointmentData));
  };

  useEffect(() => {
    getData();
  }, [])

  const saveAppointment = async data => {
    console.info('Appointment Saved');
    console.info({ data });
    const start = data.added.startDate.getTime() / 1000;
    const end = data.added.endDate.getTime() / 1000;
    const { title } = data.added;
    console.log(start, end)

    setShowSign(true);
    setShowDialog(true);
    setMined(false);
    
    try {
      const cost = ((end - start) / 60) * rate;
      // const msg = {value: ethers.utils.parseEther(cost.toString())};
      console.log({ title, start, end  })
      let transaction = await contract.createAppointment(title, start, end);

      setShowSign(false);

      await transaction.wait();

      setMined(true);
      setTransactionHash(transaction.hash);
    } catch (problem) {
      console.error(problem);
    }
  };


  const handleSliderChange = (e, newValue) => {
    console.log('slider change', newValue)
    setRate(newValue);
  }
  const saveRate = async () => {
    console.log('save rate', ethers.utils.parseEther(rate.toString()))
    const newRate = await contract.setRate(ethers.utils.parseEther(rate.toString()));
    console.log(newRate);
  }
  const marks = [
    { value: 0.00, label: 'Free', },
    { value: 0.02, label: '0.02 ETH/min', },
    { value: 0.04, label: '0.04 ETH/min', },
    { value: 0.06, label: '0.06 ETH/min', },
    { value: 0.08, label: '0.08 ETH/min', },
    { value: 0.1, label: 'Expensive', },
  ];
  
  const Admin = () => (
    <Box>
      <Typography variant="h3">
        Set Your Minutely Rate
      </Typography>
      <Slider 
        defaultValue={parseInt(rate)}
        step={0.001}
        min={0}
        max={0.1}
        valueLabelDisplay="auto"
        marks={marks}
        onChangeCommitted={handleSliderChange}
      />
      <Button onClick={() => saveRate()} variant="contained">Save Configuration</Button>
    </Box>
  );

  const ConfirmDialog = () => (
    <Dialog open={true}>
      <Typography variant="h3">
        {mined && 'Appointment Confirmed'}
        {!mined && !showSign && 'Confirming Your Appointment...'}
        {!mined && showSign && 'Please Sign to Confirm'}
      </Typography>
      <Box sx={{textAlign: 'left', padding: '0px 20px 20px 20px'}}>
          {mined && (
            <Box>
              Your appointment has been confirmed and is on the blockchain.
              <a target="_blank" href={`https://goerli.etherscan.io/tx/${transactionHash}`}>View on Etherscan</a>
            </Box>
          )}
        {(!mined && !showSign) && (
          <Typography variant="body1" component="p">Please wait while we confirm your appoinment on the blockchain....</Typography>
        )}
        {(!mined && showSign) && (
          <Typography variant="body1" component="p">Please sign the transaction to confirm your appointment.</Typography>
        )}
      </Box>
      <Box style={{textAlign: 'center', paddingBottom: '30px'}}>
        {!mined && <CircularProgress />}
      </Box>
      {mined && (
        <Button onClick={() => {
          setShowDialog(false);
          getData();
        }}
        >Close</Button>
      )}
    </Dialog>
  );

  return (
    <>
      {isAdmin && <Admin />}
      <Paper elevation={16} sx={{ m:4, p:2 }}>
        <Scheduler data={appointments.length ? appointments : schedulerData}>
          <ViewState />
          <EditingState onCommitChanges={data => saveAppointment(data)} />
          <IntegratedEditing />
          <WeekView startDayHour={9} endDayHour={19} />
          <Appointments />
          <AppointmentForm /> 
        </Scheduler>
      </Paper>
      {showDialog && <ConfirmDialog/>}
    </>
  );
};



