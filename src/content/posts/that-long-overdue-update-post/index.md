---
title: That long overdue update post...
date: 2021-07-03T00:17:00Z
author: LinuxServer.io Team
tags:
  - containers
  - docker
  - news
  - update
hero: ./patrick-fore-0gkw-9fy0eq-unsplash1.jpg
---

It's been a long time since we've done a community update with what's going on within the LSIO world, so we thought what better time to do one than when we're releasing a new version of our website!

## New Base, Same Great Content
Over the past couple of months we've been busy working away on migrating our website and blog to a new platform. For the past number of years our site has consisted of a statically generated website in concert with using the Ghost platform for our blog. As it stood, Ghost was on version 2 and they'd recently released v4, but due to the customisations we'd made with our Ghost theme previously we felt it was worth spending our time finding a better platform rather than migrating our changes up 2 versions. 

Step in [Grav](https://getgrav.org/): It's a flat-file site but with all the benefits you get from having a CMS. We've spent the past couple of months running a development instance of Grav to get our current design and content migrated over and we couldn't be happier. The most challenging aspect we found was migrating the blog posts into flat markdown files as Ghost would only export to JSON. We found a tool called [ghost-to-md](https://github.com/hswolff/ghost-to-md/) which would allow us to split out all the posts into their own markdown files but this wasn't enough to do a direct import into Grav. After a lot of tinkering/exports/tests we got ghost-to-md now exporting each post into their own folder along with accompanying media, with the post.md being in the correct layout and having all the relevant author/tag information.

Unfortunately Grav don't provide an official docker image and it wouldn't be very on-brand of us to run it on bare metal so we [made our own](https://github.com/linuxserver/docker-grav/). It's what this site is running on right now, and makes it trivial for you to give Grav a try if you're curious.

## New Info Feeds
We've been looking at different solutions that users can subscribe so it's easier to be alerted when new containers are created or there are outstanding issues or if we've dropped support for them. We would like to announce [Info](https://info.linuxserver.io/): It's a cState Information site with RSS feeds which we will use to alert our community about new containers or changes to current ones. We will also be setting up bots in both Discord and IRC to post the information there too.

This makes it trivial for you to keep track of the things that we do; you can subscribe to the [full feed](https://info.linuxserver.io/index.xml) or any subset of information we post, whether that's [new container releases](https://info.linuxserver.io/affected/new-containers/index.xml), [security vulnerabilites](https://info.linuxserver.io/affected/vulnerabilities/index.xml) or just posts about a specific container such as [swag](https://info.linuxserver.io/affected/swag/index.xml).

## Other Notable Things That Happened In The Past Year
  * Most of us have had the daily routine change this year, thankfully there is something we as a community can do. Projects such as BONIC and Folding@Home added COVID-19 to their list of possible research to contribute to; so we did what we do best, create containers. We launched containers for both projects [back in March 2020](https://blog.linuxserver.io/2020/03/21/covid-19-a-quick-update/). 

  * We had a facelift; back in May we [got a new logo](https://blog.linuxserver.io/2020/05/24/deciding-on-a-new-logo-by-abusing-everyone/).

  * We started pushing mods; after releasing the concept and logic in [late 2019](https://blog.linuxserver.io/2019/09/14/customizing-our-containers/), we now have over 40 mods in [our portfolio](https://mods.linuxserver.io/), check it out!

  * We also started documenting, and moving much of what we had going on in our backend to Github actions, as well as introducing an arena for the community to discuss contributions. Most of our repositories now have a guideline on how to contribute in the .github folder, [here](https://github.com/linuxserver/docker-heimdall/blob/master/.github/CONTRIBUTING.md) is the one for the Heimdall container. We also moved the version checks and triggers from our [Jenkins](https://ci.linuxserver.io/) instance to Github actions, again [here](https://github.com/linuxserver/docker-heimdall/blob/master/.github/workflows/external_trigger.yml) is the one for the Heimdall container.

  * We moved away from pushing to the GitHub Package Registry (GHPR), and over to GitHub Container Registry (GHCR). This was planned from when Github announced it, however, too much functionality was missing to make the move immediately. Just before GHCR was announced, DockerHub [announced](https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/) that they were introducing rate limits that would affect our users. This sped up our migration from GHPR to GHCR. We managed to support GHCR the day before these limits took effect. We have since applied for Docker's Open-Source program once they announced it which means our main repository doesn't have any limits.
  
    Soon after, we updated our documentation to default to GHCR and we recommended existing users to switch. It is exactly the same image, but without download restrictions. This does not change anything with regards to our images and Docker Hub. We will continue to push our images to GHCR, Docker Hub and Gitlab's registries in the foreseeable future.

    To pull from GHCR (and we recommend you do) all you need to do is prefix `ghcr.io/` to your image in compose, or before the image on a docker run/create/pull.
    
    ```yaml
    ---
    version: "2.1"
    services:
      swag:
        image: ghcr.io/linuxserver/swag:latest
    ```
    
    ```bash
    docker pull ghcr.io/linuxserver/swag:latest
    ```
    
    We have not ported over older tags that pre-date GHCR, so if you pinned your image to an old version you may have to stick with Docker Hub for now. 
    
    **Please note - Unraid does have some UI quirks with this before version 6.9**
