---
title: Using Organizr with our Let's Encrypt container
date: 2018-01-11T02:23:00Z
author: Josh Stark
tags:
  - docker
  - reverse proxy
  - letsencrypt
---

Recently we have had a fair number of people asking about running [Organizr](https://github.com/linuxserver/docker-organizr) through our [Let's Encrypt Docker container](https://github.com/linuxserver/docker-letsencrypt), with people stumbling around getting their tabs to display correctly. The most common query surrounds the confusion between accessing Organizr locally versus accessing it via a reverse proxy.

> The tabs show up correctly when I navigate to it on my local network, but it does not work when I navigate to it through my reverse proxy.

The primary reason the tabs do not display correctly through a reverse proxy is because each tab is effectively an iframe that loads whenever you select it. This means that the URL configuration you set up on Organizr is literally what gets loaded in the browser. So, if you use `http://192.168.0.2:8181` (for PlexPy), that's the URL that Organizr is going to load, regardless of where you're accessing it from.

The quick answer to this is to run each URL you want to be available in Organizr through the reverse proxy as well. This way, when you load the tab, it will use the proxied URL instead. If you've already successfully configured Organizr in your reverse proxy, repeat the process for each application you wish to be available in tab-form. For more information regarding our Let's Encrypt container, you can [follow our guide](/blog/2017-11-28-how-to-setup-a-reverse-proxy-with-letsencrypt-ssl-for-all-your-docker-apps/) to get you started.
