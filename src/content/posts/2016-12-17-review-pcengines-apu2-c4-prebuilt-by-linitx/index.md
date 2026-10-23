---
title: "Review: PC Engines APU2 C4, prebuilt by LinITX"
date: 2016-12-17T17:09:00Z
author: Josh Stark
tags:
  - networking
  - pfsense
  - vpn
  - review
  - router
hero: ./img-20161203-160008.jpg
---

The [Investigatory Powers Bill has now passed as law in the United Kingdom](https://en.wikipedia.org/wiki/Investigatory_Powers_Act_2016), meaning the UK Government has been provided with a wider reach and fewer restrictions over their ability to track the home internet usage of every British resident. Now is the time to start considering a more robust solution to your home network, one with the capability to run under a VPN at firewall level. Enter the [PC Engines APU2](https://pcengines.ch/apu2.htm), a small yet powerful board designed specifically for small networking solutions.

![LinITX APU2 C4](/content/images/2016/12/IMG_20161215_183028_Cropped-2.jpg)

> It replaces your Home Hub, Sky router, or any off-the-shelf device without feeling out of place

Creating a home network can be a daunting task, especially when all you've known is a simple router/modem->switch set up. The idea of building what is effectively a PC to replace this is not something people generally consider. The APU2 solves this problem by providing you with an incredibly small form factor device that easily replaces any on-the-market router device, and even outperforms them.

## The design and hardware
**Price** 
                £221.34 (as of Dec 2016)
            **CPU** 
                AMD Embedded G series GX-412TC Quad 1GHz
            **RAM** 
                4GB embedded DDR3-1333 DRAM
            **Storage** 
                30GB Kingston mSATA SSD
            **Connectivity** 
                3x Gigabit Intel i210AT NICs

                2x USB3

                Serial
            
    </tbody>
    

The guys at LinITX have [done an excellent job](https://linitx.com/product/linitx-apu2-c4-4gb-3nicusbrtc-pfsense-msata-firewall-kit-black/14244) by building the board into a very sleek enclosure, giving it a real sense of purpose in the household. Its fanless and low profile design allows you to put it almost anywhere in the house without the fear of it feeling out of place. They have also provided a 30GB Kingston SSD, which naturally improves its read/write performance while keeping it as quiet as possible. It is refreshing to find a product like this that is not only built ready for consumer use but also looks the part. There are many other competitor devices out on the market that have some truly ghastly enclosures - advertised more as mini-ITX PCs than routers. In this case, just find a spot for it to live, plug it in, and you're ready to go.

Much like its predecessor, the APU2 provides a serial port for use with a Null Modem cable for diagnostics and installation, three Gigabit RJ45 NICs, dual USB3 ports, and a 12v DC power port. It is a no frills to the point device, which I really appreciate. Two things to note are the lack of power or hardware reset buttons - an odd omission - and the fact the power adaptor is not included. One would expect that the effort to pre-build this device would also include the ability to power the device as practically everyone purchasing it will want an adaptor. It feels like an obvious miss.

![Rear Ports](/content/images/2016/12/IMG_20161203_160008.jpg)

The core of this device is its AMD Embedded G series GX-412TC quad core CPU, clocked at 1GHz. One of the real selling points of this is its AES-NI compliance, which allows for hardware acceleration of OpenSSL crypto, giving this device an excellent VPN use-case.

The board itself also provides you with a mini-PCIe slot which can be used for a wireless interface card (which is not provided as standard by LinITX but can be bought separately). This will be a sticking point for some people as almost all modern routers have WiFi capability - adding on extra cost just to get that capability back is not ideal.

The C4 model of the APU2 comes with on board 4 GB DDR3-1333 DRAM which has proven more than adequate for general use (even under complete WAN saturation). The C2 model drops this to 2GB.

If this is a replacement for a Fibre router, it should be noted that many modern fibre routers come with a built-in VDSL modem. The APU2, while being an exceptional router replacement, does *not* contain a VDSL modem, so one will need to be used separately and linked to the WAN port.

## The software

LinITX have provided the APU2 with a full version of [pfSense Community Edition](https://pfsense.org/), with the WAN, LAN and OPT1 mappings already set to its three NICs. Half of the work has been done for me, so all I needed to do was configure my ISP's settings and DNS servers. pfSense is a topic in its own right, so I will not go into detail about it here.

## VPN Performance

Depending on the speeds given to you by your ISP, the APU2 is potentially capable of completely saturating your line when connected to a VPN. In my case, I have a 40/10 fibre connection. Running a test that peaked my actual download speed at 4.1MB/s, the device was running at 60% capacity. This means I am able to make full use of my provided internet speeds without hitting a CPU bottleneck. Running the same test again, without traffic being routed through a VPN, showed almost 0% CPU usage, as should be expected.

![Network under full saturation](/content/images/2016/12/pfSense_VPN_Saturated-1.png)

Unfortunately, the already high 60% usage does mean that those with 80/20 lines will start to see a CPU bottleneck at around the 67-70Mbit/s mark. It is at this point that even the hardware accelerated crypto is not able to keep up with the network demand, thus slowing your final connection speed down. This is important to understand because any VPN connection you make is going to be encrypted. Not only is there going to be a slight connection overhead, the physical task of encrypting/decrypting the data as it passes through the router is also going to have an effect.

Further OpenSSL tests do show its grunt when making use of its hardware crypto functionality. Without AES-NI detection in place:

    openssl speed aes-128-cbc
    

    The 'numbers' are in 1000s of bytes per second processed.
    type             16 bytes     64 bytes    256 bytes   1024 bytes   8192 bytes
    aes-128 cbc      14198.50k    15113.15k   15359.49k   39251.79k    39829.50k
    

Then once more but with AES-NI detection in place:

    openssl speed -evp aes-128-cbc
    

    The 'numbers' are in 1000s of bytes per second processed.
    type             16 bytes     64 bytes    256 bytes   1024 bytes   8192 bytes
    aes-128-cbc      15295.29k    39295.41k   203008.41k  774694.71k   4920967.17k
    

A phenomenal difference in the amount of data read in the allotted time per test. It is quite clear that the APU2 is up to the challenge.

> It's all about the cryptographic performance

Crypto performance under load comes at a premium, and with that in mind it is easier to understand the perceptibly high asking price of **£220** but one must keep in mind that this is a *built system* ([the cost of the naked board alone is £162](https://linitx.com/product/pcengines-pc-engines-apu2-c4-system-board-with-4gb-ram/14822)). This is not the price someone just entering the market is expecting to pay, which can lead to it being off putting. However, this isn't the hardware you find in day to day consumer routers (especially those provided for free by ISPs), which helps justify the cost, even if it is intimidating to a first-time tinkerer.

Based on the time I have had with the device so far, the price does feel proportional to its quality and performance throughput; you just need to be willing to understand *why* it is more expensive than even the advertised *elite* consumer routers: it's all about the cryptographic performance.

## Summary

The LinITX build of the APU2 is an ideal device for those looking to replace their aged or ISP-provided routers with something more prepared for the VPN age. Its sleek look makes it feel like it *belongs* in your living room, rather than hidden away. Its quiet operation makes for zero annoyance, and ample CPU power provides you with exceptional network performance as well as room for great VPN performance at firewall level. It should be noted however, while connected to a VPN the APU2 will struggle with WAN speeds above 70Mbit/s. It is quite clear in my testing that anyone with an 80Mbit/s connection will not receive full network saturation when under a VPN. It is considerably more expensive than a standard router, however its hardware will likely outperform all off-the-shelf solutions when under VPN. It is a shame, though, that it cannot make full use of a 80/20 connection.

A device that is greater than the sum of its parts, the APU2 requires a more considered approach for installation; with no in-built VDSL modem or installed wireless card, the task of replacing an all-in-one router includes the extra hassle of buying a separate modem and wireless AP (or micro-PCIe card). However, it's unfair to wholly place the blame on the APU2 as it is a specialist piece of hardware. There is an obvious focus on performance under VPN load, which most routers will not handle.

The APU2 successfully bridges the gap between enterprise and consumer hardware, opening the door to a world of home networking opportunities. This set up will be more expensive but the reward of knowing your connection is not only secure but also unimpeded will, in the long run, pay dividends.

8/10
Top NotesConsiderations
- Small form factor
- Completely silent
- Excellent candidate for use with a VPN on <60Mbit/s connections
- Pre-installed pfSense saves you a job

- Entry level pfSense device, not a standard consumer product.
- Internet speeds above 70MBit/s will never reach saturation when under VPN
- Power adaptor must be bought separately
