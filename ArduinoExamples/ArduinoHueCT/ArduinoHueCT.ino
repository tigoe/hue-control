/* Hue color temperature control example for ArduinoHttpClient library

   Uses ArduinoHttpClient library to control Philips Hue
   For more on Hue developer API see http://developer.meethue.com

  To control a light, the Hue expects a HTTP PUT request to:

  http://hue.hub.address/api/hueUserName/lights/lightNumber/state

  The body of the PUT request looks like this:
  {"ct": value}  where value ranges from 153 - 500

  ct is in the mired scale, which is 1000000/degrees Kelvin

  This example  shows how to concatenate Strings to assemble the
  PUT request and the body of the request.

  note: WiFi SSID and password are stored in arduino_secrets.h file.
  If it is not present, add a new tab, call it "arduino_secrets.h" 
  and add the following defines, and change to your own values:

  #define SECRET_SSID "ssid"    
  #define SECRET_PASS "password"

   modified 1 Mar 2022
   by Tom Igoe (tigoe) from HueBlink example
*/

#include <SPI.h>

//#include <WiFi101.h>  // for MKR1000
#include <WiFiNINA.h>   // for Nano 33 IoT, MKR1010
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"

int status = WL_IDLE_STATUS;      // the Wifi radio's status
char hueHubIP[] = "192.168.0.4";  // IP address of the HUE bridge
String hueUserName = "yourhuehubusername"; // hue bridge username

// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, hueHubIP);
// change the values of these two in the arduino_serets.h file:
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

int colorTemp = 2000; // color temperature to set the light to
int increment = 100;  // increment of CT change

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
    delay(2000);
  }

  // you're connected now, so print out the data:
  Serial.print("You're connected to the network IP = ");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}

void loop() {
  // add an increment to the color temperature:
  colorTemp += increment;
  Serial.println("Color temp: " + String(colorTemp));
  // convert color temp to mired value:
  String mired = String(1000000 / colorTemp);
  Serial.println("mired: " + mired);
  // send the change request:
  sendRequest(3, "ct", mired);
  // keep colorTemp bounded between 2000 and 6500:
  if (colorTemp >= 6500 || colorTemp <= 2000) {
    increment = -increment;
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
  Serial.println(hueCmd);
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
