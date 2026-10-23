---
title: How to setup Sabnzbd, Sickbeard, Couchpotato and more on Arch
date: 2013-11-17T02:38:00Z
author: IronicBadger
tags:
  - featured
hero: ./sublimigeek-logoplexmediaserver.png
---

I’m assuming you’ve got a working install, if you havn’t get one and make sure to install and setup yaourt as we’re going to need it.

I’m going to make all the apps run as root, some people don’t like this but as my machine is a VM there’s only so much damage it can do!

## Installing Sabnzbd

Grab sabnzbd from AUR, I use yaourt for this.

    yaourt -S sabnzbd
    

If  you want to connect to your provider using SSL (recommended) then you’ll need to grab the ssl package below with pacman.

    python2-pyopenssl
    

    cd /usr/lib/systemd/system nano sabnzbd.service
    

Edit the line

    [Service] ExecStart=/opt/sabnzbd/SABnzbd.py -l0 User=root Group=root
    

Then

    chown -R root:root /opt/sabnzbd/
    

Next edit `sabnzbd.ini` to allow remote machines to access (if you’re doing this in a VM then it’s highly likely you will need to do this).

    host = 0.0.0.0 
    port = *whatever you want
    

Then we should be good to go with sabnzbd. Once started visit the relevant URL in your browser (ie 192.168.1.3:8080 ).

    systemctl enable sabnzbd 
    systemctl start sabnzbd
    

## Installing Sickbeard

Sickbeard is also built and installed from AUR by yaourt.

    yaourt -S sickbeard-git
    

Once installed, change the service to run as root as you did with sab.

    cd /usr/lib/systemd/system nano sickbeard.service
    

File should look like this…

    [Service] 
    User=root 
    Group=root
    

Once again chown the dir sickbeard was installed too.

    chown -R root:root /opt/sickbeard
    

Then you can enable sickbeard. Once the app has run once it will auto create a config.ini which you manually edit if required.

    systemctl enable sickbeard systemctl start sickbeard
    

## Installing CouchPotato

![](/content/images/2016/09/full.png)

You probably get the idea by now… but for completeness here’s how to do CouchPotato.

    yaourt -S couchpotato-git 
    cd /usr/lib/systemd/system 
    nano couchpotato.service # edit to run as root 
    chown -R root:root /opt/couchpotato 
    systemctl enable couchpotato 
    systemctl start couchpotato
    

Default port is 5050.

### Installing Plex Media Server

![](/content/images/2016/09/Sublimigeek_LogoPlexMediaServer.png)

    yaourt -S plexmediaserver 
    systemctl enable plexmediaserver 
    systemctl start plexmediaserver
    

Default port is 32400. You’ll need to go to a slightly odd URL to get the configurator to load.

192.168.1.3:32400/web
