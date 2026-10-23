---
title: Add .htaccess to Apacheweb Docker
date: 2015-11-10T18:40:00Z
author: smdion
---

This is part of setting up Apacheweb on Docker.  Please look at the [overview page](/blog/2015-11-10-overview-reverse-proxy-with-docker/) for additional info on this process.

## Create .htpasswd file

Go to [here](http://tools.dynamicdrive.com/password/) and generate the username/password file that we will place in our Apache-Reverseproxy Docker

## unRAID configuration

1. Place the newely created .htpasswd file in your /config  folder of the Apacheweb Docker
2. Edit in the `/config/apache/site-confs/default.conf`.  Add the following lines to the location you want password protect. You can change the “AuthName” to what you want and you need to change “someone” to either ValidUser or one of the usernames you created

    AuthUserFile /config/.htpasswd
    AuthType Basic
    AuthName “Service – Proxy”
    Require user someone
