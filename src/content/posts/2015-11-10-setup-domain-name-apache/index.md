---
title: Setup a Domain Name
date: 2015-11-10T18:29:00Z
author: smdion
---

This is part of setting up Apacheweb on Docker.  Please look at the [overview page](/blog/2015-11-10-overview-reverse-proxy-with-docker/) for additional info on this process.

1. Register a domain.

1. There are many websites this can be done from: Google Domains, Hover, DynDNS, and others.

2. Setup Dynamic DNS Updates.  This is so that when you type in your domain it knows to send traffic to your home IP which most likely changes. If you know you have a static IP address, this step isn’t needed.

1. Chose a DDNS Service.

1. DynDNS offers a paid full feature DDNS service
2. Cloudflare offers a free DDNS service with a lot of other great features and they have a great how to for this process.

2. Update the NS Server information with the info from your DDNS Service with your Domain Registrar. Please contact them on how to do this. The process varies for each company.
3. Set your router to update the DDNS service with your current IP. Not all services are supported by all routers.  All services have scripts/software you can run to do this as well.
