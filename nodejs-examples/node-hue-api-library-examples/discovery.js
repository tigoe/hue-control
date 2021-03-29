/*
	node-hue-api discover
	This example searches the LAN for hue hubs, and prints out their basic
	details.
	The example uses the promises interface to node-hue-api.

	created 6 Feb 2015
	modified 31 May 2015
	by Tom Igoe

	Based on the examples in the node-hue-api readme:
	https://github.com/peter-murray/node-hue-api

	to call this from the commandline:
	node discovery.js
*/

var hue = require("node-hue-api"),	// include the node-hue-api library
	HueApi = hue.HueApi;							// make a local instance of HueApi

// print a JSON object nicely:
function displayResult(result) {
   console.log(JSON.stringify(result, null, 2));
}

function displayBridges(hubs) {
	console.log("Hue Hubs Found: ");	// print the list of hubs found
	displayResult(hubs);

}

//----------------------------------
// This is where execution of the script starts
	hue.nupnpSearch()								// start a search on the LAN for hubs
		.then(displayBridges)					// if successful, display the details
		.done();
