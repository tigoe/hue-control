/*
Hue control in plain JavaScript for Max/MSP

Controls brightness of one light on a hue hub. 
You pick which light. Also shows the status of 
all the lights.

Note: since Max 8 uses JS 1.6, this script uses
XMLHttpRequest instead of fetch or more modern
methods. 

created 4 May 2022
by Tom Igoe
*/

autowatch = 1;

var address = '';       // IP address of the Hue hub
var username = '';      // username on the hub
var requestUrl = 'http://ipaddress/api/';  // generic hub URL
var lightNumber = 2;    // number of the light to control
var lightState = {      // JSON with the state of the light
    on: true,
    bri: 0
};

// gets all the lights, via the endpoint
// GET /api/username/lights
function getSystemStatus() {
    var thisRequest = 'lights';
    sendRequest(thisRequest, 'GET');
}

// set the hub IP address:
function setAddress(addr) {
    address = addr;
}
// set the username for making requests:
function setUsername(usr) {
    username = usr;
}

// set the number of the light to be changed:
function setLightNumber(lightNum) {
    lightNumber = lightNum;
}

// create a new user when the hub button is pressed:
function createUser(userid) {
    var devicetype = userid; //document.getElementById('devicetype').value;
    // make a new user request with the devicetype
    var data = { 'devicetype': devicetype };
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
function changeLight(on, bri) {
    // parameters: 
    // (on (true or false)), bri (brightness)
    lightState.on = state;

    // if the lightState is on:
    if (lightState.on) {
        // get the slider's value and set the brightness:
        lightState.bri = bri;
    } else {
        // if lightState is off, 
        // delete the bri property so as not to cause an 
        // error in the hub's response:
        delete lightState.bri;
    }

    // send the request:
    var thisRequest = 'lights/' + lightNumber + '/state/';
    sendRequest(thisRequest, 'PUT', lightState);
}

// this function makes the actual request using fetch():
function sendRequest(request, requestMethod, data) {
    // parameters:
    // request (the RESTful endpoint)
    // requestMethod (GET, PUT, POST, DELETE)
    // data (the JSON to go with a PUT or POST)
    if (!address) {
        post('please set address');
        post();
        return;
    }
    if (!username) {
        post('please set username');
        post();
        return;
    }
    // set the url for this request:
    var url = requestUrl;

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
            getResponse('please set the app username');
            return;
        } else {
            // otherwise add the username to the request:
            url += username + '/';
            // add the rest of the request:
            url += request;
        }
    }

    // if it's not a GET request and there's data to send,
    // add it:
    if (requestMethod !== 'GET' || data) {
        params.body = JSON.stringify(data);
    }
    // make the request:
    httpRequest = new XMLhttpRequestuest();
    // set request header:
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    // set handlers for response and error:
    httpRequest.addEventListener('load', getResponse);
    httpRequest.addEventListener('error', getResponse);
    // start request:
    httpRequest.open(requestMethod, url);
    // send the body:
    httpRequest.send(body);
}

// function to call when you've got something to display:
function getResponse(data) {
    post(data);
    post();
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
    var JSONData = JSON.parse(data);

    // if JSONData is an array, read the first element in it:
    if (Array.isArray(JSONData)) {
        if (JSONData[0].success) {
            post(JSONData[0].success.username);
            post();
        }
        // how to handle an error result:
        if (JSONData[0].error) {
            // get the error result
            var error = JSONData[0].error;
            post(error);
            post();
        }
    } else {
        // this is what we'd get with a lights response.
        // it wouldn't be an array. Print the keys only:
        post(Object.keys(JSONData));
        post();
    }
}