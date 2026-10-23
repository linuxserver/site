---
title: Using Traefik as a Reverse Proxy with Docker
date: 2018-02-04T00:48:00Z
author: hackerman
tags:
  - linux
  - reverse proxy
  - docker
  - traefik
hero: ./featured.jpg
---

Nginx is a great reverse proxy to put in front of your containers. But what if I told you there's another solution? One that involves less configuring, still supports LetsEncrypt, and automatically adapts as you add and remove containers?

This post will get you up and running with Traefik (and LetsEncrypt) with little to no configuration.

## Why Traefik?

What got me interested in Traefik as my reverse proxy was its feature that it can 'watch' for docker containers you are running and automatically start sending requests to them based on the requested host. In nginx, setting up a proxy to a conatiner is pretty simple. Create a `.conf` file for each container like this:

    server {
      server_name plex.domain.com;
    
      location / {
        proxy_pass http://plex:32400;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    
        # HTTP 1.1 support
        proxy_http_version 1.1;
        proxy_set_header Connection "";
      }
    }
    

When you create a new container, you copy this file to a new version, change the `server_name` and `proxy_pass` entries, restart nginx, and you're good to go. Nothing crazy, but still a step to be taken. However, if you ever take down a container for any reason and nginx restarts, it will fail due to the `proxy_pass` host not existing. You would have to move (or remove) the config file for that container until it would start back up.

Traefik has many supported backends, and it's docker configuration in my setup looks something like this:

    [docker]
    endpoint = "unix:///var/run/docker.sock"
    domain = "domain.com"
    watch = true
    exposedbydefault = false
    

  
In order for Traefik to watch and act on containers coming up and down, it needs read-only access to the docker socket (/var/run/docker.sock). Please keep in mind that Traefik can read events from the docker daemon and some may consider this a security implication. [(1)](https://medium.com/lucjuggery/about-var-run-docker-sock-3bfd276e12fd)[(2)](https://github.com/moby/moby/issues/21109)

Let's break this down.

- The endpoint here is basically where Traefik should watch for available containers.
- The domain is the domain that will ultimately serve in constructing the necessary host to serve to each container (we'll get into the hostnames shortly).
- `watch = true` tells docker to constantly watch for new (or no longer available) containers
- `exposedbydefault = false` is a personal preference. By default, Traefik will make any container availabe via its hostname. I have this set to false as there are some containers I don't want available publicly.

This is all you need to fire off Traefik and have it automatically start serving traffic to your containers as you add and remove them. No config files, no restarting the process, just simple.

## Traefik Routing

Out of the box when creating a new container instance using `docker run` Traefik uses two primary methods for routing traffic to containers:

- `container_name.domain.com`
- any ports that have been exposed

This could be wrong, but I get into customising the port information below. Feel free to comment and I will correct this information if required...

I mentioned above that Traefik just seems to work without config files per container, and this is *somewhat* right. If your container is named what you want the subdomain to be, the domain in the config will be the domain for every container, and you **aren't** running your project via `docker-compose`, then you are all set and can skip this section! But if you're like me and some containers have a name that isn't the subdomain and your entire project is run via `docker-compose`, then read on!

If you're running in `docker-compose`, then Traefik will route if the request is formatted like `service.project_name.domain.com`. You probably don't want to have the docker compose project in the subdomain. Also, publishing every container port is usually not necessary since they are all on the same project network and the proxy can route to them without them being exposed. So how do you customize the host and port of each container? Simple add some `labels` to each container to let Traefik know how you want it to route to it.

    labels:
      - "traefik.enable=true"
      - "traefik.port=32400"
      - "traefik.frontend.rule=Host:plex.domain.com"
    

In this example, this `labels` block is inside the Plex service definition. This tells Traefik to send requests to this container when the host is `plex.domain.com` and send requests to port 32400 of the container. The `traefik.enable=true` here is to tell Traefik to recognize this container since previously we set `exposedbydefault = false`. If you didn't do this, you can ignore this label.

Do this for each container, and your routes will be all set! Now I know I said that you don't need any configs, but consider that this is a one-time add and you don't need to add / remove config files as you add and remove containers.

But it's that simple. A couple labels on each container, and Traefik will know what to do.

## LetsEncrypt!

Did I mention that Traefik also supports LetsEncrypt? And not only will it handle the certs for you, it will handle them automatically as you add and remove containers, just like it will automatically route the traffic! No more environment variables to tell it which subdomains to get certs for!

This part is pretty simple, but depending on how you want to handle the certs, your config may vary slightly (more information [here](https://docs.traefik.io/user-guide/examples/#lets-encrypt-support)).

    [acme]
    email = "me@example.com"
    storage = "acme.json"
    entryPoint = "https"
    OnHostRule = true
    dnsProvider = "cloudflare"
    

This config handles LetsEncrypt certs set to your email and it saves them to `acme.json` file. The `OnHostRule = true` tells Traefik to automatically generate certificates if the backend has a valid host. So, as above, it won't attempt to get a certificate for any containers you don't want exposed.

I run all of my DNS through CloudFlare so that my origin IP is hidden. If using DNS challenge instead of HTTP(S), you'll need to include some [environment variables](https://docs.traefik.io/configuration/acme/#provider) based on your provider. They also provide HTTP challenges compatible with both HTTP and HTTPS entry points.

Also, you probably want to re-route all non-HTTP traffic to HTTPS:

    [entryPoints]
      [entryPoints.http]
      address = ":80"
        [entryPoints.http.redirect]
        entryPoint = "https"
      [entryPoints.https]
      address = ":443"
      [entryPoints.https.tls]
    
    [retry]
    

## Putting It All Together

Let's put this all together and fire it up! Below is an example Traefik configuration file and docker compose project that should get you up and running with LetsEncrypt support to your Plex container.

*traefik.toml*

    [entryPoints]
      [entryPoints.http]
      address = ":80"
        [entryPoints.http.redirect]
        entryPoint = "https"
      [entryPoints.https]
      address = ":443"
      [entryPoints.https.tls]
    
    [retry]
    
    [docker]
    endpoint = "unix:///var/run/docker.sock"
    domain = "domain.com"
    watch = true
    exposedbydefault = false
    
    [acme]
    email = "me@example.com"
    storage = "acme.json"
    entryPoint = "https"
    OnHostRule = true
      [acme.httpChallenge]
      entryPoint = "http"
    

*docker-compose.yaml*

    version: '2'
    services:
      plex:
        container_name: plex
        image: linuxserver/plex
        environment:
          - TZ=America/New_York
          - PUID=1000
          - PGID=1000
        volumes:
          - /plex:/config
          - /mnt/storage/movies:/movies
          - /mnt/storage/tv:/tvshows
        labels:
          - "traefik.enable=true"
          - "traefik.port=32400"
          - "traefik.frontend.rule=Host:plex.domain.com"
      traefik:
        container_name: traefik
        image: traefik:alpine
        ports:
          - 80:80
          - 443:443
          - 8080:8080
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock:ro
          - /traefik/traefik.toml:/etc/traefik/traefik.toml
          - /traefik/acme.json:/acme.json
    

Fire this up and you should have Plex available via `https://plex.domain.com` with a LetsEncrypt cert!

## Caveats

I did run into one issue specific with the Nextcloud container (or any container that requires `https` as its requested protocol). But again, the solution is pretty simple. Just tell Traefik which protocol to use:

    labels:
      - "traefik.enable=true"
      - "traefik.protocol=https"
      - "traefik.port=443"
    

In addition, Traefik will attempt to validate the cert of the container, which obviously won't succeed. So add the following to your `traefik.toml` file to get around this (at the top level):

    InsecureSkipVerify = true
    

## Conclusion

TLDR; Traefik, once set up, will handle adding and removing your containers, automatically routing traffic to the new containers (if desired) and LetsEncrypt for all your containers automatically! Let me know how it goes for you or any issues you ran into.
