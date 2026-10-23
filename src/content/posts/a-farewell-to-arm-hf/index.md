---
title: A Farewell To Arm(hf)
date: 2023-04-06T12:00:00Z
author: Spad
tags:
  - linux
  - docker
  - armhf
  - announcement
  - deprecation
  - arm
hero: ./banner-armhf.png
---

### The State of Play

As we wrote [almost a year ago now](/blog/end-of-an-arch/), 32-bit Arm has been on life support for a while, and you may have noticed that none of the new images we've released in recent months have offered 32-bit Arm (armhf) versions, and a number of older images have dropped support over the same period. This has been part of our "soft deprecation" of the architecture, as it has become more and more difficult to support with contemporary applications.

Last week, Raspberry Pi OS [started defaulting to a 64-bit kernel on boot](https://github.com/raspberrypi/linux/issues/5402), if the hardware supports it, which was possibly not the most graceful way to handle things, but here we are. What this means is that, essentially, 32-bit Arm has transitioned from "on life support" to "doomed"; there is obviously still hardware out there that doesn't support 64-bit, but the single biggest pool of users who *can* move to 64-bit is now having it (sort of) done for them.

### What Now?

A year ago, around 2/3 of our Arm users were still on 32-bit platforms, today it's less than 1/5, and consequently we have taken the difficult decision to formally deprecate 32-bit Arm builds from 2023-07-01. Due to the number of images and how our build pipelines work there's going to be some wiggle room here, but essentially from the 1st of July 2023 we will no longer support any 32-bit platforms.

Old images will continue to work, but will not receive application or OS updates, and we will not provide support for them. Additionally, the `latest` and `arm32v7-latest` tags will no longer work for 32-bit Arm, you will need to provide a specific version tag if you wish to pull one of the old images.

If you're currently using our 32-bit Arm images, what are your options?

* If you're not sure what architecture you're on, run `uname -m` from a terminal session - a response of `armv7l` or `armhf` means you're running a 32-bit kernel.
* You may also have a 64-bit kernel with a 32-bit userspace, especially if you're running an OS like LibreELEC or OSMC, which likely means a 32-bit Docker install. Running `getconf LONG_BIT` will give you a response of `32` if this is the case.
* If your hardware is Armv8 and offers support for 64-bit, such as the Pi 3 or 4, or Zero 2 W, then look to migrate to a 64-bit OS.
* If your hardware is Armv7 or Armv6 you don't have a lot of options other than replacing it or accepting the risk and inconvenience of remaining on old versions of the images, the hardware simply doesn't support 64-bit.

As before, we know this probably isn't what you want to hear, but unfortunately technology marches forward and 32-bit is doomed. Hopefully by providing as much notice as possible you'll have time to find a solution that works for you.
