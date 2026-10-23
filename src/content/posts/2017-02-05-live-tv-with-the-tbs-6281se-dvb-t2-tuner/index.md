---
title: Live TV with the TBS 6281SE DVB-T2 Tuner
date: 2017-02-05T17:59:00Z
author: Josh Stark
tags:
  - media server
  - tv
  - tbs
  - tvheadend
hero: ./featured.jpg
---

The next step in the long line of things I've been doing to my HP ProLiant Gen8 Microserver was to give it some TV capability. Since moving house last year, the living room has been set up in such a way that I don't have access to an aerial port near the TV. Naturally, the idea of just buying a really long coaxial cable is far too easy a solution, so in comes the server once again to save the day.

I had a quick look online and found the [TBS 6281SE](http://www.tbsdtv.com/products/tbs6281se-dvb-t2tc-tv-tuner-pcie-card.html) - a perfect solution for my needs as it provides me with a dual Freeview HD source, so I picked it up for [£89.99 on Amazon.co.uk](https://www.amazon.co.uk/d/Internal-TV-Tuner-Video-Editing-Cards/TBS-6281-SE-Dual-Terrestrial-Low-profile-Tuner-DVB-T2/B01B7TDIKQ/ref=sr_1_1?ie=UTF8&amp;qid=1486288193&amp;sr=8-1&amp;keywords=tbs+6281) which seems to be the going rate for these cards.

![Side view of PCI card](/content/images/2017/02/IMG_20170203_183819.jpg)

The card also came with a low-profile bracket and a Coax F-type to Coax converter, which suited me as I don't have a working F-type port; instead I use the standard RF coax port.

Before inserting into my server, I switched the default bracket with the low-profile one as the ProLiant only supports half height PCIe brackets.

![Angled view showing RF in and RF out](/content/images/2017/02/IMG_20170203_183836.jpg)

I'm genuinely impressed with now small this card is.

![Internal view of installed card](/content/images/2017/02/IMG_20170203_184510.jpg)

Installation was very easy thanks to the quick-release backing plate for the PCIe slot - I just popped it in!

## Driver Installation

**Note:***There are also Open Source drivers for a fair number of cards (this one is included) which I could have used. More information can be [found on GitHub](https://github.com/ljalves/linux_media/wiki).*

Thankfully, TBS provides an absolute wealth of driver options for their cards, supporting Windows and Linux, which made my life much easier in trying to get hold of the right drivers. However, actual installation of the drivers requires you to compile them on your machine, then load the created kernel module.

Firstly, I downloaded the proprietary drivers for my card, which I found on the [TBS Driver website](http://www.tbsdtv.com/download/).

    mkdir ~/tbs && cd ~/tbs
    wget http://www.tbsiptv.com/download/common/tbs-linux-drivers_v161031.zip
    unzip tbs-linux-drivers_v161031.zip
    

I took the following steps with the help of a couple of existing online guides: one from [LinuxTV.org](https://linuxtv.org/wiki/index.php/TBS_driver_installation) and another from [iptvadmin](http://iptvadmin-panel.com/knowledgebase.php?action=displayarticle&amp;id=16). Full credit goes to them, and what is noted below are the specific steps I personally took to get the drivers installed on my machine.

Once the core zip had been decompressed, I unpacked the `linux-tbs-drivers.tar.bz2` file. This contains all of the driver sources that I needed to compile. I then changed into the directory it just extracted.

    bzcat linux-tbs-drivers.tar.bz2 | tar xv
    cd linux-tbs-drivers
    

At this point I didn't pay attention to the file permissions, but I was told to double-check them, so I did:

    find -type d -exec chmod 755 \{\} \;
    find -type f | xargs chmod 644
    find -name '*.sh' | xargs chmod 755
    find -name '*.pl' | xargs chmod 755
    

My server is running the 64-bit version of Ubuntu, so I then ran the corresponding shell script to generate the properties ready for `make`:

    ./v4l/tbs-x86_64.sh
    

Once the driver config had been generated, I then ran `make`, which compiled all of the sources. This step actually compiles drivers for an insane number of devices, not just my one, so it took a few minutes.

    make
    

Now, here's where some interesting stuff happened. During the `make` process, I noticed a few error messages, along the lines of this:

    WARNING: could not find ~/tbs/linux-tbs-drivers/v4l/.tbs8921ctrl.o.cmd for ~/tbs/linux-tbs-drivers/v4l/tbs8921ctrl.o
    

To fix this (or more likely, to ignore it), I deleted the existing kernel media drivers folder:

    sudo rm -rf /lib/modules/$(uname -r)/kernel/drivers/media/
    

And then proceeded to install the drivers I'd just compiled:

    sudo make install
    

Once the drivers had been installed, I restarted my machine:

    sudo reboot
    

And checked that the modules had loaded correctly:

    dmesg | grep frontend
    

    DVB: registering adapter 0 frontend 0 (TurboSight TBS 6281 DVBT/T2 frontend)...
    DVB: registering adapter 1 frontend 0 (TurboSight TBS 6281 DVBT/T2 frontend)...
    

I also checked that the card had been mounted to `/dev/dvb`:

    ls -l /dev/dvb
    

    total 0
    drwxr-xr-x 2 root root 120 Feb  3 21:43 adapter0
    drwxr-xr-x 2 root root 120 Feb  3 21:43 adapter1
    

And there we go, the TBS card was successfully installed!

## Up next...

The next step is to install TVHeadend and configure the Freeview sources so I can actually watch TV on my Kodi clients. I'll update this article with information on how to install and configure TVHeadend using our docker image when it has been written.

![Live TV on Kodi Kypton](/content/images/2017/02/kodi_2017-02-05_12-29-38.png)
