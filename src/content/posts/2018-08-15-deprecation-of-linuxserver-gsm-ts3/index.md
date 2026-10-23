---
title: "PSA: Deprecation of the linuxserver/gsm-ts3 image"
date: 2018-08-15T17:44:00Z
author: sparklyballs
tags:
  - docker
  - teamspeak
  - deprecation
hero: ./featured.jpg
---

Given the ever changing dependencies with the `lsgm` version of TeamSpeak and the issues surrounding updating the TeamSpeak version within the container, we have decided to, effective immediately, deprecate the image - it is now no longer maintained or supported by us.

We considered moving to using the TeamSpeak application directly from TeamSpeak and not using `lgsm` at all, however there were difficulties in running it with the `s6` service manager.

Running the application in the init stage was not only replicating the official library version of TeamSpeak but also added unnecessary weight to the image in the form of unused `s6` service files and the other additions we make to our alpine baseimage. There would also be no clear or easy update path between the `lgsm` version and the official TeamSpeak version as the layout of the data is entirely different.

We therefore recommend that users should switch to the official image found at [https://hub.docker.com/_/teamspeak/](https://hub.docker.com/_/teamspeak/)
