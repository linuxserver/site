---
title: "Review: Jetway JBC313"
date: 2017-02-14T03:34:00Z
author: j0nnymoe
tags:
  - review
  - hardware
  - pfsense
  - router
  - vpn
  - firewall
hero: ./3607-02xl.jpg
---

As discussed in the [APU2 Review](/blog/2016-12-17-review-pcengines-apu2-c4-prebuilt-by-linitx/), the IP Bill has now been passed as law in the UK. Here is another solution that can be used as a pfSense router, the Jetway JBC313.

## The design and hardware
**Price**[£210.00](http://www.mini-itx.com/~JBC313) (Jan '17 - Excluding Postage)
            **CPU**[Intel Celeron N3160 Quad-Core (up to 2.24 GHz)](http://ark.intel.com/products/91831/Intel-Celeron-Processor-N3160-2M-Cache-up-to-2_24-GHz)**RAM** 
                Not Included - Max 8GB
            **Storage** 
                Not Included
            **Connectivity** 
                2x Intel I211-AT Gigabit Ethernet

                4x USB3 (2 Front / 2 Rear)

                2x HDMI / 1x DisplayPort

                Serial Console

![](/content/images/2017/02/3607-02XL.jpg)
The JBC313 is a fantastic barebones kit to get your own router platform setup. It is a completely fanless system in which its whole case is used as a [massive] heatsink. For my build I also purchased a [60GB Kingston SSD](https://www.amazon.co.uk/gp/product/B00COFMPAM/) and [4GB RAM](https://www.amazon.co.uk/gp/product/B005LDLV6S/) so there is plently of grunt there to manage a fair sized network, possibly slightly overkill for a home network.

The N3160 is a fairly new kid on the block in the terms of Celeron processors and has features such as Multiple Display Outputs/USB3/Low TDP. The feature I was mainly interested in was the AES-NI support it provides and the Dual Intel NIC's. This is important for OpenVPN usage as it is used to encrypt/decrypt the packages that are sent/received.
![](/content/images/2017/02/3607-04XL.jpg)

While not as slimline as the APU2, the design of the Jetway JBC313 is incredibly small considering what is packed inside. I was worried about how much heat this tiny box would generate but I haven't seen the temps rise above 50C under load, so considering it's fanless design, I'm extremely happy with this.

## Software

There are many software options for running a firewall (pfsense / opnsense / ipfire / Sophos UTM to name a few) but for the time being I have chosen to install pfSense on this box to replace my ISP provided modem/router solution. At the time of writing this article, I've had to install version 2.2.6 due to an [IGMP Proxy bug](https://forum.pfsense.org/index.php?topic=117753.0) that is currently stopping me from getting my IPTV working that is provided by my ISP.

## VPN Perfomance

Now for the meat and gravy of the review: how this device performs with OpenVPN under load. I had previously tested the APU2 on my line which I found that I was unable to saturate my 80mbit line - it would max at around 65mbit. With the nature of the internet only getting faster, I decided to spend a little bit more than what the APU2 cost to get something that will cover me in the future.

From the tests I have done of the OpenVPN performance, I have found that when doing a speedtest (using [speedof.me](http://speedof.me), OpenVPN peaks around 70% on 1 core as at the time of writing this, OpenVPN is currently not multi-threaded.

![](/content/images/2017/01/speedtest.gif)

As you can see above, this is a live capture of how the CPU performs under a speed test.

## OpenSSL Benchmarks

As OpenVPN uses the OpenSSL libraries, you can do provisional benchmarks to see how well your hardware will perform when handling OpenSSL data. To test this on the JBC313, I have ran the following commands and shown the results below:

###### Without AES-NI

    openssl speed aes-128-cbc  
    

    The 'numbers' are in 1000s of bytes per second processed.
    type             16 bytes     64 bytes    256 bytes   1024 bytes   8192 bytes
    aes-128 cbc      27572.70k    31131.71k   32405.58k   79054.80k    80527.36k
    

###### With AES-NI

    openssl speed -evp aes-128-cbc  
    

    The 'numbers' are in 1000s of bytes per second processed.
    type             16 bytes     64 bytes    256 bytes   1024 bytes   8192 bytes
    aes-128-cbc      35356.72k    112992.77k  451677.39k  2967429.12k  14116803.93k
    

As you can see from the results, there is a massive improvement when running the same command with AES-NI enabled. If you would like any other benchmarks run on this hardware, please leave a comment below and I will look into it.

## Summary

The JetWay JBC313 is a fantastic barebones kit. It has lots of options in terms of general usage; for example it could be used as an HTPC or even a light use desktop. Over the past weeks I have been thinking that I wished I had ordered 8GB RAM and a bigger SSD but only because I have been wanting to test out a few other firewall operating systems and this would be easier having ESXi installed. I could still do this with the 4GB RAM / 60GB SSD but it could become limiting quickly.

9/10
Top NotesConsiderations
- Small / Compact
- Silent
- Not restricted to just firewall

- Get the JBC323 if 2.5" install is required
- Extremely bright LED

*Images from [mini-itx.com](http://www.mini-itx.com/~JBC313)*
