/*
	node-hue-api display users example
	This example contacts a hue hub and prints out the list of registered users.
	The example uses the promises interface to node-hue-api.

	created 6 Feb 2015
	modified 16 Feb 2015
	by Tom Igoe

	Based on the examples in the node-hue-api readme:
	https://github.com/peter-murray/node-hue-api

	to call this from the commandline:
	node displayusers.js address username

	(username must be a previously registered user)
*/


var hue = require("node-hue-api"),			// include the node-hue-api library
	HueApi = hue.HueApi,							// make a local instance of HueApi
	hub; 												// will hold the hub info when you instantiate it

var username = process.argv[3],				// your app's username from the command line
	address = process.argv[2];					// hub IP address from command line

// print a JSON object nicely:
var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

// print a JSON object nicely:
var displayAdd = function(result) {
    console.log(JSON.stringify(result, null, 2));
    console.log('successfully added\n');
};

// print a JSON object nicely:
var displayDelete = function(result) {
    console.log(JSON.stringify(result, null, 2));
    console.log('successfully deleted\n');
};


// print a JSON object nicely:
var displayError = function(error) {
    console.log(JSON.stringify(error, null, 2));
    console.log('I could not execute your command. I feel miserable. Hug me.\n')
};

// display all registered users:
function displayUsers() {
	hub.registeredUsers()
		.then(displayResult)
		.fail(displayError)
		.done();
}

// add a new user:
function addUser(address, newUserName, userDescription) {
	hub.registerUser(address, newUserName, userDescription)
	   .then(displayAdd)
	   .fail(displayError)
	   .done();
}

// remove a user:
function removeUser(username) {
	hub.deleteUser(username)
	   .then(displayDelete)
	   .fail(displayError)
	   .done();
}

//----------------------------------
// This is where execution of the script starts

if (!username) {									// if no command line username,
	username = 'atleasttenletters';			// make one up
}

if (address) {										// if there's a command line address,
	hub = new HueApi(address, username);	// instantiate the hub
	displayUsers();								// get the list of users for that hub
	// uncomment the next line if you want to add the username as a new user:
	// addUser(address, username, username + ' developer account');
	// uncomment the next line if you want to delete the username:
	// removeUser(address, username);

} else {												// if no address is given, quit.
	console.log("You need to enter the hub address.\n\n");
	process.exit(0);
}
