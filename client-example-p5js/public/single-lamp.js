var url = '192.168.0.12';           // the hub IP address
var username = 'your-hue-username-here';    // fill in your Hub-given username var resultDiv;
var dimmer;
var lightNumber = 3;

function setup() {
  resultDiv = createDiv('Hub response');  // a div for the Hue hub's responses
  resultDiv.position(10, 50);             // position it
  dimmer =  createSlider(0, 254, 127)     // a slider to dim one light
  dimmer.position(10, 10);                // position it
  dimmer.mouseReleased(changeBrightness); // set a mouseReleased callback function
  connect();                              // connect to Hue hub; it will show all light states
}

/*
this function makes the HTTP GET call to get the light data:
HTTP GET http://your.hue.hub.address/api/username/lights/
*/
function connect() {
  url = "http://" + url + '/api/' + username + '/lights/';
  httpDo(url, 'GET', getLights);
}

/*
this function uses the response from the hub
to create a new div for the UI elements
*/
function getLights(result) {
  resultDiv.html(result);
}

function changeBrightness() {
 var brightness = this.value(); // get the value of this slider
 var lightState = {             // make a JSON object with it
   bri: brightness,
   on: true
 }
// make the HTTP call with the JSON object:
 setLight(lightNumber, lightState);
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
function setLight(whichLight, data) {
  var path =    url + whichLight + '/state/';

  var content = JSON.stringify(data);				 // convert JSON obj to string
  httpDo( path, 'PUT', content, 'text', getLights); //HTTP PUT the change
}
