---
title: Introducing Modcache and Modmanager
date: 2025-01-06T14:00:00Z
author: Spad
tags:
  - containers
  - docker
  - linuxserver
  - mods
  - images
hero: ./12808767834-78c86f4b32-k.jpg
---

If you're the kind of smart arse who already knows how our Docker mods work under the hood, you can skip the next section, but if not then I'm afraid it's necessary reading to properly understand what follows it.

### Docker Mods

Our Docker mods are a workaround for a common problem with container images: how to cater to everyone. Images are immutable, and people have different requirements, so what do you do if you've got an image where say 20% of users need a particular optional extra that would double its size? You could have two different image tags, but that's extra admin. You could just include the extra stuff, but that's extra bandwidth and space for the people who don't need it, and additional stuff to keep up to date. You could tell the users who need it to install it themselves, but then they have to do that every time they update the image. You could tell users to build their own child image that includes the extras, but then they have to maintain that themselves forever. None of the options are great.

So we came up with mods. A mod is really just a single-layer Docker image, and a Docker image is really just a tarball of files. We pull the mod from a registry (Docker Hub, GHCR, etc.) at container start up, unpack the tarball, and apply the contents to the container filesystem. This lets us add packages, init steps, services - pretty much anything - to a container at runtime in a consistent and reliable way that people can opt into as and when they need.

### The Problem With Docker Mods

Docker mods are all very well but they still have a problem: when you update an image the container filesystem is reset and you have to reapply the mod, which means you have to download it again. If you have more than one container that uses the same mod, they all have to download the mod individually. Most mods are tiny, a few kb, so it's not a *huge* problem to have to download them again but it's still not ideal, and some of them *are* bigger - 100Mb or more - which slows down container startup and can be a problem for users on slow or metered connections.

### Solutions

With all this in mind we've developed a couple of new options to help you mitigate these issues. **Note that as of today these are still rolling out across our images so it will be a week or two before everything supports them**.

#### Modcache

As part of the mod download process, each container will now check its local `/modcache` path to see if the mod it needs is already downloaded and up to date. That means if you map a host path to `/modcache` it won't need to redownload the mod every time you update the container. You can also map the same modcache path into multiple containers so that they can all share the cached mod files. e.g.

```yaml
services:
  swag:
    image: lscr.io/linuxserver/swag:latest
    [...]
    volumes:
      - /path/to/swag/config:/config
      - /path/to/modcache:/modcache
      
  pairdrop:
    image: lscr.io/linuxserver/pairdrop:latest
    [...]
    volumes:
      - /path/to/modcache:/modcache
```

If a mod is cached locally it and up to date it will always be used rather than downloading it from the registry. If a newer version of the mod is available, the first container to start will download the updated version; other containers using the same mod that are started at the same time will wait up to a minute for this to complete before skipping that mod.

If a container cannot reach the mod registry and a version of the mod is available in the cache, it will use it. *However*, if the mod needs to install additional packages - and most do - the container still needs a functional internet connection for that to work.

Please note that containers will not remove old mods that are no longer used from the cache, though older *versions* of a given mod tag will be replaced as they're updated. This means a periodic cleanup of the folder is advised.

#### Modmanager

If modcache sounded good but you were like "I use dozens of mods, this all sounds a bit unwieldy and susceptible to race conditions" then there is another option. Our new [Modmanager](https://github.com/linuxserver/docker-modmanager) image proivides both a modcache and automated updating of mods, with the option of dynamic discovery for new mods.

Similar to modcache, you mount a common host path to `/modcache` in all your Linuxserver containers, *including* the Modmanager container. Then you mount either the Docker socket or provide a socket proxy endpoint into the Modmanager container and spin it up. At startup and then every 6 hours (+/- 1 hour) it will check for any new mods that have been added to (or removed from) your containers, as well checking for any new versions of existing mods, and download them into the cache ready for any container that needs them.

If you don't want to use the Docker integration or want to precache a bunch of mods you can also just supply a list of mods like any other image, using the `DOCKER_MODS` environment variable, or you can use a mix of the two.

Similar to the standalone modcache, Modmanager won't automatically delete unused mods, but will replace older versions of a given mod tag as it updates them.

##### Multi-Host

Following the 2025-01-10 release of Modmanager it now also supports multiple docker hosts so it can be used to discover and manage mods from your entire docker estate (if you have one). Please check out the [readme](https://github.com/linuxserver/docker-modmanager?tab=readme-ov-file#multiple-hosts) for more information on this functionality.
