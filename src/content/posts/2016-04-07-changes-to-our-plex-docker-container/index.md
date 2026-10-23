---
title: Changes to our Plex Docker container
date: 2016-04-07T14:22:00Z
author: lonix
tags:
  - docker
  - plex
---

At the time of writing this article the `linuxserver/plex` container has been pulled 184,679 times from Docker hub. Our container was the first to properly support switching between the “PlexPass” and “standard” versions of Plex Media Server. As the popularity has grown we’ve attracted the scrutiny of the Plex development team who found we were effectively giving away the paid version of PMS for free. Oops! As a consequence, we’re making some changes to the way in which the paid version of Plex is obtained.

### Changelog

- Deprecating `-e VERSION=PLEXPASS` as a runtime option.
- PlexPass entitlement and version is now automatically detected upon login to plex.tv on the first run of PMS
- Removed support for user specified `/transcode` locations as Plex are changing this functionality upstream

### Why?

In discussions with the Plex development team it transpired that the method we used to supply users with the PlexPass version actually allowed users who weren’t entitled to access the ‘secret’ download link thus circumventing the Plex paywall. As you might imagine, a better solution needed to be found…

This means that upon first run of a new container auto-update will be disabled. You will be required to login to your server with your plex.tv credentials. Logging in stores an authentication token into your settings directory. The container will then automatically detect from this token which version of Plex you’re allowed to download. You don’t have to do a thing except restart your container after logging in with `docker restart plex`.

If you wish, you may override the automatic detection by specifying any of the following options but note that without a PlexPass you cannot override to receive a version to which you are not entitled:

- latest
- 0.9.16.3.1840-cece46d <- Or any other spesifc version
- blank - Disable auto-update permanently until set
- Good option if you want to maintain the PMS version shipped in the container by default

Our recommendation is to supply `-e VERSION=latest` in almost all cases. You should only deviate from this option if you have a good reason to do so.

> Thank you all for using our containers, we love making them for you. -lonix
