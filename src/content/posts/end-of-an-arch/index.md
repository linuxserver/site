---
title: End of an Arch
date: 2022-05-09T12:00:00Z
author: spad
tags:
  - linux
  - docker
  - news
  - armhf
  - deprecation
  - arm
hero: ./arm-processor.png
---

Did you know it's been 11 years since ARMv8 was introduced? And 6 years since the release of the Raspberry Pi 3 Model B, the first mainstream SBC to use it, making 64-bit ARM (aarch64) devices available to just about anyone who wanted one? Well it has. At this point it's all but impossible to buy 32-bit-only ARM hardware and consequently things are not looking great for the future of 32-bit computing on ARM. It's not just ARM, of course, x86_64 has been the defacto standard for over a decade now and with Windows 11 Microsoft have finally dropped 32-bit support entirely (Windows Server dropped support way back in 2009).

Given all this, why do we still produce armhf images for (almost) all of our containers? The short answer is Raspbian (now [Raspberry Pi OS](https://www.raspberrypi.com/software/)). Until *February this year* there was no stable 64-bit release of Raspberry Pi OS and that meant that the majority of people who bought a Pi ended up unwittingly running a 32-bit OS, even though there were plenty of 64-bit alternatives available such as [Ubuntu](https://ubuntu.com/raspberry-pi), [SUSE](https://documentation.suse.com/sles/15-SP1/html/SLES-rpi-quick/index.html), and even [Arch](https://archlinuxarm.org/platforms/armv8/broadcom/raspberry-pi-4).

If you've been with us for a while you're probably aware of the [libseccomp](https://docs.linuxserver.io/faq#libseccomp) issue that affected our 32-bit ARM (armhf) images when Ubuntu Focal was released. Nobody wanted to port the fix to the older 32-bit platforms because it just wasn't seen as worth the effort. MongoDB dropped support for 32-bit platforms with version 4.x which necessitated our [forthcoming deprecation](https://info.linuxserver.io/issues/2021-11-25-unifi/) of the armhf version of our Unifi Controller container. Alpine no longer builds new Java packages for 32-bit platforms, leaving armhf stuck with version 8 of the JRE. Across the ecosystem, distros and projects are starting to deprecate, or entirely drop support for, 32-bit ARM and that leaves us in a difficult position; we've already had to drop armhf support for a number of images in recent months in order to keep the other architectures up to date and secure.

Thanks to [Scarf](/blog/unravelling-some-stats/) we know that around 2/3 of our ARM users are still on 32-bit platforms, but it's going to become more and more challenging to maintain support for armhf images as software continues to demand modern dependencies that aren't being ported to the platform. Consequently, we are adjusting our policy such that we will no longer go out of our way to support armhf where doing so requires significant deviation from the x86_64 and aarch64 versions. This includes situations where we would have to use an older base image, older packages, or compile dependencies from source in order to get a functional armhf image. Additionally we won't commit to providing armhf images for new containers. Longer term we will inevitably have to drop support for armhf entirely, but that's not something we can predict a timeframe for with any accuracy and so we won't attempt to. We'll keep offering armhf support for images as long as we practically can, but that may be sooner rather than later.

We'll continue to announce all deprecations via our [news feed](https://info.linuxserver.io) when these decisions are reached.

If you're currently using our armhf images what are your options?
 * If you're not sure what architecture you're on, run `uname -m` from a terminal session - a response of `armv7l` or `armhf` means you're running a 32-bit kernel.
 * If your hardware is ARMv8 and offers support for 64-bit, such as the Pi 3 or 4, or Zero 2 W, then look to migrate to a 64-bit OS such as one of those mentioned above. Avoid the temptation to just upgrade the kernel to 64-bit and continue with 32-bit userspace apps because we know this causes issues.
 * If your hardware is ARMv7 or ARMv6 you don't have a lot of options other than replacing it or accepting the risk and inconvenience of remaining on old versions of the images, the hardware simply doesn't support 64-bit.

We know this probably isn't what you want to hear, but unfortunately technology marches forward and 32-bit is on life support. Hopefully by providing as much notice as possible you'll have time to find a solution that works for you.
