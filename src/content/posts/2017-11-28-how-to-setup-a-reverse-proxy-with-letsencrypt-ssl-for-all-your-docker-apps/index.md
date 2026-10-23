---
title: How to setup a reverse proxy with LetsEncrypt SSL for all your Docker apps
date: 2017-11-29T01:45:00Z
author: IronicBadger
tags:
  - how to
  - ssl
  - reverse proxy
hero: ./featured.jpg
---

The reverse proxy. One of those projects you put off for years but when you finally get to it you find that it was relatively simple all along. We can't hope to cover everything relating to such a broad topic in one article but we'll use an nginx based reverse proxy to get you started. Below, we detail how to expose certain services using the LinuxServer.io [LetsEncrypt](https://hub.docker.com/r/linuxserver/letsencrypt/) docker container.

![letsencrypt](https://github.com/letsencrypt/website/raw/master/images/le-logo-wide.png)

We'll cover a few basic apps, including Plex, and provide example configurations along the way leaving the rest up to you, the community to post examples in the comments, as a [Github gist](https://gist.github.com/) or over on our new [Discord server](https://discord.gg/ctsYTAq).

> All the files required for this article are available on Github [here](https://gist.github.com/IronicBadger/362c408d1f2c27a0503cb9252b508140).

## Why?

![](/content/images/2017/09/Screen-Shot-2017-09-19-at-16.34.14.png)

Why? Always a good question to ask before investing your time into a project. In this case there are several answers...

1. No more port numbers. For years I remembered which service was on which port and which needed special URLs, etc. No more. Now I have `my.domain.tld/service`.
2. Security. TLS termination removes the complexity of installing an SSL cert per service. Do it once in the reverse proxy and you're good.
3. Security. I only need open port 443 to the outside world instead of a whole range of random ports.
4. Security. I can now use the reverse proxy to provide a single point of authentication for all HTTP requests.
5. There are many more reasons than this such as those listed [here](http://mikehadlow.blogspot.co.uk/2013/05/the-benefits-of-reverse-proxy.html).

Over the last few years there have been some very useful tools created to make this process so simple that there's no good excuse not to do it now! I am of course talking primarily about Let's Encrypt, a free SSL certificate provider - something for which you previously had to pay real space bucks to obtain. Then there's docker, which makes encapsulating applications as easy as its ever been. We'll combine the two to create our solution in this article.

###### What about a VPN?

During the setup process your web server must be publicly accessible (so that Let's Encrypt can perform validation) but you might not always want that to be the case. In fact, I'd probably suggest mixing this with a VPN for proper security anyway. Brute forcing HTTP passwords isn't unheard of and you'll still get all the benefits of the reverse proxy except your URLs won't be publicly available. That's a topic for another article entirely, though.

## What is a reverse proxy?

A reverse proxy is a type of proxy server that retrieves resources on behalf of a client from one or more servers. These resources are then returned to the client as if they originated from the Web server itself.

![](/content/images/2017/09/reverseproxy.png)

Let's take nginx itself as an example here. Nginx is a simple web server. You can go run it on your system in a few seconds with docker.

    docker run -p 80:80 nginx
    

If you want nginx to be visible to the outside world you will need to start doing port forwarding on your firewall. Usually you'll end up repeating this process at least once per externally facing service. Before long, you have a dozen or more rules pointing at random ports.

In our example above we mapped port 80 of the container to port 80 on the host. This is fine but we can do better. With a reverse proxy we can use docker's native DNS functionality to refer to the containers by name and leave port closed on both the firewall and the container itself.

## How?

> If you're confused at any point, head on over to our [Discord](([https://discord.gg/ctsYTAq](https://discord.gg/ctsYTAq)) for help.

You will require a domain to do this as Let's Encrypt will perform an ownership validation during the process. You don't need to actively control the DNS only have the ability to point the A record for the (sub)domain at the `letsencrypt` container. The (sub)domains must forward to the Let's Encrypt container for SSL validation to work. This probably means forwarding port 443 in your firewall to the system on which the `letsencrypt` container will run.

*Optionally*, to test that your (sub)domain resolves correctly run an nginx server (as shown above) on port 443 and ensure that you can resolve it from the internet. You may need to investigate a dynamic DNS service to ensure your IP is updated to match the DNS record. If you're confused at any point, head on over to our [Discord](([https://discord.gg/ctsYTAq](https://discord.gg/ctsYTAq)) for help.

I use [docker-compose](https://docs.docker.com/compose/) to manage the containers on my system. Below is a snippet from my `docker-compose.yml` file used to create them. A full version is available on Github [here](https://gist.github.com/IronicBadger/362c408d1f2c27a0503cb9252b508140).

Using the snippet below we will end up with three subdomains configured. `sub.domain.tld`, `service1.domain.tld` and `service2.domain.tld`. For each of these subdomains we can have an unlimited number of suffixes such as `sub.domain.tld/libresonic`, all with valid SSL certificates - *automatically*.

    # docker-compose.yml
    ---
    version: '2'
    services:
      letsencrypt:
        image: linuxserver/letsencrypt
        container_name: letsencrypt
        ports:
          - 443:443
        volumes:
          - /opt/appdata/letsencrypt/config:/config
        restart:
          always
        depends_on:
          - grafana
          - libresonic
        environment:
          - PUID=1050
          - PGID=1050
          - EMAIL=some@thing.com
          - URL=domain.tld
          - SUBDOMAINS=sub,service1,service2
          - TZ=Europe/London
    

There are several more environment variables that you can pass to this container if you wish. To find all the available options, I advise that you read the documentation attached to the container on Github at [github.com/linuxserver/docker-letsencrypt](https://github.com/linuxserver/docker-letsencrypt).

Start the container using docker-compose.

    docker-compose -f /path/to/docker-compose.yml up -d
    

The container will handle negotiating with Let's Encrypt automatically for us using the parameters specified. We don't need to interact with the process and once first boot has finished (use `docker logs -f <container-name>` to keep an eye on it's progress) you should be able to access your domain via https securely!

> Note: First run may take a long time as the Diffie Hellman parameters are generated (these form the basis of your SSL cert crypto). It can take up to an hour on slower systems.

###### Optional top tip

Use bash aliases. Put this in your `~/.bash_profile`...

    alias dcp='docker-compose -f /opt/docker-compose.yml ' 
    

Then you can simply `dcp up -d` instead. Link to my [bash-aliases](https://gist.github.com/IronicBadger/362c408d1f2c27a0503cb9252b508140#file-bash_aliases).

#### Configuration

By now, you ought to have the letsencrypt container up and running. Notice in the `docker-compose.yml` file that we asked the container to use a volume (`/opt/appdata/letsencrypt/config`) for it's configuration? Let's look in that directory now. There should be a bunch of files in each directory but the ones we're interested in all live in `nginx`.

    ├── nginx
    │   ├── dhparams.pem
    │   ├── nginx.conf
    │   ├── proxy.conf
    │   └── site-confs
    │       └── default
    └── www
        └── index.html
    

99% of the time you will be editing `nginx/site-confs/default`. Infact, I edit this file so often I added a bash alias to `~/.bash_profile`:

    alias editle='vi /opt/appdata/letsencrypt/config/nginx/site-confs/default'
    

This file tells nginx where to look for the SSL certs automatically generated above, how to handle the various "locations" (probably your apps) and how to handle plain http traffic (in my case I redirect everything to https).

You can mostly leave this file alone save for the "location" sections. Take the first example, ombi. When I browse to `https://my.domain.tld/ombi` nginx will match the requests it recieves against that patterns in the `default` file and forward the traffic. Each HTTP(S) request contains what are known as 'headers' (full explanation [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)) which allow the server and client to pass more complicated messages around than simply `http(s)://url`.

    location /ombi {
        proxy_pass http://ombi:3579/ombi;
        include /config/nginx/proxy.conf;  
    }
    

So what happens when you want to run a more complicated application that requires the full contents of the headers to be preserved and passed through to the underlying application? Well, in this case you're going to have to ask the developer for help. Googling can get you a decent part of the way through but it's often a case of trial and error until it works. Let's take `airsonic` as our next example...

    location /sonic {
        proxy_pass http://libresonic:4040/sonic;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    

See how this a bit more complicated than the last entry? We're asking the proxy (nginx) to pass through information in addition to the basic `proxy_pass` command. Hopefully this unweaves a bit of the magic of a reverse proxy for you. I recall the first time I looked at one of these files and just thought it looked like utter gobbledegook.

There are several more examples in the [repo](https://gist.github.com/IronicBadger/362c408d1f2c27a0503cb9252b508140) provided. Please, if you find a working config for an app not already listed feel free to add it in the comments below to help your fellow linuxserver readers out.

#### Sub-domain configuration

To configure a new sub-domain firstly you should add it to your `SUBDOMAINS` in the container start-up configuration. Next, you should add a new server block to your configuration file.

Here's an [example](https://gist.github.com/aptalca/ce05dded99ae0facc80fd361144b238c) with wordpress as the subdomain. The basic gist is to copy most of the info from the original block and update the server name (everything except the `default-server` initiative).

##### Docker DNS

You may have noticed in the example files attached that none (or very few) of my apps have their ports exposed outside the container. That's because the `letsencrypt` container lives on the same docker [network](https://docs.docker.com/engine/userguide/networking/) as all the others. Therefore we can make use of the inbuilt DNS resolution features of docker and refer to each container by name.

This approach might cause you some pain though. My 'workaround' is to use the [`depends_on`](https://gist.github.com/IronicBadger/362c408d1f2c27a0503cb9252b508140#file-docker-compose-yml-L13) tag in my [`docker-compose.yml`](https://gist.github.com/IronicBadger/362c408d1f2c27a0503cb9252b508140#file-docker-compose-yml) file under the `letsencrypt` container definition. That way, letsencrypt won't be started until the other containers have thus eliminating the startup order dependency this approach can normally be ruined by.

## Traefik

An interesting project which you might like to experiment with is the [Traefik](https://traefik.io/) project.

> Træfik (pronounced like traffic) is a modern HTTP reverse proxy and load balancer made to deploy microservices with ease. It supports several backends (Docker, Swarm mode, Kubernetes, Marathon, Consul, Etcd, Rancher, Amazon ECS, and a lot more) to manage its configuration automatically and dynamically.

Take a look, decide which approach you prefer. Traefik even supports Let's Encrypt. For high churn environments something like Traefik would be invaluable. On a single server hosting a few relatively static docker containers, the approach covered in this article will probably suffice. YMMV.
