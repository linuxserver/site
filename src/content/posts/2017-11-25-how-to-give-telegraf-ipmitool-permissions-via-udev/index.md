---
title: How to give Telegraf non-root user IPMITOOL permissions via udev
date: 2017-11-25T22:50:00Z
author: IronicBadger
tags:
  - how to
  - linux
  - arch linux
---

In order to use ipmitool to gather metrics as part of my Telegraf, Grafana and InfluxDB (TIG) setup (read more about how I set that up [here](https://www.linuxserver.io/p/f51a98a2-0b67-4f3a-90b4-7e53d8ceac8a/)) I needed to find a way give non-root access to run `ipmitool`.

The solution turned out to be quite simple in the end. Modify a udev rule to give the `telegraf` group permission to access the kernel module `ipmi`.

I added the following content to `/etc/udev/rules.d/10-telegraf-ipmi.rules`...

    KERNEL=="ipmi*", MODE="660", GROUP="telegraf"
    

Reboot and done.

This was tested on a Supermicro X11SAE-F on Arch Linux but should work on anything that can utilise `ipmitool`.
