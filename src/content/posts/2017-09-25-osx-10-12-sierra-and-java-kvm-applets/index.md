---
title: OSX 10.12 Sierra and Java KVM applets
date: 2017-09-25T10:48:00Z
author: IronicBadger
tags:
  - apple
---

Apple. Why must you make the hardware I paid for less and less useful in the name of security? Stop it! It is a tool I require to do my job and perform interactions with other hardware on my network. If I choose to run Java then bloody well let me. I **understand** the inherent security risks but when the website originates in my own LAN could you perhaps give me an elegant checkbox to tick or something? Instead, I've just lost half an hour to pointless pointlessery. Grugh. It's time like these I wonder why I don't just buy an XPS 15 and be done with it, running everything I need in a KVM VM.

My AsROCK board uses an IPMI Java applet and I needed to access it as I'd just installed a new drive without taking the old one out of `/etc/fstab` first, d'oh!

Firstly, I had to edit `/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/lib/security/java.security` and remove `MD5` from the following line thus:

    # before
    jdk.jar.disabledAlgorithms=MD2, MD5, RSA keySize < 1024
    
    # after
    jdk.jar.disabledAlgorithms=MD2, RSA keySize < 1024
    

Now you need to make Java probably accept some insecure, self-signed certificate. This is fine in my case as I know the requests originate from within my LAN and are safe. Doing so involved some frustration on my end looking for an invisible Java control panel. If this happens to you, make sure to restart Safari before looking in system preferences - then it will appear, like magic.

Thank you very much, Apple for nothing!

Of course if Apple's ultimate goal is simply to *continue* to wrestle control of the system away from it users, under the guise of `security', I'm not sure any of this even matters.
