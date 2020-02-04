/* HueBlink example for ArduinoHttpClient library
   uses Arduino_JSON library as well

   Uses ArduinoHttpClient library to control Philips Hue
   For more on Hue developer API see http://developer.meethue.com

  To control a light, the Hue expects a HTTP PUT request to:

  http://hue.hub.address/api/hueUserName/lights/lightNumber/state

  The body of the PUT request looks like this:
  {"on": true} or {"on":false}

  This example  shows how to concatenate Strings to assemble the
  PUT request and the body of the request, and how to use the
  Arduino_JSON library to assemble JSON to send the request.
  A typical light state JSON for the Hue system looks like this:
  {"on":true,"bri":254,"hue":0,"sat":0,"effect":"none",
  "xy":[0.4584,0.4100],"ct":156,"alert":"none",
  "colormode":"ct","reachable":true}

   modified 2 Feb 2020
   by Tom Igoe (tigoe)
*/

#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include <Arduino_JSON.h>
#include "arduino_secrets.h"

// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, SECRET_HUBADDR);
// a JSON object to hold the light state:
JSONVar lightState;
int difference = 25;
int brightness = 0;

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial); // wait for serial port to connect.

  // attempt to connect to Wifi network:
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(SECRET_SSID);
    // Connect to WPA/WPA2 network:
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }

  // you're connected now, so print out the data:
  Serial.print("You're connected to the network IP = ");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}

void loop() {
  // fade light up and down
  if (brightness >= 255 || brightness <= 0) {
    difference = -difference;
  }
  brightness += difference;
  // keep it in range regardless of the difference value:
  brightness = constrain(brightness, 0, 255);
  
  // set the "bri" property:
  lightState["bri"] = brightness;
 
  // set the "on" property:
  if (brightness > 0) {
    lightState["on"] = true;
  } else {
    lightState["on"] = false;
  }

  sendRequest(20, lightState);   // turn light on
  delay(1000);                  // wait 1 second
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
