---
title: Troubleshooting Letsencrypt Image Port Mapping and Forwarding
date: 2019-07-10T18:46:00Z
author: aptalca
tags:
  - letsencrypt
  - nginx
  - reverse proxy
  - port mapping
  - port forwarding
  - dns
hero: ./featured.jpg
---

Our [letsencrypt image](https://hub.docker.com/r/linuxserver/letsencrypt) is great for securely serving web pages and/or reverse proxying services. However, getting the container set up the first time with successful validation can be a challenge if one is having issues with their ports.

This article will focus on troubleshooting port mapping and forwarding. The rest of the set up instructions can be found in our [previously published article](https://blog.linuxserver.io/2019/04/25/letsencrypt-nginx-starter-guide/).

## Port Forwarding and Mapping

As described in the previous article, letsencrypt requires port 80 on the public IP (router) to end up at port 80 of the container for `http` validation  (`dns` and `duckdns` validation methods do not require port mapping/forwarding). And although not required, doing the same with port 443 is highly recommended so one can access their webserver via `https://domain.com` (443 is the default port for https).

The easiest and the most straightforward way is to forward ports 80 and 443 on our router to ports 80 and 443 on our docker host IP. [Portforward.com](https://portforward.com) is a good resource to find out how to port forward correctly on various routers.

Keep in mind that many routers allow users to select `tcp` or `udp` when forwarding ports. HTTP connections are made over `tcp` so make sure to select either `tcp` or `both` in the settings.

Sometimes, using ports 80 or 443 on the docker host may not be possible due to the host system's gui taking up those ports (ie. Unraid, QNAP, etc.). In those cases, we can go through different ports on the host as long as the outside (wan) ports and the container ports are 80 and 443. For instance, it is OK to forward port 80 on the router to port 81 on the docker host, and map port 81 to port 80 in docker run/create or compose (`-p 81:80`). That way the docker host port 80 is not needed, but the requests from the internet at port 80 still end up at port 80 inside the container.

![port-forward-1](/content/images/2019/07/port-forward-1.png)

## DNS Records

We also need to make sure that our DNS records are correct so that the requests for our domain reach our public IP correctly.

If we own our own domain name, we need to make sure that there is an `A` record set for our domain and that it is pointing to our server's public IP. To find out the public IP through commandline, we can do `curl icanhazip.com` and it will return our public IP. For any subdomains we would like to use, we need to create `CNAME`s that point to our `A` record so they too get directed to our public IP. Certain DNS providers like Cloudflare allow wildcard CNAMES, `*`, so any subdomain request gets directed automatically.

If we are using a dynamic dns like DuckDNS, we need to make sure that our custom subdomain is pointing to our public IP. Check on the provider's website to make sure thay have the correct IP address.

## Troubleshooting Ports

If we followed the above steps, but still having issues with either validation or access, there are a few steps we can take.

Unless Let's Encrypt validation is successful, nginx won't be running in our letsencrypt container. 

That is by design. Our nginx config includes references to the Let's Encrypt certs and if they do not exist or are not valid, nginx will give an error and refuse to start. So we make sure that the validation process is completed successfully before we start nginx.

Also, http validation does not use nginx and therefore our nginx config does not affect the validation process. Certbot (the official Let's Encrypt client) puts up its own webserver during validation.

If validation is unsuccessful due to connection issues, the best way to check port forwarding and mapping is to fire up an nginx container with the same port mappings, and to try to access our domain.

Let's assume we are using the following compose yaml to create a letsencrypt container and failing:

    ---
    version: "2"
    services:
      letsencrypt:
        image: linuxserver/letsencrypt
        container_name: letsencrypt
        cap_add:
          - NET_ADMIN
        environment:
          - PUID=1000
          - PGID=1000
          - TZ=Europe/London
          - URL=linuxserver-test.com
          - SUBDOMAINS=www,ombi
          - VALIDATION=http
        volumes:
          - /home/aptalca/appdata/letsencrypt:/config
        ports:
          - 444:443
          - 81:80
        restart: unless-stopped
    

We first stop that container with either `docker-compose down letsencrypt` or `docker stop letsencrypt`. Then we create an nginx container with the same port mappings:

    ---
    version: "2"
    services:
      nginx:
        image: linuxserver/nginx
        container_name: nginx
        environment:
          - PUID=1000
          - PGID=1000
          - TZ=Europe/London
        ports:
          - 444:443
          - 81:80
        restart: unless-stopped
    

We don't need to define any folder mappings because this is just a temporary test container and we won't need to preserve its data.

Once started, the nginx container will fire up the nginx service right away and will be listening on both ports 80 and 443.

Now we can test whether our domain is directed to the container correctly.

The best way to test is to do it from outside of our lan because some routers block connections from going out to the internet only to come right back to the same IP (hairpin NAT or NAT loopback).

So let's take a cell phone, turn off wifi and navigate to `http://domain.com` and `https://domain.com`. If we see the nginx landing page, we're good (https version will have a browser warning about an invalid cert; that's OK; it's just the self signed cert that comes with our test nginx image). If not, we need to fix our port forwarding and/or mapping, or DNS settings as described above.

If you confirmed that the port forwarding, mapping and DNS entries are all correct but the nginx test method is still not working, your ISP might be blocking ports 80 and/or 443. You should be able to google for reports of that happening with your ISP.

Once fixed, we can stop and remove the nginx container and fire up the letsencrypt container.
