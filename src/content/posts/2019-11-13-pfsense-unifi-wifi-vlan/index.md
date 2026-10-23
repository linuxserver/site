---
title: Setup Pfsense & Unifi with Guest Wifi VLAN
date: 2019-11-14T01:00:00Z
author: chbmb
tags:
  - pfsense
hero: ./featured.jpg
---

Setup Pfsense & Unifi with Guest Wifi VLAN

### My need for a guest network

One thing I did miss about my old Asus DSL-AC68U when I switched to pfsense was the ability to have a guest network, so visitors to our house can be given an easy to remember WiFi password and a dedicated WiFi network that is unable to access my LAN and therefore reduces the risk of malware getting introduced to my machines.  If you'd seen my Father-In-Law's Windows PC with his penchant for entering online competitions and the sorts of sites that entails you'd understand my concerns.

### Unifi AC Lite

When I added two Unifi AC Lite access points to my network they natively have the ability to utilise a guest network, with a landing page and even utilise social network logins and bandwidth restrictions, this seemed a little too formal for my use case.  I have an unlimited internet connection and I'm more than happy for my friends and family who have often travelled a couple of hundred miles to see us to have unrestricted WAN access.

## How I set this up

Essentially this is in three places, my Unifi controller software, my managed switch webui, and pfsense itself.

### Unifi Controller

First of all I used the Unifi controller software to setup my new guest network, the SSID is identical to my existing WiFi network just appended with *-guest*  They use different passwords obviously.  The guest network is an easy to enter word, whilst the default network is something a little more complex.

Here's my default WiFi network

![](http://i.imgur.com/gP0d3z3.png)

And my guest network, (note the VLAN ID of 10)

![](http://i.imgur.com/qLWMeHb.png)

### Switch

The switches I've been using I've been really pleased with, they are the [TP-Link TL-SG108E](http://uk.tp-link.com/products/details/cat-41_TL-SG108E.html), I've got the V2 switch which has all it's configuration via a webui.  I believe the V1 switches needed a utility that was only available for Windows, which is no use to me as I'm using Antergos as my operating system.  These switches feel premium in the hand, with an all metal construction and are reasonably priced so well within the home users budget.

So logging into my TP-Link webui and go to **VLAN=>802.1Q VLAN** Enable the VLAN configuration, and enter a VLAN ID of `10` and a VLAN name of `guest` then tag whichever port your Unifi is connected to and click **Add/Modify**

![](http://i.imgur.com/rZSBkFM.png)

### Pfsense

Now this bit is the meat and potatoes, Got to **Interfaces=>(assign)=>VLANs** and create a new VLAN with the parent interface being your LAN interface and a tag of `10`

![](http://i.imgur.com/mGGA9ce.png)

Then go back to **Interface Assignments** and add the VLAN interface you just created.

![](http://i.imgur.com/bZdLmiH.png)

Then click on the newly created interface to configure it.  I named it `guest`and decided to use `192.168.10.0/24` as my IP addresses for this interface.  Now my pfsense instance is on my LAN with a IP address of `192.168.0.254` so I gave it a static IP on the guest network of `192.168.10.254`

![](http://i.imgur.com/GTtBLl8.png)

Next, go to **Services=>DHCP Server=>Guest** and configure the DHCP server.  I've only changed the options in the picture.  Set them up to suit your needs.

![](http://i.imgur.com/TkUZxlz.png)

Now it's time to lockdown that VLAN, so it can't get to the LAN or the webui for pfsense.

First of all create an alias **Firewall=>Aliases** add new, and enter the IP address for your pfsense webui on both the LAN and Guest VLAN.

![](http://i.imgur.com/74K6WRl.png)

Now we're ready to create the three rules necessary to prevent traffic on the VLAN getting to LAN or the pfsense webui.  Go to **Firewall=>Rules=>Guest** and add a new rule, filling it in like below.  This will stop access to the pfsense webui.

![](http://i.imgur.com/VoBNnZn.png)

Next, we're going to allow IPV4 WAN access, but prevent access to LAN by inverting the Destination rule.

![](http://i.imgur.com/fILF6Qm.png)

Finally, copy this rule, and instead change the Address Family to IPV6.

And there you have it, a simple guest network for friends and family to use without the risk of malware on your home network.
