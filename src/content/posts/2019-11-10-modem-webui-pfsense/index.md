---
title: How to access your modem webui whilst using pfsense
date: 2019-11-11T00:13:00Z
author: chbmb
tags:
  - pfsense
hero: ./featured.jpg
---

I recently upgraded my entire home network setup.  This involved replacing my Asus DSL-AC68U modem/router with a pfsense box and a Draytek Vigor 130 modem.

Without going into too much detail, my home LAN is on `192.168.0.0/24` and my pfsense box has an ip address of `192.168.0.254` but my Draytek modem has an ip address of `192.168.2.1`

I wanted to retain the ability to access the Draytek webui to upgrade firmware and check sync speeds and such like.

It's pretty straightforward to do, but I didn't find it that intuitive initially.

## Setup a new interface

**Interfaces=>(assign)** and add a new interface using the same physical interface that your WAN connection uses.  Like in the picture below.

![](http://i.imgur.com/TxDqMrl.png)

Then click on it to configure it.

Give it a static IP on the same subnet as your modem, for me that subnet is `192.168.2.0/24` so I chose an IP address of `192.168.2.254` but it can be anything you want as long as it is different to your modem's IP address.

![](http://i.imgur.com/XAzd24O.png)

### Setup NAT rule

Now we're going to setup a rule directing LAN traffic to be able to access the modem webui.  Go to **Firewall=>NAT=>Outbound** and create a new rule above all the others and configure it like so.  Source should be the Network your LAN is on, mine is `192.168.0.0/24` and destination should be the subnet your modem is on, mine is `192.168.2.0/24`

![](http://i.imgur.com/VmhEDBQ.png)

Here's a picture of my outbound NAT rules.

![](http://i.imgur.com/G7cT4Ns.png)

## Test it all works

Hey presto...

![](http://i.imgur.com/fh4EjAt.png)
