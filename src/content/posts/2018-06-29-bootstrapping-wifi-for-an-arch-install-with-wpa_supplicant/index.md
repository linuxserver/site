---
title: Bootstrapping WiFi for an Arch install with wpa_supplicant
date: 2018-06-30T01:51:00Z
author: IronicBadger
tags:
  - arch linux
  - arch
  - linux
hero: ./featured.jpg
---

It's quite easy to get tied in knots when dealing with the early stages of an Arch install because you're offline. So what do you do about this? Get online ASAP. Sometimes via ethernet, sometimes WiFi is the only option. Here's a quick set of instructions including a couple of gotchas that might help you.

This guide was written with Arch in mind but will just as well work with any modern Linux distro.

## TL;DR

    killall dhcpcd wpa_supplicant
    wpa_passphrase SSID passphrase > /etc/wpa_supplicant/interface-name.conf
    wpa_supplicant -B -i interface -c /etc/wpa_supplicant/interface-name.conf
    dhcpcd interface
    

## Fresh start

Either reboot or killall any leftovers from your previous hacking to ensure you begin with a clean slate. Common things are:

    killall dhcpcd wpa_supplicant
    

## Generate a configuration

On my Thinkpad the wifi interface is named `wlp58s0`. I can find this with `ip link` and looking at the available devices.

I know the SSID and passphrase of the wifi in question. I also know it is WPA2. Using `wpa_passphrase` we can generate the required config.

    wpa_passphrase SSID passphrase > /etc/wpa_supplicant/interface-name.conf
    

## Connect

Then using `wpa_supplicant` itself supply `-B` for background mode, `-i` for the target interface and `-c` for the config file.

    wpa_supplicant -B -i interface -c /etc/wpa_supplicant/interface-name.conf
    

Then use `dhcpcd` to grab an IP address and you should be set.

    dhcpcd interface
    

Happy hacking.
