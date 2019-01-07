/* Hue color temperature control example for ArduinoHttpClient library

   Uses ArduinoHttpClient library to control Philips Hue
   For more on Hue developer API see http://developer.meethue.com

  To control a light, the Hue expects a HTTP PUT request to:
  http://hue.hub.address/api/hueUserName/lights/lightNumber/state

  The body of the PUT request looks like this:
  {"ct": value}  where value ranges from 153 - 500

  ct is in the mired scale, which is 1000000/degrees Kelvin

  note: WiFi SSID and password are stored in arduino_secrets.h file.
  If it is not present, add a new tab, call it "arduino_secrets.h" 
  and add the following defines, and change to your own values:

  #define SECRET_SSID "ssid"    
  #define SECRET_PASS "password"

   created 6 Jan 2019
   by Tom Igoe
*/
// include libraries for the sensor:
#include <Wire.h>
#include "Adafruit_TCS34725.h"

// includes for the MKR1000 and ArduinoHttpClient lib:
#include <SPI.h>
#include <WiFi101.h>
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"

// includes and defines for the SSD1306 display:
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 32 // OLED display height, in pixels
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)

// initialize display and sensor:
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_700MS, TCS34725_GAIN_1X);

// global variables for network:
int status = WL_IDLE_STATUS;      // the Wifi radio's status
char hueHubIP[] = "192.168.0.4";  // IP address of the HUE bridge
String hueUserName = "yourhuehubusername"; // hue bridge username

// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, hueHubIP);
// change the values of these two in the arduino_serets.h file:
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  // start sensor:
  while (!tcs.begin()) {
    Serial.println("Looking for sensor...");
    delay(100);
  }

  // start the display:
  while (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3C for 128x32
    Serial.println("SSD1306 setup...");
    delay(100);
  }
  // attempt to connect to Wifi network:
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    displayWrite("connecting:" + String(ssid));
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);
    delay(2000);
  }

  // you're connected now, so print out the data:
  Serial.print("You're connected to the network. IP: ");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}

void loop() {
  // very 2 seconds, read sensor:
  if (millis() % 2000 < 2) {
    // read sensor:
    uint16_t r, g, b, c, colorTemp, lux;
    tcs.getRawData(&r, &g, &b, &c);
    colorTemp = tcs.calculateColorTemperature_dn40(r, g, b, c);
    lux = tcs.calculateLux(r, g, b);

    // print result to the display:
    String reading = "CT: ";
    reading += String(colorTemp);
    reading += "\nLux: ";
    reading += String(lux);
    displayWrite(reading);

    // convert color temp to mired value:
    String mired = String(1000000 / colorTemp);
    Serial.println("mired: " + mired);
    // send the change request on lights 6 and 8 (randomly chosen):
    sendRequest(6, "ct", mired);
    sendRequest(8, "ct", mired);
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

void displayWrite(String message) {
  display.clearDisplay();
  display.setTextSize(2); // Draw 2X-scale text
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println(message);
  display.display();
}
