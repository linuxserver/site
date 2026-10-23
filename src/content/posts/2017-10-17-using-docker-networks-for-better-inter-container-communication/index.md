---
title: Using Docker networks for better inter-container communication
date: 2017-10-17T21:44:00Z
author: Josh Stark
tags:
  - docker
  - subnet
hero: ./featured.jpg
---

A useful feature of Docker that can often be overlooked is its powerful network engine which allows you to manage subnets within the Docker ecosystem. Generally speaking, most people (myself included) will just map internal ports over to the host and use the host's IP address when accessing container instances remotely.

However, what if you have a collection of containers that need to communicate with one another on a regular basis? Plex to Ombi, for example or Grafana to InfluxDB - grabbing the IP of each container is difficult, requiring you to use `docker inspect <CONTAINER_ID>`. Containers' IPs generally only live as long as the container itself and should be treated as ephemeral, fleeting pieces of information.

Wouldn't it be better if we could refer to other containers by their logical names? For example, tell Ombi to look for `plex:32400` instead of `172.17.0.2:34200`.

## Enter the user-defined network

The process of creating a user-defined network in Docker is insanely easy:

    docker network create <NETWORK_NAME>
    

That's it. You're done. Now, there are a [few other options available](https://docs.docker.com/engine/reference/commandline/network_create/) to you which allow you to further specify the network's behaviour, but for the time being let's assume you just want to maintain the inter-container connectivity.

### What does this network do?

When you create your own Docker network, you tell the docker engine to create a new bridged subnet which any attached containers will belong to.

A subnet is a logical grouping of IP addresses in a larger network. This process allows for more efficient routing of messages to various network hosts, as well as grouping of hosts based on their geographical location, or purpose. Docker creates its own subnet for the default `bridge` and has its internal IP addresses [usually] under the `172.17.0.1/16` range, meaning all containers under the default `bridge` network are logically "grouped" by that IP range (`172.17.0.2` to `172.17.255.255`). As Docker manages its own subnets, the communication between containers is more efficiently handled as traffic is routed through Docker's own internal gateways, rather than it going out to the host, and then back in.

A user-defined network gives you the power to define your own subnet range if you so choose (but this guide won't be covering how to do that). By default, Docker will assign a new subnet range on your behalf when you create a new network.

The engine also uses its built-in DNS to register this network ready for domain name queries - this is how the communication will work.

User-defined networks are completely isolated from one another, meaning a container attached to one network will not be able to communicate with a container attached to another. It is, however, possible to attach multiple networks to a single container. By doing this, you can create a pseudo-DMZ network and link this to a private network - for example, keeping databases separated from front-end web containers, and applying specific iptables rules to each network.

### How do I use it?

Whenever you create a new container in Docker, you'll need to use the `--network` flag to use your new network. For example:

    docker run --name=ombi -d --network=lsio_network linuxserver/ombi:latest
    

By doing this for all containers you wish to be able to talk to each other directly, you can now utilise **the container's name as the host address** to reference each container, rather than the IP address. This works through Docker's DNS, which will resolve the container name to the IP address it leases. For example, linking Ombi to Plex:

![Ombi settings for Plex](/content/images/2017/10/chrome_2017-10-10_21-36-33.png)

> Remember: All containers that need to talk to one another must be part of the same network.

### Docker Compose

If you're a docker-compose user, this can all be done using in your `docker-compose.yml` file. Below is an example of what Ombi's configuration would look like:

    version: "2"
    
    services:
    
      ombi:
        image: linuxserver/ombi
        container_name: "ombi"
        networks:
          - lsio_network
        restart: always
        environment:
          PUID: "1000"
          PGID: "1000"
          TZ: "Europe/London"
        ports:
          - "3579:3579"
        volumes:
          - "/home/user/ombi:/config"
    
    networks:
      lsio_network:
        driver: bridge
