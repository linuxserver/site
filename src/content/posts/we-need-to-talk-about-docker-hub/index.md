---
title: "Updated: We Need To Talk About Docker Hub"
date: 2025-01-24T19:30:00Z
description: We Need To Talk About Docker Hub
tags:
  - docker
  - open source
  - linuxserver
  - docker hub
hero: ./docker-logo-wide.png
---

### Update

A big thank you to all the people who reached out offering to help us get in touch with somebody at Docker to get this resolved. With your assistance we've been able to speak with their Developer Relations team and fix our issues with the DSOS application process. With the best will in the world things go wrong and processes fail, but what matters is how you deal with the fallout from it and the guys at Docker managed to sort this out quickly, without any hassle, and are looking into what went wrong to try and prevent anyone else having the same issues, so kudos to them.

### Original Text

[Docker Hub](https://hub.docker.com/) is the de facto standard Docker registry, literally, if you don't specify a registry when pulling an image Docker will invisibly prepend `docker.io/` to it. That bit is fair enough really, it's their software and their registry platform so why not prefer it? From the beginning of the Linuxserver project we used Docker Hub as our primary registry; as we grew we started mirroring our images to Gitlab and Quay.io, more as a backup than anything else, there was no reason for us to have concerns about the stability or functionality of Docker Hub, until...

In 2020 Docker announced that they would start [purging old images](https://web.archive.org/web/20201101055027/https://www.docker.com/blog/scaling-dockers-business-to-serve-millions-more-developers-storage) and introducing [pull limits](https://web.archive.org/web/20201101055027/https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/) for unpaid accounts and unauthenticated users - for some reason they've scrubbed these posts from their blog, hence the [Internet Archive](https://archive.org) links.

This concerned us, and many other users, deeply, not just because of the changes - our CI account is on a paid plan so wouldn't have been directly affected - but because of the direction of travel it indicated and the potential impact to our users. Around the same time, Github launched its own container registry, GHCR, which was an evolution of their existing packages registry. This prompted us to consider changing our primary registry and later that year we started updating our documentation to use ghcr.io as the registry for all our examples. In 2021 we partnered with [Scarf](https://app.scarf.sh/) to set up [lscr.io](/blog/wrap-up-warm-for-the-winter/) as a frontend registry for all our images, but retained ghcr.io as the backend provider. In 2023, Docker Hub announced that they were [sunsetting Free Team Organisations](/blog/docker-team-changes/), meaning your options were going to be free individual user accounts, or paid team accounts. While we would have been protected from the changes, Docker ultimately decided not to go forward with them, after user backlash.

In the meantime, we applied for and were granted membership of the [Docker-Sponsored Open Source (DSOS) program](https://www.docker.com/community/open-source/). The application process was messy and slow, but it meant we were no longer subject to the pull limits and image purging of a free account.

Fast-forward to October 2024: we were preparing for our annual DSOS renewal. This process is *abysmal*, there's no way to apply to roll over membership, or even a renewal process per se, you have to reapply from scratch every year using the same badly-designed form that they hilariously describe as a "new, streamlined application process \[that\] lets you apply with a single click and provides status updates along the way". The confirmation email notifies you that the application process can take up to a month, so we waited as usual. A month came and went without any update beyond the initial automated reply. In mid-November our DSOS status expired, reverting our account to Free Teams status and removing all the benefits of DSOS membership.

We reached out to Docker via the contact email they provide (opensource@docker.com), although it's worth noting that they do not publish it anywhere related to the DSOS program application process, and did not receive any response, not even a "This mailbox is no longer monitored". Twice more we attempted to reach out to them about the status of our application, but still have yet to receive a response.

We're now 3 months on from our renewal submission, with zero communication from Docker, an account that is no longer part of the DSOS program, and no obvious way to speak to a human about it. We could resubmit the form, but why would that go any differently to last time? There's clearly no point in using the email address as it is seemingly ignored. We do have some contacts who work at Docker but they're engineers, not responsible for Docker Hub's account management, and we don't want to make this their problem. We're going to try logging a regular support ticket but as we're now on a free account we're not hopeful of getting a helpful response.

It's hard to know if we've just fallen through the cracks somehow or if there are more systemic issues going on within the Docker organisation at the moment, but this feels like the kind of process that should have some degree of resilience to it if you're going to offer it to people, and frankly the lack of a straightforward renewal option has always been kind of unacceptable.

All of this has made us seriously reconsider what we do going forwards; we obviously won't pull all our images off Docker Hub, nor is it sensible to just stop pushing new images as it will seriously impact the many users we have who pull from there and don't read these blog posts or generally keep track of what we're up to as an organisation, but it *does* feel like we need to do something. Whatever we decide, we'll keep you informed.

Side note: If you're reading this and you work for Docker in some relevant capacity, give us a hint as to what we're supposed to do here, we'd really appreciate it.
