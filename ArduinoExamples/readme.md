# Philips Hue Control from Arduino

These examples show how to control a Philips Hue hub from An Arduino MKR1000, MKR1010, or Nano 33 IoT. 

## Sketches included:

* [ArduinoHTTPClient-example](ArduinoHTTPClient-example/ArduinoHTTPClient-example.ino) Shows how to turn a light on or off.
* [ArduinoHueCT](ArduinoHueCT/ArduinoHueCT.ino) Shows how to change the color temperature on those lights that support CT control. 
* [ArduinoHueCTWithSensor](ArduinoHueCTWithSensor.ino) Shows how to change the color temperature on those lights that support CT control using a TCS34725 color sensor.
* [HueBlinkMultipleHubs](HueBlinkMultipleHubs/HueBlinkMultipleHubs.ino) - shows how to control multiple Hue hubs from the same Arduino
* [HueBlinkWithJson](HueBlinkWithJson/HueBlinkWithJson.ino) - shows how to use the Arduino_JSON library to form your request.
* [HueBlinkWithJsonEncoder](HueBlinkWithJsonEncoder/HueBlinkWithJsonEncoder.ino) - shows how to use the Arduino_JSON library and a rotary encoder to control 

## Libraries Required

All sketches use these libraries that you can install through the Library manager in the Arduino IDE (filter the library manger for these terms):

* WiFi101 (for MKR1000)
* WiFiNINA (for MKR1010 or Nano 33 IoT)
* ArduinoHttpClient 

The [ArduinoHueCTWithSensor](ArduinoHueCTWithSensor.ino) sketch uses the following additional libraries:

* Adafruit_TCS34725
* Adafruit_GFX
* Adafruit_SSD1306

## Hardware

You can run most of these sketches with no additional hardware other than your microcontroller. Additional hardware is detailed in the header of each sketch. 

## General Workflow

There are a few things all of these sketches will share in common.

### arduino_secrets.h file
For all of these exmaples, you'll need to add a new tab to your sketch (command-shift-N, or click the option menu on the left side of the IDE) and call it `arduino_secrets.h`. In that tab, you'll save your network ID and password like so:

   #define SECRET_SSID "netework name"
   #define SECRET_PASS "network password"

Fill in your network name and password for your particular WiFi network. Then save the sketch.  If you are copying this repository into your own git repository, be sure to use gitignore to ignore the `arduino_secrets.h` file for any sketch, so you don't accidentally upload your password to GitHub.

### Connect to Network

All of these sketches will connect to the WiFi in the setup(), and print your IP address when they connect. If you don't get this part of the sketch to work, check your network SSID and password, and check your network settings to make sure you can connect new devices to it.

````
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
````

### The HTTP Request

A typical HTTP request that your Arduino is sending looks like this:

````
PUT /api/$HUE_USER/lights/4/state HTTP/1.1
Host: $ADDR
Content-type: application/json
Content-length: 12

{"on": true}
````

There are a number of ways you can make that request, and a few tools that can simplify it. 

You can use just the WiFi library. The WiFiClient class is an instance of the Stream class in Arduino, and you can use Stream methods like read(), write(), print() and println() to send and receive bytes through it. It makes a TCP socket, and you can send whatever you want through it.

You can use the ArduinoHttpClient library. This library takes an WiFiClient and adds some HTTP-specific functions, so you don't have to write all of the request yourself. You'll see that in most of the examples.

Since the body of the request is JSON, you could simplify the process of making a JSON string by using the Arduino_JSON library. The examples [HueBlinkWithJson](HueBlinkWithJson/HueBlinkWithJson.ino) and  [HueBlinkWithJsonEncoder](HueBlinkWithJsonEncoder/HueBlinkWithJsonEncoder.ino) show how you can do that.

### ArduinoHTTPClient

All of these sketches use the ArduinoHTTPClient to manage the HTTP requests. This library depends on the generic WiFi library. You have to make a WiFiClient first (usually as a global variable), then pass that to the ArduinoHTTPClient like so:

````
// make a wifi instance and a HttpClient instance:
WiFiClient wifi;
HttpClient httpClient = HttpClient(wifi, hueHubIP);
````

If you've got those things down, you should be ready to try some of these out.
