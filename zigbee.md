# ZigBee for Philips Hue

I'm interested in making lamps which are compatible with the Philips Hue system, specifically ones that can be controlled by the Hue hub via ZigBee. Below are the notes I've collected so far. 

## The [ZigBee LightLink Protocol](https://www.zigbee.org/zigbee-for-developers/applicationstandards/zigbee-light-link/) 

You'll need to sign in to download these. 

## XBee Controller

This [example uses the Digi XBee series 2](https://github.com/ratmandu/node-red-contrib-zblight), serially connected to a node-red application. This is for direct control of the lamps without a Hue hub, it's not a development example for making custom lamps. The writer seems to have gotten [a lead from the Digi forums](https://www.digi.com/support/forum/61633/xbee-s2c-xb24c-with-phillips-hue-light-bulb
). This suggests that it might be possible to use the Digi stack as a receiver for messages from the Hue hub as well, and therefore make lamp endpoints with it. 

## DIYHue/Raspbee

The [DIYHue framework](https://diyhue.org/) covers both lamp endpoints and controllers, but most of the lamp endpoints appear to be WiFi-connected rather than ZigBee-connected. In fact, most of the DIYHue approach seems to be to replace the hub and communicate via WiFi directly. The exception to this is where they use the Raspbee module with a Raspberry Pi to basically duplicate a hub. The [Raspbee](https://www.dresden-elektronik.de/raspbee/) is a ZigBee radio module based on the Atmel [ATmega256RFR2](https://www.microchip.com/wwwproducts/en/ATmega256rfr2) processor. 

## Meshbee and JN5168 Radios

Peter Visser's [instructions are based on the Uses JN5168 radio](https://peeveeone.com/?tag=light-link) from NXP. They rely on [NXP's LightLink firmware](https://www.nxp.com/products/wireless/proprietary-ieee-802.15.4-based/zigbee/zigbee-light-link:ZIGBEE-LIGHT-LINK); the [examples in his gitHub repo](https://github.com/peeveeone/ZLL_Lights) seem to be variations of this firmware, with the keys Worked out by sniffing the data on the radio line. They are the only lamp endpoint example that I've found so far. These  JN5168 radio. Here's a [breakout board for that radio](http://www.nkcelectronics.com/JN5168-breakout-PCB-KIT-PCB-Version-2_p_613.html). Visser provides some nice [setup instructions for the NXP ZLL toolchain](https://peeveeone.com/?p=144), which is Windows-based.


## ATSAMR21G18A 

Microchip's ATSAMR21G18A processor is a Cortex M0-based board with a radio built in. The [ATSAMR21ZLL-EK evaluation kit](https://www.microchip.com/developmenttools/ProductDetails/atsamr21zll-ek) is designed for experimenting with Lightlink applications, particularly making lamp endpoints. [Digikey carries the evaulation kit](https://www.digikey.com/product-detail/en/microchip-technology/ATSAMR21ZLL-EK/ATSAMR21ZLL-EK-ND/5226576). 