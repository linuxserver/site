---
title: X11 forwarding from Linux to Mac over SSH
date: 2014-01-19T17:42:00Z
author: IronicBadger
tags:
  - "10.9"
  - Apple
  - arch linux
  - Mac
hero: ./screen-shot-2014-01-19-at-12-41-31-qcdhmh.png
---

There comes a point where it is useful to run Linux GUI apps elsewhere every once in a while and in my case virt-manager. Thus I set about figuring out how to use X11 forwarding from Arch Linux to Mac OS X 10.9 Mavericks. This is how it’s done.

## Linux side configuration

As usual, most of this information comes from the fantastic Arch wiki [post here](https://wiki.archlinux.org/index.php/Secure_Shell#X11_forwarding).

First you’ll need to install SSH if you havn’t already and set a root password.

    pacman -S openssh 
    systemctl enable sshd 
    systemctl start sshd
    

Next edit a couple of config files under /etc/ssh first *ssh**d**_config*

- Enable the **AllowTcpForwarding**
- Enable the **X11Forwarding**
- Set the **X11DisplayOffset**
- Enable the **X11UseLocalhost**

Next *ssh_config***note the subtle file name differences.**

- Enable the **ForwardX11** option in `ssh_config`

Then restart SSH for these changes to take effect.

    systemctl restart sshd
    

We are done on the Linux side now, time to move over to your Mac.

## Mac configuration

I use a program called XQuartz to do this which is [available here](http://xquartz.macosforge.org/landing/).

Download and install it then log out and in again.

Next load up your terminal client and connect to your Linux box with an ssh command with the -X option as follows:

    ssh -X root@123.123.123.123
    

Once you’re in you should be able to load X based applications, in my instance I simply installed virt-manager via pacman and ran it from the command line with:

    virt-manager
    

This was the outcome.

![Screen Shot 2014-01-19 at 12.41.31](/content/images/2016/09/Screen-Shot-2014-01-19-at-12_41_31_qcdhmh.png)
