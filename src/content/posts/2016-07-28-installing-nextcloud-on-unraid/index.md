---
title: Installing Nextcloud on Unraid
date: 2016-07-28T22:35:00Z
author: chbmb
tags:
  - containers
  - docker
  - guide
  - how to
  - install
  - linux
  - open source
  - beginner
  - unraid
hero: ./1.png
---

This seems to generate a lot of questions and queries so thought I’d do a quick walkthrough.

## Install MariaDB

First of all you need to install MariaDB, now one of the stipulations of Nextcloud is that it requires binary logging to be enabled on the MariaDB server. I’ve already got one instance of MariaDB installed without binary logging so I’m going to install a second container to use with Nextcloud.

Add the MariaDB container as usual, you need to change three things if this is a second container.

1. The name (I’ve called mine `mariadb-nextcloud`)
2. The port (I’ve changed the host port to `3305`)
3. The appdata (I’ve put mine in `/mnt/cache/.appdata/mariadb-nextcloud`/

Don’t forget to set the MariaDB root password (I’ve used `SECRETPASSWORD`)

![](/content/images/2016/09/1.png)

Add the container. That’s this bit done.

### Edit custom.cnf

Next navigate to your MariaDB appdata folder and edit the file `custom.cnf` (mine is located at `/mnt/cache/.appdata/mariadb-nextcloud/custom.cnf`) If you’re using Windows then don’t use Notepad as it uses Windows line endings not Linux. Instead use [Notepad++](https://notepad-plus-plus.org/download/v6.9.2.html). The line you want to edit by default reads `##binlog_format=row` so edit it so it now reads `binlog_format=mixed` Before you save it make sure the line endings are set to Unix as in the picture below.

![2](/content/images/2016/09/2.png)

### Install Nextcloud Docker Container

Add Nextcloud from Community Applications, and fill in the docker template. `/data` should be mapped to where you want your shared files stored on your array. I’m using `/mnt/user/nextcloud/`

![3](/content/images/2016/09/3.png)

Then install it and give it a minute or so for the file to be inflated before trying to access the webui.

### Configure Nextcloud

Open the webui and you need to fill in several items.

1. Fill in your admin username (I’m using `CHBMB`
2. Fill in your admin password (This is different to the MariaDB root password you set earlier (I’m using `passwordsecret`
3. Click MySQL/MariaDB
4. For database user enter `root`
5. For database password enter your MariaDB root password (I used `SECRETPASSWORD`)
6. For database name I’m using `nextcloud`
7. Replace `localhost` with your Unraid ip address and the host port of MariaDB (For me that is `192.168.0.1:3305`)

![4](/content/images/2016/09/4.png)

## Setting Up An Apache Reverse Proxy

I’m going to show the two different ways to reverse proxy nextcloud with Apache. Note you will need a working Apache container with SSL, explaining this is outside the scope of this article.

The first way is is is [https://server.com/nextcloud](https://server.com/nextcloud) and the second is [https://nextcloud.server.com](https://nextcloud.server.com)

### server.com/nextcloud

First off edit your `default.conf file` (Mine is located in `/mnt/cache/.appdata/apache/apache/site-confs/default.conf`)

Here is my config, it will redirect all http traffic to https (note you will need to edit this to reflect your hostname, SSL key names and SSL key locations)

    <VirtualHost *:80>
        ServerName server.com
        ServerAlias server.com
        DocumentRoot /config/www/
    
        Redirect permanent / https://server.com/
    
    </VirtualHost>
    
    <VirtualHost *:443>
        ServerName server.com
        ServerAdmin webmaster@localhost
        DocumentRoot /config/www/
    
        SSLCertificateFile /config/keys/server.com.crt
        SSLCertificateKeyFile /config/keys/ssldecrypted.key
        SSLCertificateChainFile /config/keys/sub.class1.server.ca.pem
        Header always set Strict-Transport-Security "max-age=63072000; includeSubdomains; preload"
    
        SSLEngine on
        SSLProxyEngine On
        RewriteEngine On
        ProxyPreserveHost Off
    
        SSLProxyVerify none
        SSLProxyCheckPeerCN off
        SSLProxyCheckPeerName off
        SSLProxyCheckPeerExpire off
    
        SSLProtocol -All +TLSv1 +TLSv1.1 +TLSv1.2
        SSLCipherSuite ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS
        SSLHonorCipherOrder on
    
        <Location /nextcloud>
            ProxyPass https://192.168.0.1:444
            ProxyPassReverse https://192.168.0.1:444
        </Location>
    
    </VirtualHost>
    

Now you need to edit the `config.php` file for Nextcloud, mine is located in `/mnt/cache/.appdata/nextcloud/www/nextcloud/config/config.php`

It should be edited to look like this

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
        1 => 'server.com',
      ),
      'overwrite.cli.url' => 'https://server.com',
      'overwritehost'     => 'server.com',
      'overwriteprotocol' => 'https',
      'overwritewebroot'  => '/nextcloud',
      'dbtype' => 'mysql',
      'version' => '9.0.52.0',
      'dbname' => 'nextcloud',
      'dbhost' => '192.168.0.1:3305',
      'dbtableprefix' => 'oc_',
      'dbuser' => 'oc_CHBMB1',
      'dbpassword' => 'xxxxxxxxxxxxxxxxxxxx',
      'logtimezone' => 'UTC',
      'installed' => true,
    );
    

### nextcloud.server.com

First off edit your `default.conf file` (Mine is located in `/mnt/cache/.appdata/apache/apache/site-confs/default.conf`)

Here is my config, it will redirect all http traffic to https (note you will need to edit this to reflect your hostname, SSL key names and SSL key locations)

    <VirtualHost *:80>
        ServerName nextcloud.server.com
        ServerAlias nextcloud.server.com
        DocumentRoot /config/www/
    
        Redirect permanent / https://nextcloud.server.com/
    
    </VirtualHost>
    
    <VirtualHost *:443>
        ServerName nextcloud.server.com
        ServerAdmin webmaster@localhost
        DocumentRoot /config/www/
    
        SSLCertificateFile /config/keys/server.com.crt
        SSLCertificateKeyFile /config/keys/ssldecrypted.key
        SSLCertificateChainFile /config/keys/sub.class1.server.ca.pem
    
        SSLEngine on
        SSLProxyEngine On
        RewriteEngine On
        ProxyPreserveHost On
    
        SSLProxyVerify none
        SSLProxyCheckPeerCN off
        SSLProxyCheckPeerName off
        SSLProxyCheckPeerExpire off
    
        SSLProtocol -All +TLSv1 +TLSv1.1 +TLSv1.2
        SSLCipherSuite ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS
        SSLHonorCipherOrder on
    
        ProxyRequests Off
        ProxyPreserveHost Off
        ProxyPass / https://192.168.0.1:444/
        ProxyPassReverse / https://192.168.0.1:444/
    
    </VirtualHost>
    

Now you need to edit the `config.php` file for Nextcloud, mine is located in `/mnt/cache/.appdata/nextcloud/www/nextcloud/config/config.php`

It should be edited to look like this

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
      'version' => '9.0.52.0',
      'dbname' => 'nextcloud',
      'dbhost' => '192.168.0.1:3305',
      'dbtableprefix' => 'oc_',
      'dbuser' => 'oc_CHBMB1',
      'dbpassword' => 'xxxxxxxxxxxxxxxxxxxx',
      'logtimezone' => 'UTC',
      'installed' => true,
    );
    

Now you should find you have a fully working install of Nextcloud accessible from either `https://server.com/nextcloud` or `https://nextcloud.server.com`
