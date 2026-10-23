---
title: "Review: QNAP TS-251A"
date: 2017-04-30T15:29:00Z
author: j0nnymoe
tags:
  - review
  - docker
  - QNAP
  - NAS
hero: ./featured.png
---

Welcome to our review of the QNAP TS-251A, something new here at LSIO. We reached out to QNAP to request a review unit and they kindly provided one to support the development of our open-source docker containers. This initial review will cover the hardware, the QNAP software and some information about the docker functionality of this device - more on this in a future article.

![](/content/images/2017/03/C6bbzU_WYAAEQHW.jpg)

There are already plenty of decent reviews on this product ([Hexus](http://hexus.net/tech/reviews/network/96571-qnap-ts-251a/) & [SmallNetBuilder](https://www.smallnetbuilder.com/nas/nas-reviews/33013-qnap-ts-x51a-series-reviewed)) and we mainly want to focus on how-to guides concerning docker usage. However, here are our thoughts...

> Once again, we would like to thank QNAP for sending this device to further development and support of our [docker containers](https://tools.linuxserver.io/dockers).

## The Hardware

The specifications of the [TS-251A](https://www.qnap.com/en/product/model.php?II=239) are as follows:
**Price**[£268.80](https://www.amazon.co.uk/QNAP-TS-251A-2G-Desktop-Attached-Enclosure/dp/B01K6TWQD8) (Apr '17 - Excluding Postage)
            **CPU** 
                Intel® Celeron® N3060 dual-core 1.6GHz (up to 2.48GHz)
            **RAM** 
                2GB DDR3L (2 x 1GB) (Expandable to 8GB)
            **Storage** 
                Not-Included
            **Connectivity** 
                2 x Gigabit Ethernet

                3x USB3 (Front: 1, Rear:2)

                SD Card Reader

                HDMI + other multimedia ports
            
The build quality of the box itself seems very good. The hard drive trays are a little flimsy but once you install your drives this isn't a problem. 
![](/content/images/2017/04/TS-251A_Hot-swappable.png)
All the ports on the back of the device are clearly mapped out and aren't bunched together to make it awkward when connecting/disconnecting cables.
![](/content/images/2017/04/TS-251A_Back.png)
In terms of noise levels, I have the device running beside my N54L server and I haven't noticed any increase of noise levels. The only time you really hear it is when you first turn it on or during a reboot when it does beep alerts to warn you something is happening.

A no fuss, no frills enclosure then. For most people I'd imagine this will sit alongside their ISP provider router or similar, on show. For these purposes the design is good enough but it's a white rectangular box with blinkies on the front - I'd love someone to give this thing a touch of class. Maybe some higher quality materials? A machined aluminium enclosure? Matte black anyone? Maybe something that wouldn't look out of place in Batman's cave. Matte black all the things.

## The Software

Setup of the TS-251A was straight forward. The device runs Linux, a tick in our book. Interaction with the device is primarily achieved via a web interface named "[QTS](https://www.qnap.com/en/qts4/con_show.php?op=showone&amp;cid=1)", unique to QNAP devices.

When you first power on and connect to the web interface of the NAS, you are presented with a setup wizard. Multiple screens guide you through the configuration of stuff such as the device name/admin user information/time+date. During this process you can also configure your drives but I chose to skip this step and delved into the QTS OS first before doing so. Upon completing the wizard, I was asked to update the QNAP software which I agreed to and it took about 5-10mins from start to finish.

![](/content/images/2017/04/chrome_2017-04-29_13-58-58.png)

The possibilities of what you can do with this device are endless thanks to QNAP's App Center. From managing data backup to having it as the center of your HTPC setup to hosting development/collaboration software.

> The Container Station UI on the QNAP is excellent, it's slick and clean/simple to use. It supports both docker and [LXC](https://en.wikipedia.org/wiki/LXC) containers.

![](/content/images/2017/04/chrome_2017-04-29_14-08-30.png)

I like how with Container Station, the "Create Container" wizard is nice and simple to follow. This suits newbies and veterans to containers alike. There is no way of easily updating the container images (that I found) which means you must destroy/re-create the container to pull the latest version.

## Summary

After using the QNAP TS-251a couple of days for various things (setting up different containers + troubleshooting them) I can honestly say that this is an excellent device. Whether you are taking your first steps into the NAS market or need this as an additional device for your business or homelab. I have not personally tested the HDMI output from the QNAP but it opens up some interesting possibilities for Kodi or Plex usage direct from the device.

8/10
Top NotesConsiderations
- Quiet Operation
- Small
- Many options within QTS to do many jobs
- HDMI out option is a boon

- May outgrow the 2 HDD bays
- CPU may be weak if using for heavy tasks
