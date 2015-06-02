/*
	node-hue-api fade light example
	This example controls a hue hub using incoming serial data.
	The example uses the promises interface to node-hue-api.

	expects the following serial string:
	lightnumber, red, green, blue, transitionTime\n

	created 31 May 2015
	by Tom Igoe

	Based on the examples in the node-hue-api readme:
	https://github.com/peter-murray/node-hue-api

	to call this from the commandline:
	node fadeLight.js address username portname

	(username must be a previously registered user)
*/


var hue = require("node-hue-api"),	// include the node-hue-api library
	HueApi = hue.HueApi,							// make a local instance of HueApi
	hub, 															// will hold the hub info when you instantiate it
	lightState = hue.lightState;


var serialport = require("serialport"),	// include the serialport library
	SerialPort  = serialport.SerialPort;	// make a local instance of it

var address = process.argv[2],			// hub IP address from command line
	username = process.argv[3],				// your app's username from the command line
	portName = process.argv[4];				// serial port from the command line


// print a JSON object nicely:
var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

// set a light's state using parameters given:
function setLight(thisLight, thisColor, thisBri, thisTime) {
	// create a lightstate object:
	var state = lightState.create()
		.rgb(thisColor)
		.brightness(thisBri)
		.transitionTime(thisTime)
		.on();

	// use it to set the state of a light on the hub:
	 hub.setLightState(thisLight, state)
     .then(displayResult)
     .done();
}

//----------------------------------
// The serial port listening functions

function openPort() {
	console.log('port open');
	console.log('baud rate: ' + myPort.options.baudRate);
}

function closePort() {
	console.log('port closed');
}

function serialError(error) {
	console.log('there was an error with the serial port: ' + error);
	myPort.close();
}

function readData(data) {
	// read the result:
	var result = data.split(',');
	var lightNumber = result[0];
	var color = [result[1], result[2], result[3]];
	var bri = result[4];
	var time = result[5];

	// set the light with the data:
	setLight(lightNumber, color, bri, time);
}

//----------------------------------
// This is where execution of the script starts

var missingArg = false;

if (!username) {	   // if no command line username given, quit
	console.log("You need to enter the username .\n\n");
	missingArg = true;
}

if (!address) {			 // if no address given, quit
	console.log("You need to enter the hub address.\n\n");
	missingArg = true;
}

if (!portName) {		 // if no serial port given, quit.
	console.log("You need to enter the serial port name.\n\n");
	missingArg = true;
}

// if you're missing any of the command line arguments, quit:
if (missingArg) {
	process.exit(0);
}

// instantiate the hub:
hub = new HueApi(address, username);

// open the serial port. The portname comes from the command line:
var myPort = new SerialPort(portName, {
	baudRate: 9600,
	// look for return and newline at the end of each data packet:
	parser: serialport.parsers.readline('\n')
});

// set up serial port listeners:
myPort.on('open', openPort);		// called when the serial port opens
myPort.on('close', closePort);	// called when the serial port closes
myPort.on('data', readData);		// called when there's new incoming serial data
myPort.on('error', serialError);// called when there's an error with the serial port
