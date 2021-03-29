/*
node-hue-api fade light example
This example controls a hue hub using incoming HTTP calls via express.js.
The example uses the promises interface to node-hue-api.

expects the following HTTP GET request:
/setLights/lightnumber/level/transitionTime

transitionTime is in 10ths of a second

created 14 April 2017
by Tom Igoe and Woraya Boonyapanachoti

Based on the examples in the node-hue-api readme:
https://github.com/peter-murray/node-hue-api

*/


var hue = require("node-hue-api");   	// include the node-hue-api library
var HueApi = hue.HueApi;							// make a local instance of HueApi
var hub; 															// will hold the hub info when you instantiate it
var lightState = hue.lightState;

var address = '192.168.0.1';								// enter your IP address here
var username = 'myreallylongusername';		  // your app's username

var express = require('express');           // include the express library
var server = express();					            // create a server using express

// set a light's state using parameters given:
function setLight(request, response) {
	var parameters = request.params;		// get request parameters
	var thisLight = parameters.light;		// get light number from request
	var thisBri = parameters.level;			// get level
	var thisTime = parameters.time;			// get time

	// create a lightstate object:
	var state = lightState.create()
		.brightness(thisBri)
		.transitionTime(thisTime)
		.on();

		// function to send the HTML response:
	function sendResponse(result) {
		response.write(' parameters: '+ JSON.stringify(parameters));
		response.end('<br>cue sent: ' + result);
	}

	// use it to set the state of a light on the hub:
	hub.setLightState(thisLight, state)
		.done(sendResponse);
}

// instantiate the hub:
hub = new HueApi(address, username);
server.listen(8080);                        // listen for HTTP
server.use('/',express.static('public'));   // set a static file directory
server.get('/setLight/:light/:level/:time', setLight)	// path for lights
