---
title: FreshRSS with the new Raspberry Pi Zero W
date: 2017-04-01T21:32:00Z
author: sparklyballs
hero: ./featured.jpg
---

## Introduction

I picked up one of the new Raspberry [Pi Zero W](https://www.raspberrypi.org/blog/raspberry-pi-zero-w-joins-family/) boards from [ModMyPI](https://www.modmypi.com) almost as soon as I heard about it. So for my first project, I decided to set up [FreshRSS](https://freshrss.org), an RSS reader that can be used with sqlite, on it.

You can see how small the board is when compared to a RPi2 in the image below.

![](/content/images/2017/03/DSC_1100.jpg)

## Prerequisites

The steps below assume you have setup [Raspbian lite](https://www.raspberrypi.org/downloads/raspbian/) and have [set up wifi](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md) on the board.

## The Install

First off assume sudo to save having to type `sudo - command` every time:

    sudo -I
    

Next step is to update the local apt cache:

    apt-get update
    

Install `php5-fpm` separately to avoid installing Apache as part of the php5 dependencies; we're using Nginx, so we don't want it. You need to answer `yes` to install and `yes` to a possible untrusted sources question:

    apt-get install php5-fpm
    

Now go ahead and install the rest of the required packages, again answering `yes` to the two questions:

    apt-get install nginx php5 php5-curl php5-gmp php5-sqlite
    

Using sqlite only means we don't need a *sql instance and enables the install to be standalone.

The following line removes the default NGINX site config, so we can add in our own without it interfering with our setup:

    rm /etc/nginx/sites-available/default
    

## NGINX Configuration

Now to add the freshrss NGINX config.

SSL is disabled by commenting out the `listen 443...` line and the three lines under `https configuration` because I'm running this behind a reverse proxy. You can add the OpenSSL package to the installed packages to enable you to generate your own unsigned certs if you wish, or add pre-generated ones to `/etc/nginx/` and uncomment the lines to re-enable SSL. You can also edit the line `server_name _;` for your domain etc.

    nano /etc/nginx/sites-available/freshrss
    

    server {
      listen 80; # http on port 80
    #  listen 443 ssl; # https on port 443
    
      # https configuration
    #  ssl on;
    # ssl_certificate      /etc/nginx/server.crt;
    # ssl_certificate_key  /etc/nginx/server.key;
    
      # your server's url(s)
      server_name _;
    
      # the folder p of your FreshRSS installation
      root /srv/FreshRSS/p/;
    
      index index.php index.html index.htm;
    
      # nginx log files
      access_log /var/log/nginx/rss.access.log;
      error_log /var/log/nginx/rss.error.log;
    
      # php files handling
      # this regex is mandatory because of the API
      location ~ ^.+?\.php(/.*)?$ {
        fastcgi_pass unix:/var/run/php5-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        # By default, the variable PATH_INFO is not set under PHP-FPM
        # But FreshRSS API greader.php need it. If you have a "Bad Request" error, double check this var !
        fastcgi_param PATH_INFO $fastcgi_path_info;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
      }
    
      location / {
        try_files $uri $uri/ index.php;
      }
    }
    
    

Then link the NGINX config to sites available:

    ln -s /etc/nginx/sites-available/freshrss /etc/nginx/sites-enabled/
    

## FreshRSS Installation

To install FreshRSS, I'm using the tar package from the git repo to keep size down, however this makes updating awkward doing it this way.

Alternatively you can install git by adding `git-core` to the installed packages and clone the repo into `/srv/FreshRSS` if you want to keep it up to date.

    curl -o /tmp/freshrss.tar.gz -L https://github.com/FreshRSS/FreshRSS/archive/master.tar.gz
    mkdir -p /srv/FreshRSS
    tar xf /tmp/freshrss.tar.gz -C /srv/FreshRSS --strip-components=1
    

Give the www-data user ownership of the freshrss folder:

    chown -R www-data:www-data /srv/FreshRSS
    

Setup the cron job to refresh feeds:

    echo "*/15 * * * * root /usr/bin/php /srv/FreshRSS/app/actualize_script.php > /tmp/FreshRSS.log 2>&1" >> /etc/crontab
    

Start NGINX and configure it to start on boot:

    systemctl start nginx
    systemctl enable nginx
    

Finally, open a browser to the IP of your Pi Zero and you should see the FreshRSS installation page. Follow the wizard, creating user etc...

![freshrss1](/content/images/2017/03/Screen-Shot-2017-03-02-at-21.46.43-1.png)

## Summary

The latest addition to the Pi family works well and is fairly responsive with this project.

If you have any questions or suggestions for other things to do with the Raspberry Pi Zero W, please let us know and we will see what we can do!
