---
title: Citrix Receiver 13.1 (ICAClient) on Arch Linux
date: 2015-07-17T14:56:00Z
author: IronicBadger
tags:
  - arch
  - citrix
  - gotchas
  - guide
  - how to
  - icaclient
  - receiver
hero: ./image.png
---

![Citrix Logo](/content/images/2016/09/image.png)

I recently decided to wipe my work laptop of Ubuntu and put Arch Linux on there. It isn’t sanctioned by enterprise support so I was on my own to get things up and working. For the most part, it was painless except for the Citrix client. Here are the gotcha’s I had…

## Installation

Actually this was surprisingly simple after I eventually elected to ignore the options available in the AUR (broken or simply didn’t work).

First download the `.tar.gz` from Citrix at [https://www.citrix.com/downloads/citrix-receiver/legacy-receiver-for-linux/receiver-for-linux-131.html](https://www.citrix.com/downloads/citrix-receiver/legacy-receiver-for-linux/receiver-for-linux-131.html).

    tar -xvf linuxx64-13.2.0.322243.tar.gz 
    ./setupwfc
    

Follow the instructions in the wizard to install. I installed to `/opt/Citrix/ICAClient` but you can install anywhere you like.

#### SSL Error 61

To solve this error was straightforward enough…

    sudo ln -sf /etc/ssl/certs/* /opt/Citrix/ICAClient/keystore/cacerts/
    

## Login

You should probably have a working setup now, I use Firefox to launch my sessions as I’ve found this has easier integration than Chrome. It also means I don’t need to have Chrome open all day and can actually get some work done without the family bothering me on Hangouts!

## The (annoying) Seamless Fullscreen Issue

I lost about an hour to this, in the end, trivial fix. If your client won’t respect the settings you set in the webUI for non-seamless or % of the screen modes then you need to edit some config files.

I messed about with `DesiredVRes` and `DesiredHRes` and even some other things but nothing worked until eventually I reset the file defaults and edited `UseFullScreen=False`.

Then, finally the Citrix client would maximise in a window on only one monitor allowing me to have Linux on one and Windows with all it’s Outlook crap in the other.

Hope this saves you some time down the road. Citrix, your docs are terrible.
