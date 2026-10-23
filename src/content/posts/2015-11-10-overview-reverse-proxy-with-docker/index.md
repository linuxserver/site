---
title: "Overview: Reverse Proxy with Docker"
date: 2015-11-11T00:28:00Z
author: smdion
---

## Why?

Lets say you have a number of different web services running on your homelab: [Sonarr](https://forum.linuxserver.io/index.php?threads/support-linuxserver-io-sonarr.452/), [CouchPotato](https://forum.linuxserver.io/index.php?threads/support-linuxserver-io-couchpotato.430/), [NZBGet](https://forum.linuxserver.io/index.php?threads/support-linuxserver-io-nzbget.439/), [Maraschino](https://forum.linuxserver.io/index.php?threads/support-linuxserver-io-maraschino.458/), [Codiad](https://forum.linuxserver.io/index.php?threads/support-linuxserver-io-codiad.429/), or a number of [other](https://www.linuxserver.io/index.php/docker-list/) dockers.  These are all running on a bunch of different ports: Sonarr is IPADDRESS:8989, Couchpotato is IPADDRESS:5000, NZBGet is IPADDRESS:6789.

If you want external access to these, you need to open up a port for every single service. You need to manage certificates for each service individually and keep track of what port they are on so you can access them

What if there was a way where you could setup a Domain, SSL, and have all the services come in based on a URL (IE: [https://www.domain.com/sonarr](https://www.domain.com/sonarr))

## How?

There are a few parts that will need to be setup.  Each will be broken down into step by step ways to get this working.

1. Set up a domain and dynamic IP updates for your server – [Guide](/blog/2015-11-10-setup-domain-name-apache/)
2. Installation and configuration of the [Apacheweb](https://forum.linuxserver.io/index.php?threads/support-linuxserver-io-apache-reverseproxy.427/) docker to manage all these services – [Guide](/blog/2015-11-11-installation-of-apacheweb-docker/)
3. Adding user/pass authentication across multiple services thru .htaccess – [Guide](/blog/2015-11-10-add-htaccess-to-apacheweb-docker/)
4. Adding custom SSL Certificates to a working configuration – [Guide](/blog/2015-11-10-add-ssl-to-reverse-proxy/)
