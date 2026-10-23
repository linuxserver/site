---
title: How the UniFi AP AC LITE rekindled my love of wireless networking
date: 2017-01-17T18:26:00Z
author: Josh Stark
tags:
  - networking
  - wifi
  - ubiquiti
  - unifi
  - docker
hero: ./featured.jpg
---

For many years I happily made do with the 802.11n capability of my Sky Fibre router. It worked, and I was happy. That was until I bought a Chromecast and a Raspberry Pi 3. My wireless streaming activity skyrocketed and the router was unable to keep up, with its paltry 2.4GHz transmitter. In my household there are on average six devices connected to the wireless network - not many in any terms, but when two of them require a hefty amount of bandwidth, I needed to beef up the hardware.

Enter the [UniFi AP AC LITE](https://www.ubnt.com/unifi/unifi-ap-ac-lite/) by Ubiquiti Networks. Recommended by many of the other guys at LinuxServer, I took the dive and entered the world of business wireless networking - and brought it home.

![Top-down view of the AP-LITE](/content/images/2017/01/IMG_20170114_115555-1.jpg)

The first thing I took away from this device is just how beautiful it is. In fact, all of the products from Ubiquiti have been designed with such flagrant simplicity and minimalist approach. Measuring in at a mere 160mm in diameter, the LITE can be placed pretty much anywhere without feeling particularly intrusive to the feng shui of your home (or office). This rings especially true if mounted high on a wall or even on the ceiling. The crisp white with blue LED also gives it an almost clinical look but it also makes it feel like quite a premium device.

The device is powered by a single ethernet port found on the reverse side but unfortunately it doesn't support the IEEE 802.3af PoE standard, instead requiring a PoE injector. A mild annoyance as it requires another power socket but from what I have read, including 802.3af compliance would have raised the cost of the unit (the AP AC LR supports this, one reason for its higher price tag).

It also displays a visual cue to its running status via the LED ring in the centre, which pulsates a faint white while initialising, and then settles to a solid blue when adopted to a network. In some situations this could be somewhat distracting depending on where it goes and if the room is unlit but there is an option to turn this off using the Controller software.

The instant appeal of this device - being the budget variant of Ubiquiti's offerings - is that it contains a dual 802.11ac antenna, creating a WLAN over both the 2.4GHz and 5GHz frequencies. While a fair number of ISP routers offer this, there are still a few that do not (I'm looking at you *Sky* - fibre internet but no 5GHz? Shame on you).

## Firmware

One of the first things I did before exploring the controller was to update the firmware on the device (always a good idea to check for any updates). I checked the [UniFi firmware library](https://www.ubnt.com/download/unifi) for any new updates, and then copied the link it provided. There are two ways you can update the firmware on a UniFi AP (both of which actually use the same command - one just has a UI), and that is to either SSH to the device and run the `upgrade` command, or use the controller software. I opted for SSH.

    ssh ubnt@<IP> # the default password is also 'ubnt'
    

I then chose to upgrade using the latest firmware using the link provided by the Ubiquiti website:

    upgrade http://dl.ubnt.com/unifi/firmware/U7PG2/3.7.29.5446/BZ.qca956x.v3.7.29.5446.161206.2105.bin
    

## The UniFi Controller

In order to use the AP, it needed to be adopted into my network. To do this, I made use of [Ubiquiti's UniFi Controller](https://www.ubnt.com/enterprise/software/) software. It runs as either a native application on Windows, or as a web application, which is perfect for me as we have [our own maintained docker image](https://github.com/linuxserver/docker-unifi) for it! I fired up a container and sorted the initial set up - creating a WLAN with SSID and password, as well as an admin account for the controller. It was also at this point that I adopted the AP into the network.

    docker create --name=unifi \
      -v /home/josh/unifi:/config \
      -e PGID=1000 -e PUID=1003 \
      --net=host \
      linuxserver/unifi
    

*It should be noted that I used `--net=host` rather than exposing the individual ports. This was the only way I was able to access the controller*

The controller itself, while very well laid out, did have a slight learning curve to overcome as there is a real overload of information within it. I have been very used to incredibly basic statistics when it comes to WLANs as I have primarily dealt with first-party router software in the past. It was refreshing to see such a wealth of information but it was also slightly daunting.

![Home screen with statistics](/content/images/2017/01/chrome_2017-01-15_10-59-09.png)

I really appreciated being able to view all connected clients, with their current bandwidth usage and connection types. This proved very useful before I configured WLAN overrides and band steering as I was able to understand which devices were connected to the 2.4GHz frequency, and which ones were able to switch to the 5GHz frequency.

![Connected clients](/content/images/2017/01/chrome_2017-01-15_10-57-02-1.png)

As testament to the somewhat bumpy road I took in understanding how this controller operates, after about ten minutes of looking, I eventually found the setting where I could create a WLAN override, whereby the two bands are explicitly split from the singular SSID, so I could connect directly to either the 2.4GHz or 5GHz networks. This was paramount for me as I wanted to make sure my Chromecast *always* connected to the 5GHz network as I very much need the speeds it provides.

![WLAN Overrides](/content/images/2017/01/chrome_2017-01-15_10-57-40.png)

For whatever reason one may have, it's also possible to see a more detailed timeline of how many clients have been connected, plus how much data was flowing through the network at that time. In a humorous twist, I can see on this graph exactly when my wife stumbled home  after enjoying a night out with her friend, as the client count rises to accommodate them rejoining the network. For any parents out there, this could potentially act as the be-all-end-all of the quintessential argument "and what time did you get home last night?!".

![WLAN usage statistics](/content/images/2017/01/chrome_2017-01-15_11-37-11.png)

By looking at the activity logs, those with multiple APs can see when clients switch between each UniFi device, which could help with understanding where best to position each one in order to get the best possible signal wherever you are in the building. As I only have one, this isn't really an issue for me!

## Performance

Of course, what good is a £85 access point if it can't perform? I only possess a single AP (*hint hint, Ubiquiti*) so my experience won't be as seamless as those that have purchased a set of access points (or forked out more on the [AP AC LR](https://www.ubnt.com/unifi/unifi-ap-ac-lr/), or [AP AC PRO](https://www.ubnt.com/unifi/unifi-ap-ac-pro/)) but so far the signal strength and data throughput has been a night and day difference when compared to my old Sky router.

I live in a decent sized house by UK standards, with three bedrooms and a relatively open living room. I put some thought into where I wanted the AP to go based on the likely position of static wireless clients (i.e. the Chromecast and Raspberry Pi), plus the kind of movements my wife and I make in the house while carrying our phones or her iPad. I also rent, so despite a wall mounting option being available, a caveat from my landlord was that it must be hidden from  sight - a slight shame as it's quite nice to look at, but understandable.

The AP is mounted roughly 2m high on the rearmost wall of my house, which gives it very good line-of-sight range in the living room as well as a close straight-line distance (through the floor/ceiling) from the Raspberry Pi which is in the bedroom directly above.

Using the controller's mapping page, I managed to set up a floor plan of the ground floor of my house in order to get a rough idea of how the signal would permeate. Naturally it didn't take into account the attenuation caused by walls or metallic objects but it certainly gave a good idea of what I could expect.

![Network heat map](/content/images/2017/01/chrome_2017-01-16_18-41-14.png)

_Left: 2.4GHz, Right: 5GHz_

My Chromecast - arguably the most used wireless device in our house - is sat firmly in the *amber* area, near the window on the right inner corner of our L-shaped living room. Surprisingly, moving only 3-4m from the AP, it drops to 76% signal strength - however, maintaining a 200Mb/s transfer rate. On the other hand, my Huawei Nexus 6P maintains a strong 90-95% strength connection anywhere in the living room, dropping to 86% when I move into the kitchen - the bottom right-hand corner. Both of these devices are connected to the 5GHz band.

## In Summary

I'm amazed it has taken me this long to get my hands on some really impressive wireless technology for my home. The UniFi LITE has freed up the airwaves and reduced the stress caused by a number of connected devices demanding a good deal of bandwidth for their own needs.

The controller's ability to "band steer", or, intelligently switch devices between the 2.4GHz and 5GHz networks based on their usage is also very handy - albeit a bit moot as I explicitly split mine. Its extensive collection of analytical tools allowed me to understand how the network is being utilised, which gave me the chance to attempt to optimise it.

I very much appreciate the extended signal range, as guests are now able to stream music or video from the guest bedroom - the furthest point in the house from the AP - without speed degradation - as the TX rate of active connections remains constant almost everywhere in the house.

I expect I will spend more time tweaking the network settings to see if I can get even more efficient use out of it but right now I am incredibly happy with the results. It would certainly be interesting to see what other people's thoughts are, and their varying mileage with the UniFi series.
