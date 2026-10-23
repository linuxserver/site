---
title: How to setup Docker on Linux using Plex as an example
date: 2014-12-06T16:29:00Z
author: IronicBadger
tags:
  - arch linux
  - containers
  - docker
  - linux
---

I’ll leave a lot of the theory out and just focus on trying to get you up and running as quick as possible providing example commands. I found the biggest hurdle when learning Docker was understanding exactly what it was and why I should care. I wrote a [little post](http://forum.linuxserver.io/index.php?threads/my-rambling-thoughts-on-docker.157/) sharing my thoughts on Docker once I saw the light.

edit: updated 5/2/16

## Docker Installation

I’ll let Docker tell you how to do that…

[Docker Blog – New Yum and Apt Repos](https://blog.docker.com/2015/07/new-apt-and-yum-repos/)

Oh alright. This will work on RPM and DEB based systems…

    curl -sSL https://get.docker.com/ | sh
    

## Docker Commands

First you’ll want to find a container to run, go to [https://registry.hub.docker.com/](https://registry.hub.docker.com/) and pick one out. For the purposes of this guide we’ll use [linuxserver/plex](https://registry.hub.docker.com/u/linuxserver/plex/). The most important command with any container is `docker create` . This is *effectively* like installing the container on your system as it specifics all the ‘runtime’ characteristics, we’ll go through this in a sec.

EDIT: Feb 2016 – Fully up to date docs are now included with ALL LinuxServer Docker containers. I recommend you go read those and not the rest of this article! 😀

    docker create --name=plex \
      --net=host \
      -v /etc/localtime:/etc/localtime:ro \
      -v /appdata/plex:/config \
      -v /mnt/storage:/data \
      -e PGID=1001 -e PUID=1001 \
      -e VERSION=plexpass \
      linuxserver/plex
    

Let’s break each flag (by flag I mean `-e` or `-v`) down: * `-v` Bind mount a volume (e.g., from the host: `-v /host:/container`) * `-e` Set environment variables * `-p` Publish a container’s port to the host – format: `hostPort:containerPort`

For a full breakdown of all the docker create commands simply type `docker create` into your shell. Starts to look a bit more manageable hopefully? You’ll notice that sometimes there are multiple arguments with the same flag, in this way you can powerfully stack arguments to create a very sophisticated (and often initially intimidating) `run` command.

## Setup a Plex container from start to finish

These commands are Arch specific

1. Create a directory somewhere to store the config / metadata outside the container on your filesystem. I’ll use /appdata.

    mkdir /appdata
    mkdir /appdata/plex
    

1. Create a ‘media’ or ‘plex’ user. This user will have permissions and ownership of all the folders with containers that require this. Denoted by PGID / PUID.

    useradd -m -G users -s /bin/bin/nologin media
    

It’s probably easiest to make the user ID match the group ID, the above command should have done that anyway but let’s just check. In my case both are **1002**.

    cat /etc/passwd ... media:x:1002:1002::/home/media:/bin/bash
    

Edit: You can also run the following to get the PGID and PUID for you. Substitute ‘media’ for your desired username.

    id -u media && id -g media
    

1. Take ownership of the appdata folder.

    chown media:media /appdata/plex
    

Verify it’s worked with

    ls -la
    

    drwxr-xr-x  2 media media 4096 Dec  6 11:14 plex
    

4) Gather all the information you need for your `docker run` command.

- Which directories on your host filesystem do you want to give the container access to?
- What port do you want to run the service on?
- What are your PGID / PUID (check step 2 if you forgot…)?
- Are you a Plexpass holder (if not, why not – good softwar deserves support!)?

1. Assemble your `docker create` command.

    docker create --name=plex --net=host -v /etc/localtime:/etc/localtime:ro -v /appdata/plex:/config -v /mnt/storage:/data -e PGID=1001 -e PUID=1001 -e PLEXPASS=1  linuxserver/plex
    

For the above command, you must specify at least the /config location and /data location. For example, `/mnt/storage` is my MHDDFS drive pooling mount point so Plex has access to my entire array. If you wanted to limit it to just TV shows and movies, string two commands together… `-v /mnt/storage/TV:/data/TV -v /mnt/storage/Movies:/data/Movies`. Inside the running container you would then navigate to `/data/Movies` or `/data/TV` and voila.

1. Wait whilst Docker performs a ‘pull’ of the latest image from the registry. This can take 2-5 minutes depending on your connection. Here’s a truncated output of a successful command…

    $ docker run -d --name=plex2 --net=host -v /etc/localtime:/etc/localtime:ro -v /appdata/plex:/config -v /mnt/storage:/data -e PGID=1002 -e PUID=1002 -e PLEXPASS=1 linuxserver/plex 
    Unable to find image 'linuxserver/plex:latest' locally
    Pulling repository linuxserver/plex
    64a9facc26fa: Pulling dependent layers
    511136ea3c5a: Download complete
    b18d0a2076a1: Download complete
    ......
    da017a1f2660: Download complete
    fb39e3fe9d0b: Download complete
    Status: Downloaded newer image for linuxserver/plex:latest
    9d57c7613f1e08c8f8ee7fd75e4a06121dc93dd3f8c1765cd661f399ef8e2fac
    

1. Start your container as such

    docker start plex
    

1. 
Use Plex as you normally would.

2. 
Use the various Docker commands to have a play around in your new containers whilst you get the hang of things.

    docker start 
    docker stop 
    docker ps 
    docker ps -a 
    docker restart 
    docker rm 
    docker images 
    docker exec
    

1. Backup your `/appdata` folder as a .tar.gz for easy disaster recovery.
