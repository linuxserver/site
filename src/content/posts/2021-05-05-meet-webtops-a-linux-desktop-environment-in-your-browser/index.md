---
title: Meet Webtops A Linux Desktop Environment In Your Browser
date: 2021-05-06T01:07:00Z
author: Ryan Kuba
tags:
  - linux
  - VDI
  - webtop
  - docker
  - XFCE
  - KDE
hero: ./featured.png
---

Before I joined the LinuxServer organization I had been working on a Docker management solution called [Taisun](https://www.taisun.io/). Over the years it became apparent everyone downloading this application was only really using the subfeature to be able to run a Linux desktop in their web browser. From parts of this project we as a team started deploying containers for popular GUI applications in docker containers and have now released: 
[https://hub.docker.com/r/linuxserver/webtop](https://hub.docker.com/r/linuxserver/webtop)

This technology stack goes a bit against the Docker grain as we are running many services in a single container to facilitate spinning up a usable web based desktop experience with a single command consisting of: 

- [Guacamole Server](https://guacamole.apache.org/)
- [xrdp Server](http://xrdp.org/)
- Pulseaudio 
- Custom nodejs frontend

A lot of different Docker GUI solutions exist today, but what we always found is they were just missing some common sense stuff like: 

- Pixel perfect resolution for rendering
- A basic window manager
- Audio support
- Using the RDP protocol
- Clipboard support
- On screen keyboard support
- Remote file management for uploads/downloads

Because we control the whole stack and went into this with the design philosophy of building a baseimage any Linux GUI app could be easily embedded in, doing a desktop environment where users could customize it to their needs by installing the packages they want, seemed like the logical next step.

### For Users

#### Basic Usage:

Spinning up is relatively straightforward: 

    docker run -d \
      --name=webtop \
      -e PUID=1000 \
      -e PGID=1000 \
      -e TZ=Europe/London \
      -p 3000:3000 \
      -v /path/to/data:/config \
      --shm-size="1gb" \
      --restart unless-stopped \
      ghcr.io/linuxserver/webtop

Hop into http://localhost:3000 and you should be greeted with an Alpine XFCE desktop environment: 
![](/content/images/2021/05/base-desktop.png)
On the left hand side of the screen is an arrow that will expand a menu with some baked in features, this menu can also be opened and closed using the keyboard combination of ctrl+alt+shift:
![](/content/images/2021/05/menu.png)
From this menu you can launch a file browser, a keyboard overlay, or pull clipboard contents in and out of the desktop. The current webtop's clipboard contents will be in the text area in the menu and any text you enter in there will be available on the webtop's native clipboard. If you are a heavy user pressing ctrl+alt+shift to move clipboard contents in and out becomes second nature. 

#### Flavors:

The image is also available in Ubuntu outside of just Alpine in the following Desktop environments installed and pre-configured:

- XFCE
- KDE
- MATE
- i3
- Openbox
- IceWM

Please take a look at the Github Repo for updated lists of supported tags:

[https://github.com/linuxserver/docker-webtop](https://github.com/linuxserver/docker-webtop)

#### Authentication:

By default the image is based around the `abc` user and we recommend using this user as all of the init/config is based around it. The default password is also `abc` . If you want to change this password and require authentication when accessing the interface simply issue `passwd` inside a gui terminal in the webtop. Then when accessing the web interface use the path:

http://localhost:3000/?login=true
![](/content/images/2021/05/login.png)
This will bring up xrdp's default login manager where you can enter the credentials you set inside of the container. 

If you are planning to publish this port to the internet to hop into your remote server first off never do it over plain http you will expose your credentials, also we highly recommend doing two layers of security and running something like SWAG with password authentication at the reverse proxy level: 

[https://github.com/linuxserver/docker-swag](https://github.com/linuxserver/docker-swag)

#### Keeping Up to Date:

As stated previously baking a whole Linux desktop env is not really compatible with the classic Docker model, and because these are designed to be customized by the user inside the running container we highly recommend not using Docker to handle image updates. Your user's home folder will stay in tact with it's files and settings but you would lose any software you installed inside of the container. Instead just use Alpine and Ubuntu's package managers to keep software up to date inside the container.

Alpine:

    sudo apk upgrade

Ubuntu:

    sudo apt-get update && sudo apt-get dist-upgrade -y

## For Developers

#### Building an image:

We tried to make using our desktop base image for embedding a desktop application as easy as possible. Let's take a look at an example Dockerfile for a Firefox container: 

    FROM lsiobase/rdesktop-web:alpine
    
    RUN \
     echo "**** install packages ****" && \
     apk add --no-cache \
    	firefox-esr && \
     echo "**** cleanup ****" && \
     rm -rf \
    	/tmp/*
    
    # add local files
    COPY /root /
    
    # ports and volumes
    EXPOSE 3000
    VOLUME /config

On top of installing the app in the Dockerfile you need to create the file `/root/defaults/autostart` with the contents `firefox`.

And that's it, when the container spins up and the user accesses the web interface on port 3000 Firefox will be launched in a basic Openbox gui:
![](/content/images/2021/05/firefox.png)
For a slightly more advanced example check out the LibreOffice image: 

[https://github.com/linuxserver/docker-libreoffice](https://github.com/linuxserver/docker-libreoffice)

#### Autostart applications:

By default the desktop applications will only be launched when the user logs into the web interface, if you need your application to run on container spinup you will need to set the environment variable: 

    -e GUIAUTOSTART=true

If the user changes the in container password from the default `abc`, they will also need to pass a password option to ensure the application autostarts:

    -e PASSWORD=yourpassword

#### Branding:

If you do not want the Linuxserver splash on container spinup make sure to include a modified one in your repo's path `/root/etc/cont-init.d/10-adduser`, the only required logic is: 

    #!/usr/bin/with-contenv bash
    
    PUID=${PUID:-911}
    PGID=${PGID:-911}
    
    groupmod -o -g "$PGID" abc
    usermod -o -u "$PUID" abc
    
    chown abc:abc /app
    chown abc:abc /config
    chown abc:abc /defaults
    

## We are here to help

If you have any questions about using these Webtop images or developing new containers based on our rdesktop-web baseimage just hop on Discord and ask: 

[https://discord.gg/YWrKVTn](https://discord.gg/YWrKVTn)
