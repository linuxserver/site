---
title: How To Run Pfsense with PIA VPN, but still use Plex Remote Access...
date: 2017-05-01T22:21:00Z
author: chbmb
tags:
  - pfsense
  - vpn
  - plex
  - how to
hero: ./1xwuapp.png
---

We've done a couple of articles about Pfsense hardware recently.  With the Snooper's Charter arrival in the UK and our American brethren about to have their browsing data sold to the highest bidder, it comes as no surprise that usage of VPN services is increasing to try and maintain a semblance of privacy regarding our internet usage.

At linuxserver, I've lagged behind the others in my implementation of a VPN due to time constraints and concerns regarding the ability to share my Plex library with my family.

I've finally found some time to look into this and after one or two hiccups, as a new Pfsense user I've finally managed to set things up in a way that works for my use case.

## First Steps

Get your VPN from PIA up and running with their rather excellent guide [here](https://www.privateinternetaccess.com/pages/client-support/pfsense) .  I see no point reproducing it here.

Although as an addendum as pointed out by [/u/ChronicledMonocle](https://www.reddit.com/r/PFSENSE/comments/61nqso/guide_pfsense_with_private_internet_access_and/) on Reddit the one thing the PIA guide does leave out is the need to create a new interface for the VPN connection.  So go to **Interfaces=>(assign)** and assign the OVPN to a new interface, I called mine PIA.

![](http://i.imgur.com/1xvQclH.png)

Just to show there's no further config necessary of this interface.

![](http://i.imgur.com/er4lIAH.png)

## How to bypass VPN for Plex Server connections to plex.tv

Go to **Firewall => Aliases** and add a new alias like so.

![](http://i.imgur.com/1xWUAPP.png)

Save and apply the setting.  Then if you go to **Diagnostics => Tables** and select `plextv` you can confirm that the IP addresses of plex.tv is stored in the table.

![](http://i.imgur.com/F4qNGzs.png)

Next step is to use this Alias to bypass your VPN. So go to **Firewall => Rules => LAN** and add a new rule, like so.  Note I have put the LAN IP Address of my Plex Server in the source, and the alias, `plextv`, in the destination.

![](http://i.imgur.com/4mgnOle.png)

Before you click **Save**, Display the Advanced Options and alter the **Gateway** to be your WAN (Non-VPN) connection.

![](http://i.imgur.com/hV1sFM8.png)

## Set Up Port Forward

Go to **Firewall=>NAT=>Port Forward** and create a new rule, ensuring the port is the correct one you have specified in the Plex Server webui and it's pointing to your Plex Server IP address.  This will also automatically create a corresponding inbound firewall rule directing external connections from WAN to your Plex server.

![](http://i.imgur.com/8xtonpR.png)

## Check it's all working....

Go to your Plex Server webui and look in Remote Access.  You should find the public IP address is that of your non-VPN WAN connection.

![](http://i.imgur.com/ODm7w5y.png)

## Edit (07/05/17)

linuxserver.io member, aptalca, ran into some issues with the webapp on his LAN not showing that the Plex server was local.  This is fixed by going to **Services=>DNS Resolver** Then selecting **Display Custom Options** and pasting in:

    server:
    private-domain: "plex.direct"
    

## Credits

I originally followed a guide from [/u/ChronicledMonocle](https://www.reddit.com/r/PFSENSE/comments/61nqso/guide_pfsense_with_private_internet_access_and/) on Reddit, from there it was just a matter of setting up an Alias.  Also got to give credit to a couple of the Plex devs, gbooker and ziggimon for giving me some insights into what happens behind the scenes with Plex Remote Access.
