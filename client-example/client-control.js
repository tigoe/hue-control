var url, username, address,
  lightsDiv,
  height = 10;

function setup() {
  var addressLabel, nameLabel, connectButton;
  noCanvas();
  // set up the address and username boxes:
  address = createInput();
  addressLabel = createSpan("IP address:");
  addressLabel.position(10,10);
  address.position(100, 10);
  address.attribute('type', 'text');
  userName = createInput();
  nameLabel = createSpan("user name:");
  nameLabel.position(10,40);
  userName.position(100, 40);
  userName.attribute('type', 'text');

  // set up the connect button:
  connectButton = createButton("connect");
  connectButton.position(100, 70);
  connectButton.mouseClicked(connect);
}

/*
this function makes the HTTP GET call
to get the light data
*/
function connect() {
  lightsDiv = null;     // clear the lights div on reconnect
  height = 100;
  url = "http://" + address.value() + '/api/' + userName.value() + '/lights/';
  httpGet(url, getLights);
}

/*
this function uses the response from the hub
to creat a new div for the UI elements
*/
function getLights(result) {
  var lights = JSON.parse(result);			    // parse the HTTP response
  for (thisLight in lights) {			          // iterate over each light in the response
    lightsDiv = createDiv();		        // create a div
    lightsDiv.id(thisLight);				        // name it
    lightsDiv.position(10, height);	        // position it
    lightsDiv.html(lights[thisLight].name);	// set the HTML in it

    // create the controls inside it. createControls() returns the
    // height of the div that it creates, so you can use its result
    // to position the next div:
    var divHeight = createControl(lights[thisLight], lightsDiv);
    height += divHeight + 20;				         // increment height for the next div
  }
}

/*
this function creates UI controls from the lights data
returned by the hub
*/
function createControl(thisLight, thisDiv) {
  var state = thisLight.state;		// state of this light
  var myLabel, myInput,           // each control will get a label and input
  x = 0,                        // and an x-y position
  y = 10;

  for (property in state) {     // iterate over the properties in the state object
    myInput = null;             // clear myInput from previous control
    switch (property) {         // handle the cases you care about
      case 'on':
      myInput = createInput();  // an input for the on property
      myInput.attribute('type', 'checkbox');    // make this input a checkbox
      myInput.attribute('checked', state.on);	  // is called 'checked'
      myInput.mouseClicked(changeProperty); // set the mouseClicked callback
      x = 120;      // the on checkbox has a special position
      y = 0;        // and it sits at the top of the div
      break;
      case 'bri':
      myInput = createSlider(0, 254, state.bri);	// a slider for brightness
      myInput.mouseReleased(changeProperty); // set the mouseClicked callback
      x = 10;       // all the other inputs start at the left edge
      break;
      case 'hue':
      myInput = createSlider(0, 65535,state.hue);	// a slider for hue
      myInput.mouseReleased(changeProperty); // set the mouseClicked callback
      break;
      case 'sat':
      myInput = createSlider(0, 254,state.sat);		// a slider for saturation
      myInput.mouseReleased(changeProperty); // set the mouseClicked callback
      break;
      case 'ct':
      myInput = createSlider(153, 500,state.ct);	// a slider for color temp
      myInput.mouseReleased(changeProperty); // set the mouseClicked callback
      break;
      case 'colormode':
      myInput = createSpan(state.colormode);	// a label for colormode
      break;
      case 'reachable':
      myInput = createSpan(state.reachable);	// a label for reachable
      break;
    }

    // you only created inputs for the fields in the switch statement
    // above, so this conditional filters for those:
    if (myInput) {
      myLabel = createSpan(property);     // create a label span
      myInput.id(property);               // give the input an id
      thisDiv.child(myLabel);		    // add the label to the light's div
      thisDiv.child(myInput);		    // add the input to the light's div
      myLabel.position(x, y);       // position the label
      myInput.position(x + 100, y);  // position the input
      y += 20;                      // increment the y position
    }
  }
  return y;         // return the y position so the calling function
  // knows how big this div is vertically
}


/*
this function uses the UI elements to change
the properties of the lights
*/
function changeProperty() {
  var thisControl = event.target.id;				// what did you click on?
  var thisLight = event.target.parentNode.id;	// get the parent, for the light number
  var value = event.target.value;					// get the value

  // make a new payload:
  var payload = {};
  // put the value for the given control into the payload:
  payload[thisControl] = Number(value);   // convert strings to numbers

  // the 'on' control is a special case, it's true/false
  // because it's a checkbox:
  if (thisControl === 'on') {
    payload[thisControl] = event.target.checked;
  }

  setLight(thisLight, payload);						// make the HTTP call
}

/*
this function makes an HTTP PUT call to change
the properties of the lights
*/
function setLight(lightNumber, data) {
  var path = url + lightNumber + '/state';		// assemble the full URL
  var content = JSON.stringify(data);				  // convert JSON obj to string
  // HttpDo seems to have a bug in it when it comes to PUT, so I've
  // used jQuery instead here.

  // httpDo( path, 'PUT', content, 'json', function(response) {
  //   println(response);
  //   getLights();
  // });

  var requestParams = {
    type: "PUT",					  // use the PUT method
    url: path,						  // URL to call
    data: content,					// body of the request
    dataType: 'text/json'		// data type of the body
  };

  function reply(response) {
    // callback function
    println('response: ' + response);		// server (hub) response
    getLights();				// refresh the lights from the hub
  }

  var request = $.ajax(requestParams, reply);
}
