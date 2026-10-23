---
title: Installing Nextcloud On Unraid with LetsEncrypt Reverse Proxy on nextcloud.server.com
date: 2017-05-10T14:28:00Z
author: chbmb
tags:
  - how to
  - unraid
  - nextcloud
  - letsencrypt
hero: ./rgbkamz.png
---

This seems to generate a lot of questions and queries so thought I’d do a quick walkthrough.

## Prerequisites

A working LetsEncrypt container, with your DNS pointing towards your server.  You will need port 443 forwarded to your Unraid and a subdomain you are not using for anything else. (eg `nextcloud.server.com`)

## Information to keep close to hand

You may want to jot these variables down somewhere to reduce confusion.

- Unraid IP Address
- Mariadb Port
- Mariadb Root Password
- Mariadb user name (You'll create this later)
- Mariadb user password (You'll define this later)
- Nextcloud user name (Doesn't need to be the same as the Mariadb name)
- Nextcloud user password
- Domain name

## Install MariaDB

First of all you need to install MariaDB, now one of the stipulations of Nextcloud is that it requires binary logging to be enabled on the MariaDB server. I’ve already got one instance of MariaDB installed without binary logging so I’m going to install a second container to use with Nextcloud.  The newer versions of MariaDB come with binlogging enabled out the box by default, so you could use an existing container for your Nextcloud database if you're already using our container.  You will still need to make the changes below though.  Personally I prefer to have a separate MariaDB instance for Nextcloud and leave the config of my exisiting databases as is.

Add the MariaDB container as usual, you need to change three things if this is a second container.

1. The name (I’ve called mine `mariadb-nextcloud`)
2. The port (I’ve changed the host port to `3305` as my other container is already using port `3306`)
3. The appdata (I’ve put mine in `/mnt/cache/.appdata/mariadb-nextcloud/`)

Don’t forget to set the MariaDB root password (I’ve used `SECRETPASSWORD`)

Add the container. That’s this bit done.

## Edit custom.cnf

Next open up a terminal connection to your MariaDB appdata folder using putty or another SSH client of your choice.  It's preferable to do it this way as it doesn't affect the file permissions or ownership if the `custom.cnf` file, whereas I've noticed a lot of users doing this through Windows & Notepad++ have run into problems regarding this.

Then navigate to your mariadb appdata folder.
`cd /mnt/cache/.appdata/mariadb-nextcloud/`

And edit the custom.cnf file.
`nano custom.cnf`

Press `Ctrl`+`Shift`+`_` or `Ctrl` + `_` (depending on your keyboard type/country) and type in `124` then press `Return` to take you to  line 124 and change it from `#bind-address=0.0.0.0` to `bind-address=0.0.0.0` note the removal of the `#` symbol.

Press `Ctrl` + `x` then type `y` then `Return` to save.

Now restart the MariaDB container to implement this change.
`docker restart mariadb-nextcloud`

## Create Nextcloud database

This used to be done automatically via the webui, but it is now recommended to create the database manually.  First of all open a terminal within the Mariadb container with
`docker exec -it mariadb-nextcloud bash`

then run mysql with
`mysql -uroot -p`

and type your root pasword from earlier (I used `SECRETPASSWORD`)

First thing we're going to do is create a MariaDB user for the database.
`CREATE USER 'chbmb' IDENTIFIED by 'password';`

Then create the nextcloud database with
`CREATE DATABASE IF NOT EXISTS nextcloud;`

then give the user permissions with
`GRANT ALL PRIVILEGES ON nextcloud.* TO 'chbmb' IDENTIFIED BY 'password';`

obviously changing `chbmb` and `password` to whatever you are using.  Then quite mysql with `quit` and exit from the container by issuing the command `exit`

## Install Nextcloud Docker Container

Add Nextcloud from Community Applications, and fill in the docker template. `/data` should be mapped to where you want your shared files stored on your array. I’m using `/mnt/user/nextcloud/`  Note I've changed the host port to `444` so it doesn't conflict with my LetsEncrypt reverse proxy port which I've left on the default of 443.

![](http://i.imgur.com/RGBKAMZ.png)

Then install it and give it a minute or so for the file to be inflated before trying to access the webui.

## Configure Nextcloud

Open the webui and you need to fill in several items.

1. Fill in your admin username (I’m using CHBMB
2. Fill in your admin password (This is different to the MariaDB user password you set earlier (I’m using `passwordsecret`)
3. Click MySQL/MariaDB
4. For database user enter the MariaDB user you created earlier
5. For database password enter your MariaDB user password (I used `password`)
6. For database name I’m using `nextcloud`
7. Replace `localhost` with your Unraid ip address and the host port of MariaDB (For me that is `192.168.0.1:3305`)

![](http://i.imgur.com/bWWIBl0.png)

Then click `Finish setup` and wait for the Nextcloud webui to appear.

## Setting Up A Letsencrypt Reverse Proxy

I’m going to show the recommended way to reverse proxy nextcloud with our Letsencrypt container.  This guide assumes you already have the Letsencrypt container up and running.

We're going to put Nextcloud on a dedicated subdomain, such as `https://nextcloud.server.com`.

The reason for this is explained here.  Nextcloud actually run a security scanning site at [https://scan.nextcloud.com/](https://scan.nextcloud.com/) and the maximum grade you can get using `https://server.com/nextcloud` is A compared with A+ on `https://nextcloud.server.com`.  Not going to get into the argument here, but this is an excerpt from a blog post from Nextcloud about why they arrived at this conclusion.

> Same-site cookies support
> 
> The Same-site cookie support in Nextcloud 11 has been hardened even further. Same-Site cookies are a security measure supported by modern browsers that prevent CSRF vulnerabilities and protect your privacy further.
> 
> Browsers that support same-site cookies can be instructed in a way to only send a cookie if the request is originating from the original domain. This makes exploiting CSRF vulnerabilities from other domains a non-issue. Also timing attacks, such as enumerating whether a specific file or folder exists, are not feasible anymore. Nextcloud enforces the same-site cookies to be present on every request by enforcing this within the request middleware.
> 
> As hardening measure, in Nextcloud 11 we have added the __Host prefix to the cookie if the environment supports this feature. This enforces the cookie to be only sent via HTTPS and only be sent only to the host that has set this cookie. This mitigates cookie injection vulnerabilities within potential third-party software sharing the same second level domain. Note that Nextcloud does also employ regular protections against CSRF such as a shared secret between browser and client. Same-Site cookies are just considered a security hardening. More technical details about the original implementation can be read in this blog.

### To access on `https://nextcloud.server.com`

Before you tackle this, make sure you actually have setup a domain setup with it's DNS pointing to your server.

In your letsencrypt container "appdata" go to `/config/nginx/site-confs/` and create a file called `nextcloud` containing this code below.  Make sure you change `server.com` to

your actual domain name, and edit the `proxy_max_temp_file_size` parameter to a size appropriate for your use.

    server {
    	listen 443 ssl;
    	server_name nextcloud.server.com;
    
    	root /config/www;
    	index index.html index.htm index.php;
    	
    	###SSL Certificates
    	ssl_certificate /config/keys/letsencrypt/fullchain.pem;
    	ssl_certificate_key /config/keys/letsencrypt/privkey.pem;
    	
    	###Diffie–Hellman key exchange ###
    	ssl_dhparam /config/nginx/dhparams.pem;
    	
    	###SSL Ciphers
    	ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
    	
    	###Extra Settings###
    	ssl_prefer_server_ciphers on;
    	ssl_session_cache shared:SSL:10m;
    
            ### Add HTTP Strict Transport Security ###
    	add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
    	add_header Front-End-Https on;
    
    	client_max_body_size 0;
    
    	location / {
    		proxy_pass https://192.168.0.1:444/;
            proxy_max_temp_file_size 2048m;
            include /config/nginx/proxy.conf;
    	}
    }
    

Then you need to enter your nextcloud "appdata" and edit the file `/config/www/nextcloud/config/config.php`

so it looks like this

    <?php
    $CONFIG = array (
     'memcache.local' => '\\OC\\Memcache\\APCu',
     'datadirectory' => '/data',
     'instanceid' => 'xxxxxxxxxxxx',
     'passwordsalt' => 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
     'secret' => 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
     'trusted_domains' => 
     array (
     0 => '192.168.0.1:444',
     1 => 'nextcloud.server.com',
     ),
     'overwrite.cli.url' => 'https://nextcloud.server.com',
     'overwritehost' => 'nextcloud.server.com',
     'overwriteprotocol' => 'https',
     'dbtype' => 'mysql',
     'version' => '11.0.1.2',
     'dbname' => 'nextcloud',
     'dbhost' => '192.168.0.1:3305',
     'dbport' => '',
     'dbtableprefix' => 'oc_',
     'dbuser' => 'oc_CHBMB1',
     'dbpassword' => 'xxxxxxxxxxxxxxxxxxxx',
     'logtimezone' => 'UTC',
     'installed' => true,
     );
    

That pretty much involves adding these four lines in the appropriate places as shown:

    1 => 'nextcloud.server.com',
    

and

    'overwrite.cli.url' => 'https://nextcloud.server.com',
    'overwritehost' => 'nextcloud.server.com',
    'overwriteprotocol' => 'https',
    

Once that's all done restart the Nextcloud and LetsEncrypt containers and all should be working.
