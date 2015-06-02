# Server-Side JavaScript Programming for the Philips Hue

Since the Hue API is made up of HTTP calls, you could control it from [node.js](http://www.nodejs.org) directly just using the HTTPClient class. However, [Peter Murray](https://github.com/peter-murray) has written a nice library for node.js, [node-hue-api](https://github.com/peter-murray/node-hue-api), to simplify the process. This document, and [these examples](server-examples), explain how to use it.

The node-hue-api documentation is excellent, and this is not an attempt to replace it. This document includes only a few tips to get started with the library.

To use this tutorial and examples, you'll need to have node.js installed. You'll also need a Philips Hue, of course. One of the examples, fadeLights.js, uses a microcontroller attached to a serial port as well. For that example, you'll use the [node-serial](https://github.com/voodootikigod/node-serialport) library.

## Node-Hue-API's Promises

The node-hue-api library uses JavaScript promises. For many of the functions, this can be simpler than using callbacks, as it lets you chain events together. For example, a typical command call in this library might look like this:

```js

    	hueApi.command(parameters)
    		.then(successFunction)
			.error(errorFunction)
			.done(finalFunction);

```

The first line runs the command. When it returns, the second line calls a function, `successFunction()`. If there's an error in the original function, `errorFunction()` is called. When either the success or error functions return, `finalFunction()` is called. You can use traditional callbacks with this library if you don't want to use the promise API.

## General Configuration and Finding Hubs

For most programs using this library, you'll make an instance of the API, then call `new HueAPI()` for each hub you're addressing. You'll need the hub's IP address and the name of a registered user (device) on the hub as well:

```js
    var hue = require("node-hue-api"),
		HueApi = hue.HueApi,
		hub = new HueApi(address, username);
```

To discover hubs on your network, use the `nupnpSearch()` command:

```js
    	hue.nupnpSearch()
		.then(displayBridges)
		.done();
```
You'll get a result that's a list of all the hubs on your network like so:

```js
    [
      {
        "id": "001788fffe0a1745",
        "ipaddress": "192.168.0.4"
      }
    ]
```
The [discovery.js script](server-examples/discovery.js) is a full working example of how to call `nupnpSearch()`.

## Adding and Deleting Users and other Housekeeping Commands

The node-hue-api library also offers an interface for registering new users on the hub, and for deleting users. The [displayUsers.js](server-examples/displayUsers.js) example shows you how to add and delete users. Unless you're making a full turnkey application, though, you might find it easier to register users through the debug clip interface on your hub.

In the server examples directory, you'll find a script called [runcommand.js](server-examples/runcommand.js). This script will let you test out many of the API commands. You'll need to pass the script the IP address and username and the command you want to run like so:

```js
	node runcommand.js ipaddress username command
```

Test it out by asking for your hub's config:

```js
	node runcommand.js ipaddress username config
```

You'll get a reply like this:

```js
	{
	  "name": "Home hue hub",
	  "zigbeechannel": 25,
	  "mac": "00:17:88:0a:17:45",
	  "dhcp": true,
	  "ipaddress": "192.168.0.4",
	  "netmask": "255.255.255.0",
	  "gateway": "192.168.0.1",
	  "proxyaddress": "none",
	  "proxyport": 0,
	  "UTC": "2015-05-31T13:00:52",
	  "localtime": "2015-05-31T09:00:52",
	  "timezone": "America/New_York",
	  "whitelist": {
	    "yj9eIF0ygqrq4URJ": {
	      "last use date": "2015-05-31T13:00:52",
	      "create date": "2015-02-07T14:11:28",
	      "name": "Hue#Thomas's iPad"
	    }
	  },
	  "swversion": "01023599",
	  "apiversion": "1.7.0",
	  "swupdate": {
	    "updatestate": 0,
	    "checkforupdate": false,
	    "devicetypes": {
	      "bridge": false,
	      "lights": [],
	      "sensors": []
	    },
	    "url": "",
	    "text": "",
	    "notify": false
	  },
	  "linkbutton": false,
	  "portalservices": true,
	  "portalconnection": "connected",
	  "portalstate": {
	    "signedon": true,
	    "incoming": true,
	    "outgoing": true,
	    "communication": "disconnected"
	  }
	}
```

You can use this script with any of the following commands:

* getDescription - to get the hub's description
* config - get the hub's configuration
* getFullState - to get the full state of the hub
* registeredUsers - list all registered users
* lights - list all the lights on a hub
* scenes - list all the senes on a hub
* groups - list all the light groups on a hub
* schedules - list all the schedules on a hub
* searchForNewLights - search for new unpaired lights in range of the hub
* newLights - pair any unpaired lights in range after searchForNewLights\n

Details of all of these commands can be found in the [node-hue-api documentation](https://github.com/peter-murray/node-hue-api).

## Controlling Lights

 The main interface for controlling lights in the node-hue-api library is the lightState object. This object offers all of the Hue light API elements, and adds extra controls for things like seting color using RGB, setting transition times, and more. LightStates are not stored on the hub, but in your code, so you can keep several states in different variables and assign them to different lights or light groups using the `setLightState()` command. You can also chain elements of a lightstate, or re-assign just one element on the fly. For example:

```js
    // set a light state of bright red, 100ms fade time:
    var state = lightState.create()
      .rgb(255,0,0)
      .brightness(100)
      .transitionTime(100)
      .on();

    // use it to set the state of a light on the hub:
    hub.setLightState(1, state)
      .then(displayResult)
      .done();

    // then change the lightState to blue:
    state.rgb(0,0,255);

    // and use it to set a different light:
    hub.setLightState(2, state)
      .then(displayResult)
      .done();
```

The [fadeLight.js](server-examples/fadeLight.js) example shows how to set light states using data coming into node.js from a serial port. It assumes you've got some other device attached to the serial port that will send a numeric string, comma-separated, as follows:

	lightNumber, red, green, blue, brightness, transitionTime\n

You can use an Arduino or other microcontroller to do this, or you can connect to your computer via Bluetooth serial with a mobile phone or tablet, or any other device you can program to send a serial string.  It assumes your lights are all color lights, not Hue Luxes or GE Links. To run this script, pass it the IP address, username, and serial port when you call it like so:

	node fadeLights.js address username portName

Then send it serial strings as shown above. Make sure you're also sending the newline at the end, or the `port.on('data')` event won't get called.

## Controlling Lights Directly

If you don't want to use lightStates, you can control lights directly by sending in the JSON for the light's state as defined in the [Hue API](http://www.developers.meethue.com/documentation/lights-api#14_get_light_attributes_and_state). To do this, just assemble your own JSON and pass it to `setLightState()` like so:

```js
	 var body = {"on": true};

	 api.setLightState(2, body)
   		.then(successFunction)
   		.fail(failureFunction)
   		.done();
```

The JSON you're sending above is just the body of a PUT request for `http://my.hub.ip.address/lights/2/state`. So you can enter as much or as little about the state as you wish.

## Groups, Scenes, and Schedules

The node-hue-api library also gives you tools for controlling groups of lights, setting scenes, and setting schedules. Details can be found in the library documentation. Here's a brief overview:

### Groups

Groups allow you to set all the lights in a group to the same state. It makes it convenient to control lots of lights at once, as long as you don't need variation between them. The group lightState commands are similar to the individual lightState commands.

### Scenes

Scenes allow you to control multiple lights, each with their own individual lightStates. You need to set each light's state individually, but once lights are assigned to a scene, you can control them all at once using the scene.

### Schedules

Schedules allow you to set a time at which given light states will be triggered. A schedule can change a single light, a group, or a scene. This is what a schedule's JSON looks like:

```js
	{
	  "name": "My Schedule",
	  "description": "Do something",
	  "command": {
	    "address": "/api/myusername/lights/2/state",
	    "body": {
	      "on": true,
	      "bri": 53
	    },
	    "method": "PUT"
	  },
	  "time": "2015-05-31T18:30:00",
	  "id": 1
	}
```

By changing the body of the schedule and the address, you'd change whether you control a light, a group, or a scene. Schedules only allow you to control one group, scene, or light at a time.

Although these examples don't show how to build web interfaces with node-hue-api, you can combine it with express.js or your favorite server API. Since you can also [control the Hue directly from the client](client-example), this is best reserved for when there are other functions needed that the hue hub server itself can't fulfill.
