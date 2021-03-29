/*
	node-hue-api run command example
	This example contacts a hue hub and runs a command you give it
	from the command line, if it's a valid command.
	This won't work with all the commands in the API, but it will handle
	all the commands that require no parameters, e.g.
	config(), lights(), newLights(), registeredUsers(),
	scenes(), groups(), schedules().
	The example uses the promises interface to node-hue-api.

	created 6 Feb 2015
	modified 31 May 2015
	by Tom Igoe

	Based on the examples in the node-hue-api readme:
	https://github.com/peter-murray/node-hue-api

	to call this from the commandline:
	node runcommand.js address username command

	(username must be a previously registered user, and command
	must be a valid command in the node-hue-api API.)
*/


var hue = require("node-hue-api"),	// include the node-hue-api library
	HueApi = hue.HueApi,							// make a local instance of HueApi
	hub; 															// the hub instance

var address = process.argv[2],			// hub IP address from command line
	username = process.argv[3],				// your app's username from the command line
	command = process.argv[4];				// the command you want to run from the API

// print a JSON object nicely:
var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

// check whether a command is part of the API, and run it:
function doCommand(cmd) {
	if (hub[cmd] instanceof Function) {	// if the param string cmd
																			// is a function in the API
		hub[cmd]()												// then run it
		.then(displayResult)							// and display the result
		.done();
	}
}

//----------------------------------
// This is where execution of the script starts

// if any of the command line arguments (argv) is 'help':
if (process.argv.indexOf('help') > -1) {
	var help = '\n\nrunCommand\n' +
				'This script executes many of the node-hue-api commands\n' +
				'It should work for every command that has no arguments.\n' +
				'That includes:\n' +
				'* getDescription - to get the hub\'s description\n' +
				'* config - get the hub\'s configuration\n' +
				'* getFullState - to get the full state of the hub\n' +
				'* registeredUsers - list all registered users\n' +
				'* lights - list all the lights on a hub\n' +
				'* scenes - list all the senes on a hub\n' +
				'* groups - list all the light groups on a hub\n' +
				'* schedules - list all the schedules on a hub\n' +
				'* searchForNewLights - search for new unpaired lights in range of the hub\n' +
				'* newLights - pair any unpaired lights in range after searchForNewLights\n\n' +
				'This script is intended for diagnostic purposes only. For more info, see\n' +
				' the node-hue-api documentation at\n' +  'https://github.com/peter-murray/node-hue-api\n\n';
	console.log( help);
	return;	}


if (!username) {									// if no command line username,
	username = 'atleasttenletters';			// make one up
}

if (address) {													// if there's a command line address,
	hub = new HueApi(address, username);	// instantiate the hub
	doCommand(command);										// run the command from this hub
} else {																// if not, quit.
	console.log("You need to enter the hub address.");
	console.log("For help, type node runcommand help\n\n");
	process.exit(0);
}
