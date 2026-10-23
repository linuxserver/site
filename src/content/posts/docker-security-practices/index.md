---
title: Docker Security Practices
date: 2025-02-18T23:25:00Z
author: Quietsy
description: Follow these practices to secure containers
tags:
  - containers
  - docker
  - how to
  - security
hero: ./security.jpeg
---

We often get asked how to secure docker and what are good practices for running containers securely.

First, we need to understand the possible attack vectors:

- Insecurely exposed - the most common attack vector, users often expose the Web-UI of apps without securing it properly.
- Malicious image - not properly vetting the image, for example running it via a 3rd party application catalog without sufficient information about the creator or source code.
- Trusted image with a malicious dependency - supply chain attacks can affect any application when a dependency contains malicious code.
- Lateral movement - any device on the network can get infected, the attacker can move from that device to your server through your applications.
- Vulnerabilities and bugs - applications have vulnerabilities and bugs, some of them could be exploitable, with a range of possible impacts.

What can we do about it?

- Properly vet image sources.
- Update regularly but not automatically.
- Follow the principle of least privilege.
- Limit container resources.
- Maintain regular backups.

Here's a list of easy to implement good practices, we'll keep it short and simple for our less-technical readers, therefore it won't include everything possible.

## Trusted Sources

Don't run images from unknown sources, many of them contain malware or unmaintained code vulnerable to attacks.

Find the source code of images and vet the level of trust by their popularity (stars, pulls), and release schedule.

## Regular Updates

Regularly update the host, docker engine, and containers, to protect yourself from vulnerabilities that have been fixed in later versions.

Don't use tools that automatically update your containers, you'll risk pulling images impacted by a compromise or supply chain attack before they can be identified.

## Docker Socket Proxy

Don't mount the docker socket (`/var/run/docker.sock`) directly to containers, it's a common misconception that mounting it as read-only helps, it prevents the socket file from being deleted but doesn't limit using it at all.

The docker socket allows an attacker inside a container to easily escape it and take over the host.

Use a [docker socket proxy](https://github.com/linuxserver/docker-socket-proxy) instead with the least amount of privileges needed as it's better to expose the socket to one simple container that you can easily verify the functionality of, rather than exposing it to every random image that asks you to mount the socket for it to work.


## No new privileges

Prevent escalating privileges from inside the container and using `sudo`, `doas`, and `suid` inside the container.

```yaml
  security_opt:
    - no-new-privileges=true
```

It might break some images that require it to function properly.

## Dangerous Privileges

Avoid granting `privileged` and elevated capabilities such as `SYS_ADMIN` to containers, these privileges allow an attacker inside a container to easily escape it and take over the host.

## Non-root

Run containers with a non-root user using [PUID/PGID](https://docs.linuxserver.io/general/understanding-puid-and-pgid/) or [user](https://docs.linuxserver.io/misc/non-root/) to limit the capabilities of an attacker inside a container.

```yaml
  somecontainer:
    environment:
      - PUID=1000
      - PGID=1000
  othercontainer:
    user: "1000:1000"
```

## Resource Limits

Set resource limits on containers to prevent memory leaks and other behaviors from crippling the host.

Use an anchor as a base for all your containers and override specific values per container if necessary.

```yaml
x-base: &base
  mem_limit: 2000m # Override per container if necessary
  pids_limit: 200
  cpus: "3.5" # Set below the total number of cores, for example 3.5 for 4 cores
  logging:
    options:
      max-size: "10m"
      max-file: "3"
  security_opt:
    - no-new-privileges=true
services:
  somecontainer:
    <<: *base
    environment:
      - PUID=1000
      - PGID=1000
```

## Backups

Backup the compose file and container bind mounts on the host regularly, it will allow you to recover from a breach and start fresh.

Be aware of any applications that have their own special backup tools, such as postgres/mariadb, or cannot be backed up while they are running.

## Future Efforts

Security is more than blindly following blog posts but understanding the threat model and mitigations. Keep evolving your security posture over time, nothing is ever 100% secure.
