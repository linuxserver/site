---
title: Introducing SWAG - Secure Web Application Gateway
date: 2020-08-21T19:49:00Z
author: aptalca
tags:
  - letsencrypt
  - reverse proxy
  - nginx
  - fail2ban
  - swag
  - php
  - certbot
  - Let's Encrypt
hero: ./featured.jpg
---

[SWAG](https://hub.docker.com/r/linuxserver/swag) is a rebirth of our [letsencrypt docker image](https://hub.docker.com/r/linuxserver/letsencrypt), a full fledged web server and reverse proxy that includes Nginx, Php7, Certbot (Let's Encrypt client) and Fail2ban.

![](/content/images/2020/08/swag.gif)

## Why the change?

Long story short, we were recently contacted by Let's Encrypt, who politely let us know that `letsencrypt` is trademarked by them and that we should pick a different name for our docker image. Legal concerns aside, we also realized that some users were confused about whether this image was an official release by Let's Encrypt (it's not). We decided that re-branding our image was the best course of action.

Little bit of history, our repo was originally called `letsencrypt` because this image was almost identical to our [Nginx docker image](https://hub.docker.com/r/linuxserver/nginx), except it contained the official Let's Encrypt client software, which was called `letsencrypt` at the time. This was years ago. Since then, Let's Encrypt transferred ownership of the client to the [Electronic Frontier Foundation](https://www.eff.org/), and the client was renamed [Certbot](https://certbot.eff.org/). That's when Let's Encrypt made various changes to their branding and reserved the use of the trademarked phrase `Let's Encrypt` for the company behind the project.

## What is SWAG for?

SWAG is really a LEMP stack minus the M. For those unfamiliar, the letters stand for L=Linux, E=Nginx (because it's pronounced Engine-X), M=MySQL/MariaDB and P=PHP. SWAG has all but MySQL/MariaDB, for which we recommend pairing with our [MariaDB docker image](https://hub.docker.com/r/linuxserver/mariadb) if needed. Apart from those, SWAG has the Let's Encrypt client Certbot integrated, for automating retrieval and management of free SSL certs. It also has Fail2ban for intrusion detection and prevention.

Because it is a full-fledged webserver, you can use SWAG to host your own website, whether it is plain html, or Wordpress based, or reverse proxy other services. SWAG does include [dozens of preset reverse proxy configs](https://github.com/linuxserver/reverse-proxy-confs) for popular apps, most of which work out of the box, and can be enabled via a simple file rename.

For authentication, SWAG includes snippets in its Nginx confs for basic HTTP Auth, LDAP via our [ldap-auth image](https://hub.docker.com/r/linuxserver/ldap-auth), and [Authelia](https://www.authelia.com/) (2 factor), all of which can be easily enabled by un-commenting their respective lines.

For security, SWAG has [Fail2ban](https://github.com/fail2ban/fail2ban) built-in and enabled for HTTP Auth by default. Other filters and actions can be set up by editing the local config files.

## How to migrate from letsencrypt?<a id="migrate"></a>

At this point, the SWAG and letsencrypt images are 100% compatible and we plan to keep SWAG backwards compatible as long as we can. The main change is to the `docker image name`, which was `linuxserver/letsencrypt` for the old image and is `linuxserver/swag` for the new. 

### Docker cli migration:

- Stop and remove existing container via `docker stop letsencrypt` and `docker rm letsencrypt`
- Create a new container using the sample on the [SWAG page](https://hub.docker.com/r/linuxserver/swag) (container name: `swag`, image name: `linuxserver/swag`)
- As long as you keep the `/config` folder mapping the same, all your previous config and data will be picked up by the new container

### Docker-compose migration:

- Edit the compose yaml to change the image to `linuxserver/swag` and change the service and container names to `swag`
- Issue `docker-compose up -d --remove-orphans`
- If you don't want to use the option `--remove-orphans`, then you can first do `docker-compose down`, then edit the compose yaml as above, and then issue `docker-compose up -d`

>Keep in mind that since the initial release of SWAG, many changes have been made to the conf files. Some may be breaking changes. Please look through the [SWAG changelog](https://github.com/linuxserver/docker-swag#versions) and pay attention to the items labeled `Existing users should update` for such changes. The docker log should also list the conf files that have since been updated.

> If you have any containers that reference the old `letsencrypt` container by name, you'll also have to change those references to reflect the new container name `swag`. One prominent known case is that Nextcloud's `config.php` references the reverse proxy container by name in its `trusted_proxies` directive, which would have to be updated to `swag`.

## How to set up SWAG?

First step is to read the main readme on Github to become familiar with the options: [https://github.com/linuxserver/docker-swag/blob/master/README.md](https://github.com/linuxserver/docker-swag/blob/master/README.md)

You can also check out this guide we created for SWAG with various real world examples of hosting websites as well as reverse proxying services: [https://docs.linuxserver.io/general/swag](https://docs.linuxserver.io/general/swag)
