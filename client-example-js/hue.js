/*
Hue control in plain JavaScript

Controls brightness of one light on a hue hub. 
You pick which light. Also shows the status of 
all the lights.

created 11 June 2020
modified 19 Feb 2022
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
// a div for responses from the Hue hub:
let responseDiv;
// UI elements in the page:
let slider, onButton, statusButton, newuserButton;

// when the page loads, do this (like setup() in p5.js):
function setup() {
    // Add event listeners to UI elements in the page:
    slider = document.getElementById("bri");
    slider.addEventListener("change", changeLight);

    onButton = document.getElementById("on");
    onButton.addEventListener("click", changeLight);

    statusButton = document.getElementById("lights");
    statusButton.addEventListener("click", getSystemStatus);

    newuserButton = document.getElementById("newuser");
    newuserButton.addEventListener("click", createUser);

    const lightNum = document.getElementById("lightNumber");
    lightNum.addEventListener("change", setLightNumber);

    //set the response div in a global variable for convenience:
    responseDiv = document.getElementById('responseDiv');
}

// gets all the lights, via the endpoint
// GET /api/username/lights
function getSystemStatus() {
    let thisRequest = 'lights';
    sendRequest(thisRequest, 'GET');
}

// set the credentials for the Hue hub:
function setCreds() {
    const addressField = document.getElementById("address");
    address = addressField.value;

    const userField = document.getElementById("username");
    username = userField.value;
    // if there's a valid address, 
    // and no link to the debug page on this document,
    // then create that link:
    if (address && !document.getElementById('debugLink')) {
        // form the debug page URL:
        const debugUrl = 'http://' + address + '/debug/clip.html';
        // make it into an anchor (<a>) element:
        const newLink = document.createElement("a");
        // add the text of the element and the href:
        newLink.innerHTML = "Link to debug page for this hub";
        newLink.href = debugUrl;
        // make it open in a new page:
        newLink.target = "_blank";
        // give it an ID so you can look for it next time
        // this function is called:
        newLink.id = "debugLink";
        // attach it to the address div:
        const addressDiv = document.getElementById("addressDiv");
        addressDiv.appendChild(newLink);
    }
    // print the address and username in the response div:
    responseDiv.innerHTML = 'address: ' + address
        + '<br>username: ' + username;
}

// set the number of the light to be changed:
function setLightNumber() {
    const lightNum = document.getElementById("lightNumber");
    lightNumber = lightNum.value;
}

// create a new user when the hub button is pressed:
function createUser(userid) {
    let devicetype = document.getElementById("devicetype").value;
    // if there is no value for device type, 
    // notify and leave the function:
    if (!devicetype) {
        responseDiv.innerHTML = "please enter devicetype. You can use your own name.";
        return;
    }
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
function changeLight(event) {
    // if it was the on button that called this function:
    if (event.target.id === 'on') {
        // if the button reads "On", turn the light on:
        if (event.target.value == 'On') {
            lightState.on = true;
            // change the button label to off:
            event.target.value = 'Off';
        } else {
            // if the button reads "Off", turn the light off:
            lightState.on = false;
            // change the button label to on
            event.target.value = 'On';
        };
    }
    // if the lightState is on:
    if (lightState.on) {
        // get the slider's value and set the brightness:
        lightState.bri = parseInt(slider.value);
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
    // fill in hub address and username from credentials fields:
    setCreds();
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
        // mode: 'no-cors', // if you need to turn off CORS, use this
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
    responseDiv.innerHTML = data;
   // parseResults(data);
}
// this function is just a stub. It shows how to get
// the results as JSON. If you press the button
// to make a new user, though, it does put the
// new username in the username field.
function parseResults(data) {
    // the results are always a string containing
    // a JSON object or an array
   let JSONData;
    try{
        JSONData = JSON.parse(data);
    } catch (err) {
        responseDiv.innerHTML = "Error: " + err;
    }
    

    // if JSONData is an array, read the first element in it:
    if (Array.isArray(JSONData)) {
        if (JSONData[0].success) {
            console.log(JSONData[0].success.username);
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
            console.log(error);
        }
    } else {
        // this is what we'd get with a lights response.
        // it wouldn't be an array. Print the keys only:
        console.log(Object.keys(JSONData));
    }
}

// listen for the HTML page to load fully:
document.addEventListener('DOMContentLoaded', setup);