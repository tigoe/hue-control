/* Hue Group state control example for ArduinoHttpClient library

  Uses ArduinoHttpClient library to control Philips Hue
  Uses Hue API v.1
  For more on Hue developer API see http://developer.meethue.com


  To control a group, the Hue expects a HTTP PUT request to:
  http://hue.hub.address/api/hueUserName/groups/groupNumber/action

  The body of the PUT request looks like this:
   {
		"on": true,  // true of false
		"bri": 254,  // 0-254
		"ct": 346,   // 153 -500 in mireds which is 1000000/degrees Kelvin
		"alert": "select",
		"colormode": "ct"
	}
  This example  shows how to use a JSONVAr object from the 
  Arduino_JSON library to assemble the
  PUT request and the body of the request.

  Uses the following libraries: 
  WiFiNINA, WiFi101, WiFi, WiFi@3 or whatever works with your Arduino model
  ArduinoHttpClient, Arduino_JSON, EncoderStepCounter.h

  External hardware: A rotary encoder is connected to pins 5 and 6.
  Its pushbutton is connected to pin 2, and its other side is connected
  to ground, hence the use of INPUT_PULLUP below. 

  note: WiFi SSID and password and Hue app key are stored 
  in arduino_secrets.h file.
  If it is not present, add a new tab, call it "arduino_secrets.h" 
  and add the following defines, and change to your own values:

  #define SECRET_SSID "ssid"    
  #define SECRET_PASS "password"
  #define SECRET_HUBAPPKEY "hue app key"

   Created 23 Feb 2025
   by Tom Igoe 
*/

//#include <WiFi101.h>  // for MKR1000
#include <WiFiNINA.h>  // for Nano 33 IoT, MKR1010
#include <ArduinoHttpClient.h>
#include <Arduino_JSON.h>
#include "arduino_secrets.h"
#include "EncoderStepCounter.h"

char hueHubIP[] = "172.22.151.183";  // IP address of the HUE bridge

// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, hueHubIP);

// a JSON object to hold the light state:
JSONVar groupState;
// the group number:
int groupNum = 81;

// hardware pin numbers for the encoder:
#define ENCODER_PIN1 5
#define ENCODER_PIN2 6
#define BUTTON_PIN 2

// Create instance for the encoder:
EncoderStepCounter encoder(ENCODER_PIN1, ENCODER_PIN2);
// variable for the previous states of the button and the encoder:
int lastEncoderState = 0;
int lastButtonState = 0;
// button debounce time in ms:
const int debounceDelay = 10;

// last time an HTTP request was sent:
long lastSendTime = 0;
// min. send time between HTTP requests, so as not to overwhelm
// the hue bridge:
const int sendInterval = 1000;
// if the groupState has changed at all:
int stateChanged = false;

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  if (!Serial) delay(3000);

  // attempt to connect to Wifi network:
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(SECRET_SSID);
    // Connect to WPA/WPA2 network:
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }

  // you're connected now, so print out the data:
  Serial.println("Connected to the network: " + String(SECRET_SSID));
  Serial.println("IP:  ");
  Serial.println(WiFi.localIP());

  // Initialize encoder and pushbutton:
  encoder.begin();
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  // initialize the groupState variable with a few key properties:
  groupState["on"] = true;
  groupState["bri"] = 127;
}

void loop() {
  // check the encoder state every loop:
  encoder.tick();
  // read the pushButton:
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState != lastButtonState) {
    delay(debounceDelay);
    if (buttonState == LOW) {
      // button is pushed, so change the "on" property
      bool onState = groupState["on"];
      if (onState == true) {
        groupState["on"] = false;
      } else {
        groupState["on"] = true;
      }
    }
    // if the groupState's changed, change this variable:
    stateChanged = true;
    // save the current button state for comparison next time:
    lastButtonState = buttonState;
  }

  // read the encoder:
  int encoderState = encoder.getPosition();
  // get the brightness in a local variable so you can manipulate it:
  int groupBrightness = groupState["bri"];
  if (encoderState != lastEncoderState) {
    if (encoderState > lastEncoderState) {
      groupBrightness += 4;
    } else {
      groupBrightness -= 4;
    }
    // constrain brightness:
    groupBrightness = constrain(groupBrightness, 0, 254);
    // put the result back into the groupState:
    groupState["bri"] = groupBrightness;
    Serial.println(groupState);
    // save current encoder value as old value
    lastEncoderState = encoderState;
    // if the groupState's changed, change this variable:
    stateChanged = true;
  }

  if (millis() - lastSendTime > sendInterval) {
    if (stateChanged) {
      // only send if the min send interval has passed:
      Serial.println("state has changed");
      Serial.println("         sending");
      Serial.println(groupState);
      sendRequest(groupNum, groupState);
      stateChanged = false;
    }
    lastSendTime = millis();
  }
}

void interrupt() {
  encoder.tick();
}

void sendRequest(int group, JSONVar myState) {
  // make a String for the HTTP request path:
  String request = "/api/" + String(SECRET_HUBAPPKEY);
  request += "/groups/";
  request += group;
  request += "/action/";

  String contentType = "application/json";

  // make a string for the JSON command:
  String body = JSON.stringify(groupState);

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