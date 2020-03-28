/*
  Philips Hue Control from Processing
  early version. Needs cleanup.
  
  Uses Rune Madsen's HTTP library, so you need to install it from the library manager. 
  
  created 23 March 2020
  by Tom Igoe
*/

import http.requests.*;

// Hue hub IP address. Fill in the right one for your hue hub:
String server = "http://192.168.1.18:8080";
// Hue hub user name. Fill in yours here:
String username = "hue-hub-username";
// light that you want to control:
int lightNumber = 10;
boolean lightState = true;

public void setup() {
  size(400, 400);
  smooth();
  // one draw loop every 5 seconds:
  frameRate(0.2);
}

void draw() {
   // form the request string: http://hue.hub.ip.address/apu/username/lights/lightNumber/state/ :
  String requestString = server + "/api/" + username + "/lights/" + lightNumber + "/state";
  // make a new request:
  PutRequest put = new PutRequest(requestString);
  // add the content-type header:
  put.addHeader("Content-Type", "application/json");
  // add the body of the request:
  put.addData("{\"on\":" + lightState + "}");
  // send the request:
  put.send();
  // print the response
  println("Reponse Content: " + put.getContent());
 // change the state for next time through the draw loop:
  lightState = !lightState;
}
