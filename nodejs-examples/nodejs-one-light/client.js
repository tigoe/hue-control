/*
This script function makes an HTTP PUT call to change the properties of the lights:
HTTP PUT http://your.hue.hub.address/api/username/lights/lightNumber/state/
and the body has the light state:
{
  on: true/false,
  bri: brightness
}

It's called from the command line like so:

node client.js brightness

where brightness is a value from 0 to 254.

created 28 Mar 2021
by Tom Igoe

*/

// include the node-fetch module:
const fetch = require('node-fetch');

// IP address of the Hue hub:
let address = '192.168.1.121';
// username on the hub:
let username = 'xhdeYM3MWU5CHb1frSAKmb4RjLu-XgTHBSMcReyt';
// full URL for request:
let requestUrl = 'http://' + address + '/api/' + username + '/';
// light number that you want to change:
let lightNumber = 22;
// JSON with the state of the light:
let lightState = {
  on: true,
  bri: 0
};

// gets all the lights, via the endpoint
// GET /api/username/lights

function changeLight(brightness) {
  if (!address || !username) {
    console.log('Please enter an address and username');
    return;
  }

  console.log(brightness);
  // if the button reads "On", turn the light on:
  if (brightness > 0) {
    lightState.on = true;
  } else {
    // if the button reads "Off", turn the light off:
    lightState.on = false;
    // delete the bri property so as not to cause an 
    // error in the hub's response:
    delete lightState.bri;
  };

  // get the slider's value and set the brightness:
  lightState.bri = brightness;

  // send the request:
  let thisRequest = 'lights/' + lightNumber + '/state/';
  sendRequest(thisRequest, 'PUT', lightState);
}

// this function makes the actual request using fetch():
function sendRequest(request, requestMethod, data) {
  // add the requestURL to the front of the request:
  url = requestUrl + request;
  // set the parameters:
  let params = {
    method: requestMethod, // GET, POST, PUT, DELETE, etc.
    //mode: 'no-cors', // if you need to turn off CORS, use this
    headers: {    // any HTTP headers you want can go here
      'accept': 'application/json'
    }
  }
  // if it's not a GET request and there's data to send,
  // add it:
  if (requestMethod !== 'GET' || data) {
    params.body = JSON.stringify(data); // body data type must match "Content-Type" header
  }
  // make the request:
  fetch(url, params)
    .then(response => response.json())  // convert response to JSON
    .then(data => console.log(data))   // get the body of the response
    .catch(error => console.log(error));// if there is an error
}

// get the state of all the lights:
sendRequest('lights', 'GET');

// process.argv[2] is the third word on the command line argument, 
// e.g. "node client.js 254"
let brightString = process.argv[2];
// it's a string, so convert it to an int:
let brightValue = parseInt(brightString);
// change one using the command line argument:
changeLight(brightValue);
