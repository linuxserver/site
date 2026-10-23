---
title: Setting Up Authelia With SWAG
date: 2020-08-26T16:00:00Z
author: aptalca
tags:
  - letsencrypt
  - reverse proxy
  - nginx
  - swag
  - Let's Encrypt
  - Authelia
  - web server
  - single sign on
  - SSO
hero: ./featured.jpg
---

[SWAG - Secure Web Application Gateway](https://github.com/linuxserver/docker-swag) (formerly known as letsencrypt) is a full fledged web server and reverse proxy with Nginx, Php7, Certbot (Let's Encrypt™ client) and Fail2ban built in. [Authelia](https://www.authelia.com/) is an open-source authentication and authorization server providing 2-factor authentication and single sign-on (SSO) for your applications via a web portal. This article will detail how SSO via Authelia can be easily set up using SWAG's preset Authelia confs.

This article assumes that you already have a functional SWAG setup. Following is the compose yaml used to create the SWAG and Authelia containers referenced in this article. Keep in mind your local mount paths will be different so adjust accordingly.

**Note that the following assumes you are using Authelia 4.34.6. If you wish to use a newer version, please refer to their [configuration migration guide](https://www.authelia.com/docs/configuration/migration.html) and [release info](https://github.com/authelia/authelia/releases); and adjust your config as appropriate.**

    ---
    version: "2.1"
    services:
      swag:
        image: lscr.io/linuxserver/swag
        container_name: swag
        cap_add:
          - NET_ADMIN
        environment:
          - PUID=1000
          - PGID=1000
          - TZ=America/New_York
          - URL=linuxserver-test.com
          - SUBDOMAINS=wildcard
          - VALIDATION=dns
          - DNSPLUGIN=cloudflare #optional
          - PROPAGATION= #optional
          - DUCKDNSTOKEN= #optional
          - EMAIL= #optional
          - ONLY_SUBDOMAINS=false #optional
          - EXTRA_DOMAINS= #optional
          - STAGING=false #optional
        volumes:
          - /home/user/swag:/config
        ports:
          - 443:443
          - 80:80 #optional
        restart: unless-stopped
      authelia:
        image: ghcr.io/authelia/authelia:4.34.6
        container_name: authelia
        user: "1000:1000"
        environment:
          - TZ=America/New_York
        volumes:
          - /home/user/authelia:/config
        restart: unless-stopped

This yaml will create two containers, one for SWAG and one for Authelia. Since docker-compose automatically creates a [user defined bridge network](https://docs.docker.com/network/bridge/#differences-between-user-defined-bridges-and-the-default-bridge) and puts all containers into that network by default, our containers will be able to reach each other using their container names as DNS hostnames. See our [previous blog article](/blog/2017-10-17-using-docker-networks-for-better-inter-container-communication/) for more info on this. If you're using docker cli or a gui application to create the containers, you will have to manually create a user defined bridge network and attach both containers to that network.

### Setting up Authelia with a users file and 2 factor auth via Duo Mobile

We will go ahead and set up 2 factor authentication utilizing Duo Mobile as the push provider and for brevity, we will use a yaml file to contain the first factor user/pass info. However, Authelia allows various other methods like LDAP, TOTP, etc.

As of Authelia v4.20.0, the default location for all Authelia config is `/config` inside the container, so we will refer to that location in the config files. On the host, that folder is mapped to `/home/user/authelia`. Let's first create the Authelia folders with our user because Authelia does not do chown on its config folder like linuxserver containers do, and we are running it with `user: "1000:1000"`. A simple `mkdir -p /home/user/authelia/logs` with our linux user (in this case uid 1000) should suffice, and both the config folder and the logs folder will be created.

Inside the host folder `/home/user/authelia`, we will place the following Authelia config files, `configuration.yml` and `users_database.yml`:

#### configuration.yml

    server:
      host: 0.0.0.0
      port: 9091
      read_buffer_size: 4096
      write_buffer_size: 4096
      path: "authelia"
    log:
      level: info
      file_path: /config/logs/authelia.log
    jwt_secret: somethingsomethingrandomsecret
    default_redirection_url: https://domain.url
    duo_api:
      hostname: api-somenumber.duosecurity.com
      integration_key: SOMESECRETKEY
      secret_key: somelongersecretkey
    authentication_backend:
      disable_reset_password: false
      file:
        path: /config/users_database.yml
        password:
          algorithm: argon2id
          iterations: 1
          key_length: 32
          salt_length: 16
          memory: 512
          parallelism: 8
    access_control:
      default_policy: deny
      rules:
        - domain:
          - domain.url
          - "*.domain.url"
          policy: two_factor
    session:
      name: authelia_session
      secret: somerandomsecret
      expiration: 1h
      inactivity: 5m
      remember_me_duration: 1M
      domain: domain.url
    regulation:
      max_retries: 3
      find_time: 2m
      ban_time: 5m
    storage:
      encryption_key: somethingsomethingreallylongandsecret
      local:
        path: /config/db.sqlite3
    notifier:
      disable_startup_check: false
      smtp:
        username: myemail@gmail.com
        password: longpassword
        host: smtp.gmail.com
        port: 587
        sender: myemail@gmail.com
        subject: "[Authelia] {title}"
        startup_check_address: test@authelia.com
        disable_require_tls: false
        tls:
          skip_verify: false
          minimum_version: TLS1.2

Let's break it down and look at some of the important lines and their meaning:

    path: "authelia"

Tells Authelia to listen at subfolder `/authelia` for requests (required by the default SWAG config).

    duo_api:
      hostname: api-somenumber.duosecurity.com
      integration_key: SOMESECRETKEY
      secret_key: somelongersecretkey

Duo api settings retrieved from Duo's website.

    authentication_backend:
      disable_reset_password: false
      file:
        path: /config/users_database.yml
        password:
          algorithm: argon2id
          iterations: 1
          key_length: 32
          salt_length: 16
          memory: 512
          parallelism: 8

Tells Authelia to use the file `/config/users_database.yml` for user/password listings. It also defines the password format that Authelia should use and these numbers should be customized based on the hardware specs. Refer to Authelia docs for more info: [https://docs.authelia.com/configuration/authentication/file.html#password-hashing-configuration-settings](https://docs.authelia.com/configuration/authentication/file.html#password-hashing-configuration-settings)

    access_control:
      default_policy: deny
      rules:
        - domain:
          - domain.url
          - "*.domain.url"
          policy: two_factor

Sets the access control policy as `Two Factor` auth for the main domain and all subdomains and sets a default `deny` for unauthorized users. 

One main gotcha in this section is the line `- "*.domain.url"`. In yaml format, all lines starting with a `*` have to be wrapped in quotes, otherwise it will be invalid and Authelia will fail to start due to not being able to parse the yaml.

    storage:
      encryption_key: somethingsomethingreallylongandsecret
      local:
        path: /config/db.sqlite3

Tells Authelia to use a local sqlite database to store all data (as opposed to an external database like mysql/mariadb).

    notifier:
      disable_startup_check: false
      smtp:
        username: myemail@gmail.com
        password: longpassword
        host: smtp.gmail.com
        port: 587
        sender: myemail@gmail.com
        subject: "[Authelia] {title}"
        startup_check_address: test@authelia.com
        disable_require_tls: false
        tls:
          skip_verify: false
          minimum_version: TLS1.2

External SMTP server details for Authelia to send e-mails through (like `forgot password` e-mails).

Notice how the three files defined, `configuration.yml`, `users_database.yml` and `db.sqlite3` are all defined as residing at `/config`, which is the folder we are mounting inside the container.

#### users_database.yml

    users:
      aptalca:
        displayname: "aptalca"
        password: "$argon2id$v=19$m=524288,t=1,p=longrandompasswordhashgenerated"
        email: myemail@gmail.com
        groups: []

This file contains all of the authorized users, their passwords, e-mail addresses (used for password resets via e-mail), and the groups they belong to. In this example, we only have one user set up, but you can create multiple users with multiple group memberships and create a hierarchy.

The password can be generated in command line via `docker run --rm authelia/authelia:latest authelia hash-password yourpassword`. Replace `yourpassword` with your choice of password. See the Authelia docs for more info and optional arguments: [https://docs.authelia.com/configuration/authentication/file.html#passwords](https://docs.authelia.com/configuration/authentication/file.html#passwords)

## Enabling Authelia in SWAG

SWAG comes with two preset Authelia conf files located at `/config/nginx/authelia-server.conf` and `/config/nginx/authelia-location.conf`. To enable Authelia integration, these confs would have to be included (activated) in the `server` and `location` blocks respectively for each domain/subdomain/subfolder served or reverse proxied. Assuming Authelia is set up with `path: "authelia"` in its configuration.yml, these preset Authelia confs do not need any modifications and will work out of the box when enabled.

### Enabling for Heimdall reverse proxied via subdomain:

To enable Authelia for Heimdall on a subdomain, we simply edit the file `/home/user/swag/nginx/proxy-confs/heimdall.subdomain.conf`. In there, we'll see two commented lines for `authelia-server.conf` and `authelia-location.conf`, which reside in the `server` and `location` blocks respectively. We will simply remove the `#` characters from the beginning of those two lines to enable both, and then restart the SWAG container. 

The edited conf should look like this:

    # make sure that your dns has a cname set for heimdall
    
    server {
        listen 443 ssl;
        listen [::]:443 ssl;
    
        server_name heimdall.*;
    
        include /config/nginx/ssl.conf;
    
        client_max_body_size 0;
    
        # enable for ldap auth, fill in ldap details in ldap.conf
        #include /config/nginx/ldap.conf;
    
        # enable for Authelia
        include /config/nginx/authelia-server.conf;
    
        location / {
            # enable the next two lines for http auth
            #auth_basic "Restricted";
            #auth_basic_user_file /config/nginx/.htpasswd;
    
            # enable the next two lines for ldap auth
            #auth_request /auth;
            #error_page 401 =200 /ldaplogin;
    
            # enable for Authelia
            include /config/nginx/authelia-location.conf;
    
            include /config/nginx/proxy.conf;
            resolver 127.0.0.11 valid=30s;
            set $upstream_app heimdall;
            set $upstream_port 443;
            set $upstream_proto https;
            proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    
        }
    }

Now when we try to access `https://heimdall.linuxserver-test.com`, we should be auto-redirected to `https://heimdall.linuxserver-test.com/authelia` and asked for login info.

### Enabling for Bazarr reverse proxied via subfolder:

To enable Authelia for Bazarr on a subfolder, we simply edit the file `/home/user/swag/nginx/proxy-confs/bazarr.subfolder.conf`. Different from the subdomain confs, there is no `server` block in subfolder proxy confs because they all get imported into the main `server` block inside the `default` site conf. Therefore, we'll only see one commented line for `authelia-location.conf` in there. We will simply remove the `#` character from the beginning of that line to enable. Then we need to edit the default site conf at `home/user/swag/nginx/site-confs/default`, [find the line](https://github.com/linuxserver/docker-swag/blob/82ab2597b935b760dc92b2ab48ffa023c8efa48c/root/defaults/default#L31) for `authelia-server.conf` and enable it by removing the `#` preceding it. Then we restart the SWAG container. 

Here's the edited subfolder proxy conf for Bazarr (notice how the `location` block for `/bazarr/api` doesn't contain the authelia conf line, that's because api calls would otherwise fail due to inability to authenticate with Authelia, so we let those calls bypass Authelia):

    # first go into bazarr settings, under "General" set the URL Base to /bazarr/ and restart the bazarr container
    
    location /bazarr {
        return 301 $scheme://$host/bazarr/;
    }
    location ^~ /bazarr/ {
        # enable the next two lines for http auth
        #auth_basic "Restricted";
        #auth_basic_user_file /config/nginx/.htpasswd;
    
        # enable the next two lines for ldap auth, also customize and enable ldap.conf in the default conf
        #auth_request /auth;
        #error_page 401 =200 /ldaplogin;
    
        # enable for Authelia, also enable authelia-server.conf in the default site config
        include /config/nginx/authelia-location.conf;
    
        include /config/nginx/proxy.conf;
        resolver 127.0.0.11 valid=30s;
        set $upstream_app bazarr;
        set $upstream_port 6767;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
    
    location ^~ /bazarr/api {
        include /config/nginx/proxy.conf;
        resolver 127.0.0.11 valid=30s;
        set $upstream_app bazarr;
        set $upstream_port 6767;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

When we try to access `https://linuxserver-test.com/bazarr`, we will get auto-redirected to `https://linuxserver-test.com/authelia` and asked for login info.

## Summary

In a nutshell, in order to enable Authelia for any domain, subdomain or subfolder that is either served or proxied, one has to include (activate) the `authelia-server.conf` in its `server` block, and the `authelia-location.conf` in its `location` block. Everything else works like magic.

If you stumble on any of the steps above, or having issues with other customizations, feel free to drop by [our (Linuxserver) discord](https://discord.gg/YWrKVTn) or [Authelia's Matrix](https://riot.im/app/#/room/#authelia:matrix.org).

If you like our work, you can support both Linuxserver and Authelia teams on OpenCollective:

- [Linuxserver - Open Collective](https://opencollective.com/linuxserver)
- [Authelia - Open Collective](https://opencollective.com/authelia-sponsors)
