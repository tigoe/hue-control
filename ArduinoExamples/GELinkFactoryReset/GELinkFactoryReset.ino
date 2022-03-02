/* GE Link bulb reset example for ArduinohttpClient library

   Uses ArduinohttpClient library to control Philips Hue
   For more on Hue developer API see http://developer.meethue.com

  This  UNFINISHED example is written to control a Hue switch or Ikea Trådfri switch
  to factory-reset a GE Link bulb. Put the bulb less than 30cm from your hub.
  Then run the sketch. THe buld will be blinked 5 times.
  Once the bulb resets after 5 blinks,
  the sketch sends a touchlink request, then a search for new bulbs.
  After ten seconds, it sends the request for new bulbs. If everything
  went right, you should see the new bulb linked to your hub.

   modified 1 Mar 2022
   by Tom Igoe (tigoe)
*/

#include <SPI.h>
//#include <WiFi101.h>  // for MKR1000
#include <WiFiNINA.h>   // for Nano 33 IoT, MKR1010
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"

/*
  create a tab called arduino_secrets.h with the following #defines:
  #define SECRET_SSID ""
  #define SECRET_PASS ""
  #define SECRET_HUE_ADDR ""
  #define SECRET_HUE_USERNAME ""
*/
#define HTTP_GET 1
#define HTTP_POST 2
#define HTTP_PUT 3
#define HTTP_DELETE 4

// make a wifi instance and a httpClient instance:
WiFiClient wifi;
HttpClient httpClient =  HttpClient(wifi, SECRET_HUB_ADDR);
bool requesting = false;

// parts of the HTTP request:
int lightNumber = 3;
String basicRequest = "/api/" + String(SECRET_HUE_USERNAME);
String request;
String contentType = "application/json";
String body = "";

// which step of the reset process are you on:
int resetStep = 0;
int delayTime = 3000;
long timestamp = 0;

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
  }

  // you're connected now, so print out the data:
  Serial.print("You're connected to the network IP = ");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}

void loop() {
  
  // blink bulb 5 times to reset:
  if (resetStep < 10) {
    // set up the request for on/off:
    request = basicRequest + "/lights/";
    request += lightNumber;
    request += "/state/";

    //odd steps are on:
    if (resetStep % 2 == 0) {
      // turn light on:
      body = "{\"on\":true}";
    }
    // even steps are off:
    if (resetStep % 2 == 1) {
      // turn light off:
      body = "{\"on\":false}";
    }

    // if the time has passed and you're not in the midst of a request:
    if ((millis() - timestamp > delayTime) && !requesting) {
      // Send the request:
      httpClient.put(request, contentType, body);
      Serial.println(request + body);
      requesting = true;
      timestamp = millis();
      // increment the step counter:
      resetStep++;
    }
  }

  // after the 5 on/offs, try to capture the bulb:
  if (resetStep == 10) {
    // send a  touchlink request:
    request = basicRequest + "/config/";
    body = "{\"touchlink\": true}";

    // if the time has passed and you're not in the midst of a request:
    if ((millis() - timestamp > delayTime) && !requesting) {
      // Send the request:
      httpClient.put(request, contentType, body);
      Serial.println(request + body);
      requesting = true;
      timestamp = millis();
      // increment the step counter:
      resetStep++;
    }
  }

  if (resetStep == 11) {
    // do get new bulb request:
    request = basicRequest + "/lights/";

    // if the time has passed and you're not in the midst of a request:
    if ((millis() - timestamp > delayTime) && !requesting) {
      // Send the request:
      httpClient.post(request, contentType, "");
      Serial.println(request);
      requesting = true;
      timestamp = millis();
      // increment the step counter:
      resetStep++;
    }
  }

  if (resetStep == 12) {
    // now do list new bulb request:
    request = basicRequest + "/lights/new/";

    if ((millis() - timestamp > delayTime) && !requesting) {
      // Send the request:
      httpClient.get(request);
      Serial.println(request);
      requesting = true;
      timestamp = millis();
      // increment the step counter:
      resetStep++;
    }
  }

if (resetStep > 12) {
  Serial.println("All done!");
  while(true);
}
  // wait for response:
  while ( httpClient.connected()) {
    if ( httpClient.available()) {
      String response = httpClient.readString();
      Serial.println(response);
    }
  }
  // when connection is closed, restart:
  if (!httpClient.connected()) {
    requesting = false;
  }
}
