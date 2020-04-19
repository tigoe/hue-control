/* Hue color temperature control example for ArduinoHttpClient library

   Uses ArduinoHttpClient library to control Philips Hue
   For more on Hue developer API see http://developer.meethue.com

  To control a light, the Hue expects a HTTP PUT request to:
  http://hue.hub.address/api/hueUserName/lights/lightNumber/state

  The body of the PUT request looks like this:
  {"ct": value}  where value ranges from 153 - 500

  ct is in the mired scale, which is 1000000/degrees Kelvin

  This sketch also uses the Hue transitiontime variable. The units
  are 0.1 seconds.

  note: WiFi SSID and password are stored in arduino_secrets.h file.
  If it is not present, add a new tab, call it "arduino_secrets.h"
  and add the following defines, and change to your own values:

  #define SECRET_SSID "ssid"
  #define SECRET_PASS "password"

   created 18 April 2020
   by Tom Igoe
*/
// include libraries for the sensor:
#include <Wire.h>
#include "Adafruit_TCS34725.h"

#include <SPI.h>
//#include <WiFi101.h>    // use this for the MKR1000
#include <WiFiNINA.h>     // use this for the MKR1010 and Nano33 IoT
#include <ArduinoHttpClient.h>
#include <Arduino_JSON.h>
#include "arduino_secrets.h"

// initialize sensor:
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_700MS, TCS34725_GAIN_1X);

// global variables for network:
char hueHubIP[] = "192.168.1.2";  // IP address of the HUE bridge
String hueUserName = "hubUserName"; // hue bridge username

// JSON object for the request to the hue:
JSONVar lightState;
// light number that you want to control:
int lightNumber = 16;

// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, hueHubIP);

// boolean as to whether you should be requesting:
bool okToSend = true;     // whether periodic requests are being made
long lastRequestTime = 0; .. timestamp of last request
int interval = 60 * 1000; // 60 seconds in milliseconds

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  // start sensor:
  while (!tcs.begin()) {
    if (Serial) Serial.println("Looking for sensor...");
    delay(100);
  }
  // connect to network:
  connectToNetwork();

  // set the non-changing characteristics of lightState
  lightState["on"] = true;
  lightState["transitiontime"] = 100;
}

void loop() {
  // variables for color sensor:
  uint16_t r, g, b, c, colorTemp, lux;

  // read sensor approx. every 2 seconds:
  if (millis() % 2000 < 2) {
    tcs.getRawData(&r, &g, &b, &c);
    lux = tcs.calculateLux(r, g, b);
    colorTemp = tcs.calculateColorTemperature_dn40(r, g, b, c);
    lightState["ct"] = 1000000 / colorTemp;
  }

  // copy lightState["on"] into a boolean variable
  // to make comparisons below more convenient:
  bool lightOn = lightState["on"];

  // if the light dips below 20 lux,
  // turn off light and set okToSend to false:
  if (lux < 20 && lightOn) {
    okToSend = false;
    lightState["on"] = false;
    sendRequest();
  }
  // if the light rises above 20, set okToSend again,
  // and set the light to on again:
  if (lux > 30 && !lightOn) {
    okToSend = true;
    lightState["on"] = true;
  }

  // make the request to the hue hub:
  if (okToSend && millis() - lastRequestTime > interval) {
    sendRequest();
  }
  
  // check the Wifi connection:
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_BUILTIN, LOW);
    connectToNetwork();
  }
}

void connectToNetwork() {
  // attempt to connect to Wifi network:
  while ( WiFi.status() != WL_CONNECTED) {
    if (Serial) Serial.print("Attempting to connect to WPA SSID: ");
    if (Serial) Serial.println(SECRET_SSID);
    // Connect to WPA/WPA2 network:
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }

  // you're connected now, so print out the data:
  if (Serial) Serial.print("You're connected to the network. IP: ");
  IPAddress ip = WiFi.localIP();
  if (Serial) Serial.println(ip);
  digitalWrite(LED_BUILTIN, HIGH);
}

void sendRequest() {
  // set the last request time:
  lastRequestTime = millis();
  String contentType = "application/json";
  String msgBody = JSON.stringify(lightState);
  String request = "/api/" + hueUserName;
  request += "/lights/" + String(lightNumber);
  request += "/state";
  
  if (Serial) Serial.println("making request");
  // make the PUT request to the hub:
  httpClient.put(request, contentType, msgBody);
  // wait for response:
  delay(50);
  // read the response:
  if (httpClient.available() > 0) {
    String response = httpClient.readString();
    if (Serial) Serial.println(response);
  }
}
