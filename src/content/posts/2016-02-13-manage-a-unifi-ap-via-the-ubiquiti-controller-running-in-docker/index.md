---
title: Manage a Unifi AP via the Ubiquiti controller running in Docker
date: 2016-02-13T20:16:00Z
author: IronicBadger
tags:
  - adopt
  - docker
  - guide
  - how to
  - manage
  - ubiquiti
  - unifi
---

The Ubiquiti wireless access points are new to me but damn are they fantastic! Rather than logging into each AP via it’s IP directly, you are required to use the Ubiquiti controller software.

Wouldn’t it be fanastic if this software could run headless on your Linux server? Well you can using Docker ([linuxserver/unifi](https://hub.docker.com/r/linuxserver/unifi/)), this article will show you how. I’ll also cover adopting an AP which is already managed by another controller instance plus some cool network scanning tips to make this process even easier using `nmap`.

## Setting up the controller software in Docker

We’re going to be using Docker for this. I started writing this section but realised it ended up just being a repeat of the documentation included with the container on Docker hub. At LinuxServer.io we make a ton of Docker containers and UniFi just happens to be one of them, [linuxserver/unifi](https://hub.docker.com/r/linuxserver/unifi/).

Once you’ve got the container running just go to `https://serverIP:8443/` (note https) and from there it’s just the standard UniFi software.

## Adopt an already managed Access Point with a new controller instance

I set my Unifi AP up once 6 months ago and forgot about it. Last night though I wanted to perform a firmware update to fix some compatibility issues with my Nest thermostat. Of course, I didn’t have my original controller configuration around and so I found myself unable to manage my AP.

Using `nmap` I scanned all the available hosts on my LAN to find which were listening on port 22 (SSH).

    $ nmap 192.168.1.0/24 -p 22 -oG - | grep open
        Host: 192.168.1.2 (epsilon.ktz.local)   Ports: 22/open/tcp//ssh///
        Host: 192.168.1.137 (ktzXPS.ktz.local)  Ports: 22/open/tcp//ssh///
        Host: 192.168.1.251 (unifiap.ktz.local) Ports: 22/open/tcp//ssh///
    

Aha! I have the IP address `192.168.1.251` in this case. Time to SSH into the AP using the admin username and password you set months ago…

    $ ssh admin@192.168.1.251
    

Once you’re logged in, reset the AP to factory defaults.

    $ syswrapper.sh restore-default
    

The AP will now reboot, taking approximately 20 seconds. After that time has elapsed SSH into the AP again this time using the default username and password of `ubnt`.

    $ ssh ubnt@192.168.1.251
    

Then, run `mca-cli` followed by `set-inform`. Locate your controllerIP using the `nmap` trick from above but substituing port 22 for 8080. It’ll be the IP of the system running Docker.

    $ nmap 192.168.1.0/24 -p 8080 -oG - | grep open
        Host: 192.168.1.2 (epsilon.ktz.local)   Ports: 8080/open/tcp//http-proxy///
    
    $ mca-cli
    $ set-inform http://192.168.1.2:8080/inform
    

Next load up the controller software webUI on `https://serverIP:8443/` and adopt the AP as normal. Wait for the state to show as ‘disconnected’ at which you’ll need to reissue the `set-inform` command and second time.

    $ set-inform http://192.168.1.2:8080/inform
    

That’s it, you’re done. Your AP is is now adopted by a new instance of the Ubiquiti controller software, running in Docker.
