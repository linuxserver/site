---
title: How to fix Nextcloud 16 desktop client login loop
date: 2019-07-09T03:37:00Z
author: IronicBadger
tags:
  - nextcloud
  - docker
  - linux
hero: ./featured.jpg
---

Since upgrading to Nextcloud 16 a few weeks ago I've not been able to get my desktop sync clients to work. The issue manifested itself as a 'login loop' where I would log in to a sync client, provide my 2FA token and then click *grant access* only to be promptly dumped back at the original login screen. Rinse and repeat a few times before giving up.

At first I suspected 2FA was at fault so I temporarily disabled this. Nope. 

Eventually after creating my own thread on the Nextcloud support forums I found the issue, a missing configuration parameter in `config.php`. 

PSA - We already suggest you set these parameters in our [LetsEncrypt container](https://hub.docker.com/r/linuxserver/letsencrypt) - you can find the config [here](https://github.com/linuxserver/reverse-proxy-confs/blob/master/nextcloud.subdomain.conf.sample#L5-L7).

Full details (and credit) can be found in the following support thread [here](https://help.nextcloud.com/t/solved-nextcloud-desktop-client-2-5-2-login-loop-fails-with-nextcloud-16-0-1-works-with-nextcloud-15/54463). The full fix can be found on Github [here](https://github.com/nextcloud/server/issues/13431#issuecomment-456453585) and a snippet is below:

> I had a similar issue regarding the redirect , mine was related to url overwrite protocol option that should be set in `config/config.php` .
> In previous version this was not necessary but apparently since 15.0.2 it is.
> So I had to go from (config.php)
> `{...} 'overwrite.cli.url' => 'https://domain.lu', {...}`
> to
> `{...} 'overwrite.cli.url' => 'https://domain.lu', 'overwritehost' => 'domain.lu', 'overwriteprotocol' => 'https', {...}`

Turns out this has actually been a bug since 15.0.2 but for some reason I never ran into it. This issue is specific to running out of a container because of how `localhost` is handled with `proxy_pass`. A full explanation is [here](https://github.com/nextcloud/server/issues/13713) and a snippet is below:

> Whenever a redirect happens, like from the `/apps/` to the `/apps/files/` path, NextCloud now redirects using the server provided hostname and port instead of the one requested by the client. For instance, if running via Docker on `localhost:8000` and using a proxy pass with cloud.example.com, the address `cloud.example.com/apps/` will redirect to `localhost:8000/apps/files/`.

So there you are, a nice quick post today but hopefully this saves you some trouble in the future.
