/* HueBlink example for ArduinoHttpClient library

   Uses ArduinoHttpClient library to control multiple Philips Hue hubs.
   For more on Hue developer API see http://developer.meethue.com

  To control a light, the Hue expects a HTTP PUT request to:
  http://hue.hub.address/api/hueUserName/lights/lightNumber/state

  The body of the PUT request looks like this:
  {"on": true} or {"on":false}

   Add a tab called arduino_secrets.h containing the network SSID and password like so:
   #define SECRET_SSID ""
   #define SECRET_PASS ""

   created 1 Mar 2022
   by Tom Igoe (tigoe)
*/

#include <SPI.h>
//#include <WiFi101.h>  // for MKR1000
#include <WiFiNINA.h>   // for Nano 33 IoT, MKR1010
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"

// make a wifi instance:
WiFiClient wifi;

// a string to hold the global light state (  {"on": true} or {"on":false}):
String lightState = "  {\"on\": true}";

// current global state of the lights:
boolean currentState = true;

// fill in your hue hub IP addresses here:
String hubAddress[] = {"192.168.1.12",
                       "192.168.1.13",
                       "192.168.1.14",
                       "192.168.1.15"
                      };

// fill in the user IDs for your hubs here:
String hubLogin[] = {"sdasdasdasdda",
                     "xczxczxczxczxc",
                     "werewqrqereqwr",
                     "dfsdfsdfsdfsdfsdf"
                    };

// fill in the light you want to control on each hub here:
int lightNumbers[] = {1,3,2,5};

// an httpClient instance:
HttpClient httpClient = HttpClient(wifi, hubAddress[0]);
// the hub currently being controlled:
int currentHub = 0;
long lastRequest = 0;
int requestDelay = 500;
void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial);

  // attempt to connect to Wifi network:
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(SECRET_SSID);
    // Connect to WPA/WPA2 network:
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }

  // you're connected now, so print out the data:
  Serial.print("You're connected to the network. Your IP = ");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}

void loop() {
  // replace "true" with "false" in lightState, and vice versa:
  if (currentState == true) {
    lightState.replace("false", "true");
  } else {
    lightState.replace("true", "false");
  }

  // clean up after the last set of requests by waiting for any remaining response:
  while (httpClient.connected()) {
    // print out whatever you get:
    if (httpClient.available() > 0) {
      String response = httpClient.readString();
      Serial.println(response);
      Serial.println();
    }
  }
  
  // make new requests every 500 ms:
  if (millis() - lastRequest > requestDelay) {
    httpClient = HttpClient(wifi, hubAddress[currentHub]);
    // make request:
    sendRequest(currentHub, lightNumbers[currentHub], lightState);
    // when the current hub number reaches 3:
    if (currentHub == 3) {
      // change currentState for next set:
      currentState = !currentState;
      // reset the current hub number:
      currentHub = 0;
      // wait 3 seconds:
      delay(3000);
    } else {
      currentHub++;
    }
    // update the last request timestamp:
    lastRequest = millis();
  }
}

void sendRequest(int hubNumber, int light, String myState) {
  // make a String for the HTTP request path:
  String request = "/api/" + String(hubLogin[hubNumber]);
  request += "/lights/";
  request += light;
  request += "/state/";

  String contentType = "application/json";

  // make a string for the JSON command:
  String body  = myState;

  // see what you assembled to send:
  Serial.print("PUT request to server: ");
  Serial.println(request);
  Serial.print("JSON command to server: ");
  Serial.println(body);

  // make the PUT request to the hub:
  httpClient.put(request, contentType, body);
}
