/* HueBlink example for ArduinoHttpClient library
   uses Arduino_JSON library as well

   Uses ArduinoHttpClient library to control Philips Hue
   For more on Hue developer API see http://developer.meethue.com

  To control a light, the Hue expects a HTTP PUT request to:
  http://hue.hub.address/api/hueUserName/lights/lightNumber/state

  This example  shows how to concatenate Strings to assemble the
  PUT request and the body of the request, and how to use the
  Arduino_JSON library to assemble JSON to send the request.
  A typical light state JSON for the Hue system looks like this:
  {"on":true,"bri":254,"hue":65535,"sat":254,"effect":"none",
  "xy":[0.0,0.0],"ct":500,"alert":"none",
  "colormode":"ct","reachable":true}
  Only the first four properties are changed in this example:

  A pushbutton on pin 2 sets what property to change
  A rotary encoder on pins A1 and A5 sets the change value
  A pushbutton on pin 3 sends the changed JSON value

   created 2 Feb 2020
   by Tom Igoe (tigoe)
*/

#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include <Arduino_JSON.h>
#include <Encoder.h>
#include "arduino_secrets.h"

// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, SECRET_HUBADDR);

// a JSON object to hold the light state:
JSONVar lightState;

Encoder knob(A1, A5);               // encoder on these two pins
const int encoderButtonPin = 2;     // button input pin
const int sendButtonPin = 3;        // HTTP request send button
int lastEncoderButtonState = HIGH;  // previous button states
int lastSendButtonState = HIGH;
int debounceDelay = 4;              // 4ms debounce for button
int lastKnobState = -1;             // previous knob position

int currentProperty = 0;            // property to be changed
int propertyCount = 4;              // count of properties in use

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial);

  //   attempt to connect to Wifi network:
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to: ");
    Serial.println(SECRET_SSID);
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }

  // you're connected now, so print out the data:
  Serial.print("You're connected to the network IP = ");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);

  // initialize buttons:
  pinMode(encoderButtonPin, INPUT_PULLUP);
  pinMode(sendButtonPin, INPUT_PULLUP);

  // establish the properties in lightState that you want to use, in order:
  lightState["on"] = false;   // true/false
  lightState["bri"] = 0;      // 0 -255
  lightState["hue"] = 0;      // 0-65535
  lightState["sat"] = 0;      // 0-255
  // property count is however many properties you set in lightState:
  propertyCount = lightState.keys().length();
}

void loop() {
  // read the encoder button, look for a state change:
  int encoderButtonState = digitalRead(encoderButtonPin);
  if (encoderButtonState != lastEncoderButtonState) {
    delay(debounceDelay);
    if (encoderButtonState == LOW) {
      // change which property is to be changed by the encoder:
      currentProperty++;
      // if the count goes to high, reset to 0:
      if (currentProperty == propertyCount) {
        currentProperty = 0;
      }
      // print thekey of the property to be changed:
      Serial.print("changing ");
      Serial.println( lightState.keys()[currentProperty]);
    }
    // save current button state for next time:
    lastEncoderButtonState = encoderButtonState;
  }

  // read the encoder:
  int knobState = knob.read();
  // look for the knob to change by 4 stops (1 detent):
  if ( abs(knobState - lastKnobState) >= 4) {
    // get the direction of knob change:
    int knobChange = abs(knobState - lastKnobState) / ( knobState - lastKnobState);
    // change the current property:
    changeLightProperty(currentProperty, knobChange);
    // save current knob state for next time:
    lastKnobState = knobState;
  }

  // read the send button, look for state change:
  int sendButtonState = digitalRead(sendButtonPin);
  if (sendButtonState != lastSendButtonState) {
    delay(debounceDelay);
    if (sendButtonState == LOW) {
      // send the request
      sendRequest(3, lightState);
    }
    // save the current button state for next time:
    lastSendButtonState = sendButtonState;
  }
}

void sendRequest(int light, JSONVar myState) {
  // make a String for the HTTP request path:
  String request = "/api/" + String(SECRET_HUBUSER);
  request += "/lights/";
  request += light;
  request += "/state/";

  String contentType = "application/json";

  // make a string for the JSON command:
  String body  = JSON.stringify(lightState);

  // see what you assembled to send:
  Serial.print("PUT request to server: ");
  Serial.println(request);
  Serial.print("JSON command to server: ");
  Serial.println(body);

  // make the PUT request to the hub:
  httpClient.put(request, contentType, body);

  // read the status code and body of the response
  int statusCode = httpClient.responseStatusCode();
  String response = httpClient.responseBody();

  Serial.print("Status code from server: ");
  Serial.println(statusCode);
  Serial.print("Server response: ");
  Serial.println(response);
  Serial.println();
}

void changeLightProperty(int whichProperty, int change) {
  // get the list of keys of the JSON var:
  JSONVar thisKey = lightState.keys();
  // get the value of the one to be changed:
  JSONVar value = lightState[thisKey[whichProperty]];
  // temporary variable for changed value:
  int newVal = 0;
  // each property has a different range, so you need to check 
  // which property is being changed to set the range:
  switch (whichProperty) {
    case 0:   // on: true/false
      value = !value;
      break;
    case 1:  // bri: 0-255
      newVal = int(value) + change;
      value = constrain(newVal, 0, 255);
      break;
    case 2:  // hue: 0-65535, so take big steps (* 100):
      newVal = int(value) + change * 100;
      value = constrain(newVal, 0, 65535);
      break;
    case 3:   //sat: 0-255
      newVal = int(value) + change;
      value = constrain(newVal, 0, 255);
      break;
  }
  // print the key of the property being changed and its value:
  Serial.print(lightState.keys()[whichProperty]);
  Serial.print(" ");
  Serial.println(value);
}
