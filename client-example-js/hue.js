/*
Hue control in plain JavaScript

Controls brightness of one light on a hue hub. 
You pick which light. Also shows the status of 
all the lights.

created 11 June 2020
modified 8 Mar 2021
by Tom Igoe
*/

let address = '';       // IP address of the Hue hub
let requestUrl;         // full URL for request      
let username = '';      // username on the hub
let lightNumber = 2;    // number of the light to control
let lightState = {      // JSON with the state of the light
    on: true,
    bri: 0
};
// a div for responses from the Hue hub
let responseDiv;
// UI elements in the page:
let slider, onButton, credButton, statusButton;

// when the page loads, do this (like setup() in p5.js):
function setup() {
    // set initial field values:
    document.getElementById("address").value = address;
    document.getElementById("username").value = username;

    // Add event listeners
    credButton = document.getElementById("creds");
    credButton.addEventListener("click", setCreds, false);

    slider = document.getElementById("bri");
    slider.addEventListener("change", changeLight, false);

    onButton = document.getElementById("on");
    onButton.addEventListener("click", changeLight, false);

    statusButton = document.getElementById("lights");
    statusButton.addEventListener("click", getSystemStatus, false);

    const lightNum = document.getElementById("lightNumber");
    lightNum.addEventListener("change", setLightNumber, false);

    //set the response div in a global variable for convenience:
    responseDiv = document.getElementById('responseDiv');

    // if no address or username, ask for it:
    if (!address || !username) {
        responseDiv.innerHTML = 'please set address and username';
        // if address and username are filled in, get state of system:
    } else {
        // get the status of all the lights:
        getSystemStatus();
    }
}

// gets all the lights, via the endpoint
// GET /api/username/lights

function getSystemStatus() {
    requestUrl = 'http://' + address + '/api/' + username + '/';
    sendRequest('lights', 'GET');
}


// set the credentials for the Hue hub
// (event listener for the Set Credentials button):
function setCreds(evt) {
    const addressField = document.getElementById("address");
    address = addressField.value;

    const userField = document.getElementById("username");
    username = userField.value;

    requestUrl = 'http://' + address + '/api/' + username + '/';
    responseDiv.innerHTML = 'address: ' + address
        + '<br>username: ' + username;
}

function setLightNumber() {
    const lightNum = document.getElementById("lightNumber");
    lightNumber = lightNum.value;
}

/*
this function makes an HTTP PUT call to change the properties of the lights:
HTTP PUT http://your.hue.hub.address/api/username/lights/lightNumber/state/
and the body has the light state:
{
  on: true/false,
  bri: brightness
}
*/
function changeLight(evt) {
    if (!address || !username) {
        responseDiv.innerHTML = 'Please enter an address and username';
        return;
    }
    // if it was the on button:
    if (evt.target.id === 'on') {
        // if the button reads "On", turn the light on:
        if (evt.target.value == 'On') {
            lightState.on = true;
            // change the button label to off:
            evt.target.value = 'Off';
        } else {
            // if the button reads "Off", turn the light off:
            lightState.on = false;
            // change the button label to on
            evt.target.value = 'On';
        };
    }
    if (lightState.on) {
        // get the slider's value and set the brightness:
        lightState.bri = parseInt(slider.value);
    } else {
        // delete the bri property so as not to cause an 
        // error in the hub's response:
        delete lightState.bri;
    }

    // send the request:
    let thisRequest = 'lights/' + lightNumber + '/state/';
    sendRequest(thisRequest, 'PUT', lightState);
}

// this function makes the actual request using fetch():
function sendRequest(request, verb, data) {
    // add the requestURL to the front of the request:
    url = requestUrl + request;
    // set the parameters:
    let params = {
        method: verb, // GET, POST, PUT, DELETE, etc.
        //mode: 'no-cors', // if you need to turn off CORS, use this
        headers: {    // any HTTP headers you want can go here
            'accept': 'application/json'
        }
    }
    // if it's not a GET request and there's data to send,
    // add it:
    if (verb !== 'GET' || data) {
        params.body = JSON.stringify(data); // body data type must match "Content-Type" header
    }
    // make the request:
    fetch(url, params)
        .then(response => response.json())  // convert response to JSON
        .then(data => getResponse(JSON.stringify(data)))   // get the body of the response
        .catch(error => getResponse(error));// if there is an error
}

// function to call when you've got something to display:
function getResponse(data) {
    responseDiv.innerHTML = data;
}

// listen for the HTML page to load fully:
document.addEventListener('DOMContentLoaded', setup);