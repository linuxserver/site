---
title: 10 billion pulls and counting...
date: 2020-05-22T15:35:00Z
author: Chris Hunt
hero: ./featured.jpg
---

Today marks an exciting milestone in our history: we have hit **10 billion pulls** on DockerHub and moved up to the 11th digit! A big thank you to the amazing developers working upstream and to our community of users — we could not do it without you.

DockerHub pulls seem to be a fairly arbitrary number that DockerHub doesn't really give too much information about. It is suggestive of a number designed to impress investors, but nevertheless, hitting 10 billion pulls is a pretty big achievement. This is especially true for a group who aren't in any way affiliated with Docker; we don't even qualify as a `Verified Publisher` never mind `Docker certified` so given 10 Billion pulls, we'll take it! 

---

## Credit where credit is due

As a community we maintain the build logic and work front-line support for popular home server software. The projects we publish deserve the lion's share of credit for creating and maintaining great software. Here are some of the community and donation links for our more popular containers, so if you have found them useful consider supporting them or dropping in and saying thanks. (GitHub stars are nice too):

                Image
            
                Donation Info
            
                Community Link
            
                Sonarr
            [https://sonarr.tv/donate](https://sonarr.tv/donate)[https://discord.gg/u3x3Kp8](https://discord.gg/u3x3Kp8)
                Radarr
            [https://opencollective.com/radarr](https://opencollective.com/radarr)[https://discord.gg/u3x3Kp8](https://discord.gg/u3x3Kp8)
                Jackett
            [https://discord.gg/J865QuA](https://discord.gg/J865QuA)
                Ombi
            [https://www.patreon.com/tidusjar](https://www.patreon.com/tidusjar)[https://discord.gg/Sa7wNWb](https://discord.gg/Sa7wNWb)
                Tautulli
            [https://www.patreon.com/join/tautulli](https://www.patreon.com/join/tautulli)[https://tautulli.com/discord.html](https://tautulli.com/discord.html)
                NZBGet
            [https://nzbget.net/donate](https://nzbget.net/donate)[https://forum.nzbget.net/](https://forum.nzbget.net/)
                SABnzbd
            [https://sabnzbd.org/donate](https://sabnzbd.org/donate)[https://forums.sabnzbd.org/](https://forums.sabnzbd.org/)
                NZBHydra2
            [https://github.com/sponsors/theotherp](https://github.com/sponsors/theotherp)[https://discord.com/invite/uh9W3rd](https://discord.com/invite/uh9W3rd)
                Lidarr
            [https://opencollective.com/lidarr](https://opencollective.com/lidarr)[https://discord.gg/8Y7rDc9](https://discord.gg/8Y7rDc9)
                Bazarr
            [Via PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XHHRWXT9YB7WE&source=url)[https://discord.com/invite/MH2e2eb](https://discord.com/invite/MH2e2eb)
We maintain too many images to list them all here but a more comprehensive list is available [over on our instance of Fleet](https://fleet.linuxserver.io/) .

To show our support for the projects that we have been able to make images for, we have started including donate links for those projects in our container logs and GitHub's sponsor buttons.
![](/content/images/2020/05/image-11.png)![](/content/images/2020/05/image-13.png)
## Things we are building

We don't just build containers for 3rd party software — we also directly assist developers of 3rd party software and have our own in house opensource tools. Here is a small list of things we have worked on above and beyond simply creating a docker container. We can't wait to show you what else we have coming.

#### Fleet

This is our in-house application which serves up our list of images in a single place while also providing extra contextual information to help our users get started. The primary driver behind Fleet was to provide our users with a single point of entry for listing our images specifically while also giving them the context that DockerHub alone wouldn't necessarily provide. It also has the ability to track the latest builds of an image on a tag-branch which makes it easier to see which builds are truly latest per release type (e.g. *release* vs. *beta*).

What does that mean? Its an awesome way to display all the images you create containers for and provides additional information and statistics. There are lots of things we hope to add to it in the future, feel free to get in touch if you have any ideas. But most of all take it for a spin! We love it and we hope you do too.

#### netboot.xyz

Netboot.xyz is an iPXE based project allowing users to boot their computer off internet based assets. As we are not the maintainers of the project, to support and participate, you can join [their Discord server](https://discord.gg/An6PA2a), or donate to them [directly via OpenCollective](https://opencollective.com/netbootxyz/donate). 

We have been working upstream to develop a general workflow for Live CD based assets and provide a web based tool wrapped in a Docker container for locally hosting a network bootable endpoint. 

#### Heimdall Application Dashboard

Heimdall is a dashboard to store links to web based applications, websites, and really anything you can hit via a URL. It was designed to be a visually pleasing interface for storing these items. 

It also introduces the concept of "enhanced" apps. Heimdall can query any application that has an API for small nuggets of information, for example: the current download speed (how much is left to come down); or perhaps how many ads have been blocked by Pi-hole. If the API provides it, Heimdall can show it.

#### GUI containers

Not every application has a web interface so we have a wide variety of images providing RDP and [Guacamole](https://guacamole.apache.org/) based access to a full Linux desktop environment.

For users:

- [https://hub.docker.com/r/linuxserver/rdesktop](https://hub.docker.com/r/linuxserver/rdesktop) - RDP endpoints for virtual desktops in a wide variety of popular flavors of Ubuntu.
- [https://hub.docker.com/r/linuxserver/taisun](https://hub.docker.com/r/linuxserver/taisun) - Application allowing users to launch web based virtual desktops in a wide variety of popular flavors of Ubuntu.

For developers: 

- [https://github.com/linuxserver/docker-baseimage-rdesktop-web](https://github.com/linuxserver/docker-baseimage-rdesktop-web) - Both a custom Node.js web interface and a "stock" Guacamole client experience provided to easily embed a desktop application in a web interface. For a live example see [here](https://github.com/linuxserver/docker-doublecommander). 
- [https://github.com/linuxserver/docker-baseimage-guacgui](https://github.com/linuxserver/docker-baseimage-guacgui) - Full Guacamole stack in a Docker container, similar to the above image with a different design and structure. For a live example see [here](https://github.com/linuxserver/docker-calibre). 

---

## Top highest growth images

While some of our images command a strong position, some newcomers have exhibited a strong uptake relative to their time in our fleet. By looking at the last six months, we were able to identify a few images which have shown strong growth since their inception.
![](/content/images/2020/05/image-10.png)
It isn't hard to see why these images have been popular; *boinc* and *foldingathome *have become especially useful in the current world climate as scientists race to find a workable vaccine for COVID-19. Some members of the team also worked very hard on our *wireguard *image, so it is good to see its uptake remaining strong. Our *librespeed *image shows an interesting initial low rate of uptake followed by a steadily consistent increase as it gains popularity.

---

## Our containers with over 200 million pulls

A quick shout out to our mainstay images which bring in a consistently high pull rate. We can't take credit for the number of pulls as these applications have garnered a strong following without our influence, but it is nice to see users favour the images we have built (and thus get our tried and tested approach to image build structure).
![](/content/images/2020/05/image-7.png)* `linuxserver/hydra2` image was recently replaced with `linuxserver/nzbhydra2`
### A big thank you!

We really couldn't have done this without the support of our user-base, so from everyone in the LSIO team, thank you!
