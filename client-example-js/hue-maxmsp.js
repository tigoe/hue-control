/*
Hue control in plain JavaScript

Controls brightness of one light on a hue hub. 
You pick which light. Also shows the status of 
all the lights.

created 4 May 2022
by Tom Igoe
*/

let address = '';       // IP address of the Hue hub
let username = '';      // username on the hub
let requestUrl = 'http://ipaddress/api/';  // generic hub URL
let lightNumber = 2;    // number of the light to control
let lightState = {      // JSON with the state of the light
    on: true,
    bri: 0
};

// gets all the lights, via the endpoint
// GET /api/username/lights
function getSystemStatus() {
    let thisRequest = 'lights';
    sendRequest(thisRequest, 'GET');
}

function setAddress(addr) {
    address = addr;
}
function setUsername(usr) {
    username = usr;
}

// set the number of the light to be changed:
function setLightNumber(lightNum) {
    lightNumber = lightNum;
}

// create a new user when the hub button is pressed:
function createUser(userid) {
    let devicetype = userid; //document.getElementById("devicetype").value;
    // make a new user request with the devicetype
    let data = { "devicetype": devicetype };
    sendRequest('newuser', 'POST', data);
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

// TODO:
function changeLight(state, value) {
    // parameters: 
    // (state (on or off)), value (brightness)
    if (state == 'on') {
        lightState.on = true;
    }
    // if the lightState is on:
    if (lightState.on) {
        // get the slider's value and set the brightness:
        lightState.bri = value;
    } else {
        // if lightState is off, 
        // delete the bri property so as not to cause an 
        // error in the hub's response:
        delete lightState.bri;
    }

    // send the request:
    let thisRequest = 'lights/' + lightNumber + '/state/';
    sendRequest(thisRequest, 'PUT', lightState);
}

// this function makes the actual request using fetch():
function sendRequest(request, requestMethod, data) {
  // parameters:
  // request (the RESTful endpoint)
  // requestMethod (GET, PUT, POST, DELETE)
  // data (the JSON to go with a PUT or POST)
    if (!address) {
        post("please set address");
        return;
    }
    if (!username) {
        post("please set username");
        return;
    }
    // set the url for this request:
    let url = requestUrl;

    // if there's no address set,
    // let the user know, and stop this function:
    if (!address) {
        getResponse("please set the hub's IP address");
        return;
    } else {
        // insert IP address into the url:
        url = url.replace('ipaddress', address);
    }
    // for any request but the newuser one, add the username:
    if (request !== 'newuser') {
        // if there's no username, let them know and stop:
        if (!username) {
            getResponse("please set the app username");
            return;
        } else {
            // otherwise add the username to the request:
            url += username + '/';
            // add the rest of the request:
            url += request;
        }
    }

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
        params.body = JSON.stringify(data);
    }
    // make the request:
    fetch(url, params)
        .then(response => response.json())  // convert response to JSON
        .then(data => getResponse(JSON.stringify(data)))   // get the body of the response
        .catch(error => getResponse(error));// if there is an error
}

// function to call when you've got something to display:
function getResponse(data) {
    post(data);
    // responseDiv.innerHTML = data;
    parseResults(data);
}
// this function is just a stub. It shows how to get
// the results as JSON. If you press the button
// to make a new user, though, it does put the
// new username in the username field.
function parseResults(data) {
    // the results are always a string containing
    // a JSON object or an array
    let JSONData = JSON.parse(data);

    // if JSONData is an array, read the first element in it:
    if (Array.isArray(JSONData)) {
        if (JSONData[0].success) {
            post(JSONData[0].success.username);
            const userField = document.getElementById("username");
            // if there's not already a userfield value,
            // insert the one just returned from the hub:
            if (!userField.value) {
                userField.value = JSONData[0].success.username;
            }
        }
        // how to handle an error result:
        if (JSONData[0].error) {
            // get the error result
            let error = JSONData[0].error;
            post(error);
        }
    } else {
        // this is what we'd get with a lights response.
        // it wouldn't be an array. Print the keys only:
        post(Object.keys(JSONData));
    }
}