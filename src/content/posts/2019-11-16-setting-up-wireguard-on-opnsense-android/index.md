---
title: Setting up WireGuard on OPNSense & Android
date: 2019-11-17T01:25:00Z
author: chbmb
tags:
  - opnsense
  - wireguard
hero: ./featured.png
---

WireGuard has been causing quite a stir in networking over the last year or so, promising an easier way to manage VPN connections, and has some interesting benefits from my point of view.

**Note: All keys used shown in the screenshots are no longer in use and were created solely for the purposes of this post, no need to warn me, or try them out, I guarantee they've been nuked from orbit.**

Firstly, it doesn't drain my battery like OpenVPN on my phone, opening up the possibility to leave it connected for much longer periods.

Secondly, I have Adguard installed on a Pi on my LAN, so by using that as my DNS when connected to WireGuard, I get ad blocking when I'm out and about.

Thirdly I often have to connect to a public WiFi access point at work, yeah, yeah, I know, it's difficult to believe in this day and age that I don't have access to a staff designated WiFi network, but it is what it is.  I do however have occasion to use my laptop at work, and it would be useful to be able to access my LAN and my ever growing pool of services, and quite frankly, I don't want my traffic visible to all and sundry whilst I'm doing so, I previously used OpenVPN for this, but WireGuard is somewhat lighter on resources, so I decided to migrate.

## OPNSense

For a long time I have been using PFsense, however, they don't seem to have any impending plans to implement WireGuard, and the interface of OPNsense is prettier to my eye, so being the sucker to eye candy that I am, and keen to try out WireGuard, I decided to migrate.  Long story short, it's not difficult to migrate, but you can't import your PFsense configuration directly into OPNsense, so I used a multistep approach.

1. Virtualised my current PFsense instance
2. Wiped my bare metal PFsense instance and installed OPNsense
3. Manually migrated my PFsense configuration to OPNsense on bare metal.

The advantage of this was there was little risk of me leaving the family without a working internet connection and incurring the wrath of the wife, and it actually worked out so well, I've kept both the virtualised PFsense instance and also created a backup OPNsense virtual machine, which can utilise a backup of my settings from the bare metal install should I ever need to do so.

I'm not going to discuss the relative merits of one vs the other, as it's an emotive issue, but I will say that I don't have any regrets on my decision to migrate.  Here's a screenshot to feast your eyes on the beautiful UI.
![](/content/images/2019/11/wg6.png)
## Installing WireGuard on OPNsense

This was very straightforward, just go to `System => Firmware => Plugins` and click the `+` next to the `os-wireguard` in the Plugins tab.
![](/content/images/2019/11/wg1.png)
## Configuring WireGuard on OPNsense

Go to the newly installed `VPN => WireGuard` menu item (you may need to refresh your browser)

### Add your local machine

Select the `Local` tab and click `+` to add a new Local Configuration.
SettingConfigurationExplanationName`opnsense`You can name this whatever you likePublic Key*Leave blank*Will be auto-generatedPrivate Key*Leave blank*Will be auto-generatedListen Port`51820`Default port for WireGuard, you could use any portDNS Server`192.168.0.253`I used my Adguard Pi IP address on my LANTunnel Address`10.252.0.0/24`IP address for the OPNsense WireGuard TunnelPeers*Leave blank*You'll select these later, after you've added peersDisable Routes*Leave unchecked*You want routes to be allowed by your clients/peers
Click save, and you'll find that if you go back and edit the config, your private and public keys will have been generated for you.  As the picture below shows.
![](/content/images/2019/11/wire6.png)
### Add your peers

Select the `Endpoints` tab and click `+` to add a new Endpoint
SettingConfigurationExplanationEnabled*Checked*Self explanatoryName`phone`You can name this whatever you likePublic Key*Leave blank*We'll fill this in laterShared Secret*Leave blank*You can use Shared Secrets to make it more secure if desiredAllowed IPs`10.252.0.2/32`IP address for the peer WireGuard TunnelEndpoint Address*Leave blank*Your phone/laptop is unlikely to have a fixed IP or domain name associatedEndpoint Port`51820`Keep this the same as whatever port you used aboveKeepalive*Leave blank*A WireGuard tunnel will drop if not used, setting `20` here would ping the tunnel every 20 seconds to keep it up, downside being battery life would be decreased, so I elected to leave it blank, the connection will be re-establised when needed anyway
It should look like this, so click `Save` and you're good to go, just rinse and repeat for each client you want to add, just remembering to increment the Allowed IPs Tunnel each time, so the next client would be `10.252.0.3/24`

You can see in the screenshot below I've already filled in my Public Key, more on that later.
![](/content/images/2019/11/wire2.png)
### Select your peers

Now just go back to the `Local` tab and edit your config and select `phone` in the peers list.
![](/content/images/2019/11/wire7.png)
### Forward the WireGuard port

`Firewall => NAT => Port Forward`

We're now going to forward the `51820` port to the OPNSense machine allowing peers from WAN to access the WireGuard tunnel.
SettingConfigurationExplanationProtocolUDPWireGuard is a UDP based protocolDestinationWAN addressWe're forwarding a port to WANDestination port rangeSelect `other` and enter 51820Default WireGuard portRedirect target IP*Enter the LAN IP address of your OPNsense install*We want the traffic to reach the WireGuard tunnel on OPNSense![](/content/images/2019/11/wg10.png)
### Add your WireGuard Interface

Final step on OPNsense, we need to go to `Interfaces => Assignments` add a new interface, selecting `wg0` then edit it, I called it `WG` and don't forget to enable it.  

As tempting as it may be to call it `WireGuard`, there is already an interface called that, which as I understand it from [here](https://forum.opnsense.org/index.php?topic=10669.msg48674#msg48674) is automatically created, and is a group for all the WireGuard tunnels you may create.

So go to `Firewall => NAT => Outbound` and ensure you're running either `Automatic outbound NAT rule generation` or `Hybrid outbound NAT rule generation` I then found I needed a reboot of OPNSense after which my `WG` network appeared in the list of Automatic rules.
![](/content/images/2019/11/wg5-1.png)
## Setting up your Android Device

There are a couple of options to install WireGuard on your Android device, the two I know about are the official [WireGuard application](https://play.google.com/store/apps/details?id=com.wireguard.android) and [Viscerion](https://play.google.com/store/apps/details?id=me.msfjarvis.viscerion).

For this tutorial I'm going to use the official application, although in practice, setting them up is identical.

Download and install the app from the playstore, and open it.

### Add your WireGuard Interface

Then click the `+` icon and choose `Create from scratch`
SettingConfigurationExplanationName`opnsense`You can name this whatever you likePrivate keyClick `Generate`Public key*derived from private key*Addresses`10.252.0.2/32`IP address for the phone's WireGuard TunnelListen Port`51820`Keep this the same as the port you used in OPNsenseDNS Servers`192.168.0.253`Keep this the same as the DNS setting used in OPNsenseMTU*Leave blank*Is automatically taken care of![](/content/images/2019/11/wire5.png)
That's the WireGuard Interface added, so now click `Add Peer` to add your OPNsense peer

### Add your OPNsense Peer
SettingConfigurationExplanationPublic key*Discussed below*Pre-shared key*Leave blank*This is analogous to the *Shared Secret* parameter in OPNsenseAllowed IPs`0.0.0.0/0, ::/0`Forward all IPV4 & IPV6 traffic to this peerExclude private IPs*Leave blank*Clicking this would exclude private IP ranges from the WireGuard tunnelEnpoint`linuxserver.io:51820`You need a static endpoint to reach your OPNsense, either a domain name you have set up, or a static WAN IPPersistent keepalive*Leave blank*A WireGuard tunnel will drop if not used, setting `20` here would ping the tunnel every 20 seconds to keep it up, downside being battery life would be decreased, so I elected to leave it blank, the connection will be re-establised when needed anyway![](/content/images/2019/11/wire8-1.png)
## 
Public Keys

This is the only fiddly bit, you need a way to get your OPNsense public key onto your phone, and your phone public key onto your OPNSense machine, I used a text file I placed on a SMB share on my LAN where I copy and pasted the information to.  I'll leave it to your discretion on how you want to tackle this.

Once you've done that, you need to copy the OPNSense public key into the Peer setup on your phone, and the phone public key into the peer you created on your OPNsense install.

I have seen other WireGuard implementations, such as the excellent one on the current release candidate of Unraid which generates all of the private and public keys for both devices on Unraid and provides a QR code to easily add them to your peers, whilst this is very straightforward, technically, neither device should ever "see" the other peer's private key.

## Connect!

Simply open the WireGuard app on your phone and click the toggle, you should find it connects, verify by looking at your OPNsense install.
![](/content/images/2019/11/wire9-1.png)
## Port 53

After submitting this article to my colleagues for their review, aptalca mentioned an interesting "hack". 

He has found that often public WiFi networks often block all ports other than `80:TCP``443:TCP` & `53:UDP` for HTTP, HTTPS and DNS respectively. 

 The effect of this is that if you were connected to one of these WiFi networks, you'd be unable to connect to your WireGuard VPN.  His very simple, but exceedingly clever method of circumventing this is by running WireGuard on port `53`, which is also `UDP` and therefore not able to be blocked.

I was genuinely impressed by this, and have to admit, it's not something I would have thought of myself!
