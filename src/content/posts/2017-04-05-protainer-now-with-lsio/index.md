---
title: Portainer.io - Now with LinuxServer.io Templates!
date: 2017-04-05T13:39:00Z
author: j0nnymoe
tags:
  - docker
  - news
  - portainer
hero: ./featured.png
expires: 2023-03-09T09:05:00Z
---

**No longer availble in versions later than 1.18.0**

Over the past couple of months we have been working behind the scenes with [Portainer](http://portainer.io/) to get our Docker collection set up within their *App Templates* and now we are excited to announce that from version 1.12.3, they are now live!

![](/content/images/2017/04/Portainer--12-.png)

To start using Portainer with our app templates, run the following command:

    docker run --name portainer -d \
    -p 9000:9000 \
    -v <path to data>:/data \
    -v /var/run/docker.sock:/var/run/docker.sock \
    portainer/portainer
    

Once Portainer is loaded, you will find our templates under the "App Templates" section. Once you are there, select your favourite application, set your docker options (PUID/PGID + Ports + Mounts), click create and wait, its that simple!

![](/content/images/2017/04/Portainer--14-.png)

Please note this should be treated as an early release and we expect bugs to be found. For now, our networking related containers are available from within Portainer with the hope that there will be more in the future.

If you find any issues or need support with using Portainer and our app templates, please post [here](https://forum.linuxserver.io/thread-462.html) or if you have an issue with a specific container, please post in their relevant support thread on the [forum](https://forum.linuxserver.io/forum-20.html).
