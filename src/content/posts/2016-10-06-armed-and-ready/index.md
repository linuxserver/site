---
title: ARMed and ready
date: 2016-10-06T14:44:00Z
author: sparklyballs
tags:
  - docker
  - armhf
hero: ./featured.png
---

With the recent announcement of the [official docker package for raspberry pi](https://www.raspberrypi.org/blog/docker-comes-to-raspberry-pi/) the linuxserver.io team have stepped up production of docker images for the popular armhf platform.

At the time of writing we have over 30 images available covering different genres from well known download apps like [sabnzbd](https://hub.docker.com/r/lsioarmhf/sabnzbd/) and [transmission](https://hub.docker.com/r/lsioarmhf/transmission/), audiobook server [cops](https://hub.docker.com/r/lsioarmhf/cops/) and irc bouncers [quassel-core](https://hub.docker.com/r/lsioarmhf/quassel-core/) and [znc](https://hub.docker.com/r/lsioarmhf/znc/) and many others.

## Building images for armhf.

The images are built via [Jenkins](https://jenkins.io/) using our members' armhf boards as remote slaves and pushing images whole to the dockerhub. This setup also allows us to build and test pull requests from our [git reposistory](https://github.com/linuxserver).

![](/content/images/2016/10/2000px-Jenkins_logo_with_title.svg.png)

## Raspberries are not the only fruit.

Although the Raspberry Pi is likely to be the biggest install base, it is by no means the only player in the game for docker on armhf. We at linuxserver.io use an [odroid XU4](http://www.hardkernel.com/main/products/prdt_info.php?g_code=G143452239825) as a build slave for our images to complement our RPI's.

A great source of information on anything related to running docker on the arm platform is the [hypriot blog](http://blog.hypriot.com/)

## Support and grabbing images.

We offer the same level of support for our armhf images as we do for our x86 range via irc on freenode at #linuxserver.io, our [forum](https://forum.linuxserver.io/) or by raising git issues on the relevant repository.

All of our armhf images are built with the care you can expect from us and continue the ethos of easy user mapping via our PUID and PGID environment variables.

So be sure to check out our armhf repository on the hub at [lsioarmhf repository](https://hub.docker.com/u/lsioarmhf/)
