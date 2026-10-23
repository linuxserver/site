---
title: "Huge VFIO news: Project Looking Glass released!"
date: 2017-12-14T15:37:00Z
author: IronicBadger
tags:
  - linux
  - kvm
  - qemu
  - vfio
  - lookingglass
  - pcipassthrough
  - gpupassthrough
hero: ./featured.jpg
---

In the world of PCI passthrough few things have excited me more than the release of the new Looking Glass project from `gnif` over on the Level1tech forums.

[https://github.com/gnif/LookingGlass](https://github.com/gnif/LookingGlass)

This project will allow you to capture the rendered frame output from your GPU in a Windows guest to a shared area of memory. Then, using magic, read the display output from the shared area of memory to display it on your Linux system.

> This is using the same technology made 'famous' by the 8 gamers 1 cpu video from Linus.

Think of it like this. Normally, your graphics card renders frames and outputs them via HDMI. Instead (in addition actually) of doing this Looking Glass sends the rendered frames to memory where they are read by your Linux system.

What this means in practice is that your entire Windows guest can now be projected, with less than 1ms latency, into your Linux system. Need Adobe? Ok, cool I'll just hop onto this window over here.

The project has high ambitions and they are actively investigating all sorts of cool extra features and adding polish all the time. I'll be doing a write up over the holidays on how you can get stuck in but there are instructions on Github if you're feeling adventurous!
