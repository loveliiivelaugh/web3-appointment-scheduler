const express = require("express");
const bodyParser = require("body-parser");

const accountSid = 'YOURSID';
const authToken = 'YOURTOKEN';
const fromPhone = '+1TWILIOPHONE';
const toPhone = '+1YOURPHONE';

const app = express();
const PORT = 3100;

// this application will receive JSON data
app.use(bodyParser.json());

// start the server on port 3100
app.listen(PORT, () => console.log(`Running on port ${PORT}`));

// process a GET request to http://localhost:3100/hello
app.get("/hello", (request, response) => {
  console.log(request.body);
  response.send("hi!");
});

// set up twilio client
const client = require('twilio')(accountSid, authToken);

app.post("/webhook", (request, response) => {
  console.log(request.body);

  const valid = isValidSignature(request);
  if (!valid) res.status(401).send("Unauthorized");

  const message = "webhook post message received";
  response.send(message);

  const { fromAddress, value, hash } = request.body.activity[0];
  const message = `💰🚀 ${fromAddress} paid you ${value} ETH. https://goerli.etherscan.io/tx/${hash} 💰🚀`;
});

// Validating Signature helperfunction
function isValidSignature(request) {    
  const token = 'Auth token provided by Alchemy on the Webhook setup page';
  const headers = request.headers;
  const signature = headers['x-alchemy-signature']; // Lowercase for NodeJS
  const body = request.body;    
  const hmac = crypto.createHmac('sha256', token) // Create a HMAC SHA256 hash using the auth token
  hmac.update(JSON.stringify(body), 'utf8') // Update the token hash with the request body using utf8
  const digest = hmac.digest('hex');     
  return (signature === digest); // If signature equals your computed hash, return true
}