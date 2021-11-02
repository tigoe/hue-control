/* HueBlink example for ArduinoHttpClient library

   Uses ArduinoHttpClient library to control Philips Hue
   For more on Hue developer API see http://developer.meethue.com

  To control a light, the Hue expects a HTTP PUT request to:

  http://hue.hub.address/api/hueUserName/lights/lightNumber/state

  The body of the PUT request looks like this:
  {"on": true} or {"on":false}

  This example  shows how to concatenate Strings to assemble the
  PUT request and the body of the request.

   modified 15 Feb 2016 
   by Tom Igoe (tigoe) to match new API
*/

#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"
#include <Encoder.h>

///////please enter your sensitive data in the Secret tab/arduino_secrets.h
/////// Wifi Settings ///////
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

int status = WL_IDLE_STATUS;      // the Wifi radio's status

char hueHubIP[] = "192.168.0.4";  // IP address of the HUE bridge
String hueUserName = "yourhuehubusername"; // hue bridge username

// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, hueHubIP);

// encoder on pins 2 and 3
Encoder myEncoder(2, 3);
// previous position of the encoder:
int lastPosition = 0;
const int buttonPin = 4;    // pushbutton pin
int lastButtonState = LOW;  // last button state
int debounceDelay = 5;       // debounce time for the button in ms

// light's hue:
int hue = 0;

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial); // wait for serial port to connect.

  // attempt to connect to Wifi network:
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);
  }

  // you're connected now, so print out the data:
  Serial.print("You're connected to the network IP = ");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);

   pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
   // read the pushbutton:
  int buttonState = digitalRead(buttonPin);
  //  // if the button has changed:
  if (buttonState != lastButtonState) {
    // debounce the button:
    delay(debounceDelay);
    // if button is pressed:
    if (buttonState == LOW) {
      // you'll make two requests here, one to turn on, and one to change the color.
      // a more efficient approach would be to make a more complex request function
      // that can change both in one request. For that, see
      // https://github.com/tigoe/hue-control/tree/main/ArduinoExamples/HueBlinkWithJsonEncoder
      sendRequest(4, "on", "true");   // turn light on
      sendRequest(4, "hue", String(hue));   // change Hue
    }
  }
  // save current button state for next time through the loop:
  lastButtonState = buttonState;

  // read the encoder:
  int newPosition = myEncoder.read();
  // compare current and last encoder state:
  int change = newPosition - lastPosition;
  // if it's changed by 4 or more (one detent step):
  if (abs(change) >= 4) {
    // get the direction (-1 or 1):
    int encoderDirection = (change / abs(change));
    hue = hue + (encoderDirection* 100);
    hue %= 32767;
    Serial.println(hue);
    // save encoder position for next time through loop:
    lastPosition = newPosition;
  }
}

void sendRequest(int light, String cmd, String value) {
  // make a String for the HTTP request path:
  String request = "/api/" + hueUserName;
  request += "/lights/";
  request += light;
  request += "/state/";

  String contentType = "application/json";

  // make a string for the JSON command:
  String hueCmd = "{\"" + cmd;
  hueCmd += "\":";
  hueCmd += value;
  hueCmd += "}";
  // see what you assembled to send:
  Serial.print("PUT request to server: ");
  Serial.println(request);
  Serial.print("JSON command to server: ");

  // make the PUT request to the hub:
  httpClient.put(request, contentType, hueCmd);
  
  // read the status code and body of the response
  int statusCode = httpClient.responseStatusCode();
  String response = httpClient.responseBody();

  Serial.println(hueCmd);
  Serial.print("Status code from server: ");
  Serial.println(statusCode);
  Serial.print("Server response: ");
  Serial.println(response);
  Serial.println();
}
