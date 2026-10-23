---
title: Own Up, Which One of You Broke The Website?
date: 2024-09-23T14:30:00Z
author: Spad
tags:
  - docker
  - compose
  - digitalocean
  - infrastructure
hero: ./8041388538-c35c8c13a1-h.jpg
---

Our infrastructure can be broadly split into three categories: Public Facing, Internal, and Builders.The latter should be pretty self-explanatory and are a mix of amd64 and aarch64 boxes that build all our images. Internal services include things like our wiki, monitoring and metrics, automation, Discord bots, etc. The bulk of our public facing services - our website, Discourse forums, Fleet, Info, and Status pages - are hosted on Digital Ocean droplets, however, we use a number of different hosting providers for our other services, in part because it's wise to distribute your eggs, in part because DO don't offer arm droplets, and in part because running 24/7 droplets of the required number and spec for our builders would simply be more expensive than more traditional hosting providers.

One of the nice things about DO is that we can upload and store our own custom OS images, which makes life much easier when we want to deploy Alpine-based hosts, for example, and they also offer much more detailed metrics and monitoring than our other hosting providers, which really helps with making sure we've got everything sized correctly and aren't overpaying or underperforming. They do also offer a Container Registry service, but it's designed for private, internal use, and their largest offering is only 100 GB storage, which we would burn through in no time ([Webtop](https://github.com/linuxserver/docker-webtop) alone accounts for over 3Tb of images).

In the 4 years I've been part of Linuxserver I don't think we've had a single outage across our droplets, which is honestly quite impressive, and with weekly backups ([daily now available](https://www.digitalocean.com/blog/daily-backups-now-generally-available)) and on-demand snapshots we've got some pretty solid reliability for our services. However, even the best hosting provider can't protect you against someone screwing up while managing a box and so we've taken some additional steps to try and protect ourselves.

### Monitoring

Beyond the metrics and alerting provided by DO, we use [Gatus](https://github.com/TwiN/gatus) to monitor our services for outages, and it doubles as a [public status page](https://status.linuxserver.io/). If something goes down we know about it within a few minutes, rather than relying on chance or annoyed users notifying us about it. We also monitor a number of 3rd party services that we rely heavily on, such as the Docker registries and the Github API so that when users complain about not being able to pull images we know if there's a wider issue.

### Pre-Prod

We operate a pre-production clone of our live website that allows us to test upgrades and changes without making us look too stupid when everything breaks. We were "inspired" to set it up after an upgrade to Grav (our CMS) broke our custom CSS, and it's already paid dividends.

### Version Control

Did you know that Docker Compose can pull from a remote git repo? No? I'm not surprised as it's an experimental feature and *very* lightly documented. In fact [this blog post](https://www.docker.com/blog/scaling-docker-compose-up/) was the only official place outside of the Docker git repos that I found reference to it. The TL;DR is if you set `COMPOSE_EXPERIMENTAL_GIT_REMOTE=true` you can then [include](https://docs.docker.com/reference/compose-file/include/) the repo:

```yaml
include:
  - git@github.com:linuxserver/infra.git#main:website/compose.yml
```

in your `compose.yml` and Docker will retrieve all your config from that path in git without the need to manually clone and pull repos and remember to keep them up to date. What it also means is that I can't jump onto a droplet, edit the compose project, make a typo, and bring everything down. Instead I have to open a PR against the repo, get it approved & merged, and then compose will integrate those changes - and if it *still* breaks something then it's the fault of whoever approved the PR, rather than me. You can see an example of one of these repos [here in our Labs org](https://github.com/linuxserver-labs/compose).

### Long Term Support

Our next big exercise will be upgrading all of our Ubuntu hosts from Jammy to Noble; something we'll look to do over the next few months. It would really be an ideal opportunity to test our resiliency and instead spin up new Noble droplets, restore the config and data onto them, and then flip DNS to the new host. To paraphrase Bender, quoting God, if we do things right, people won’t be sure we’ve done anything at all.
