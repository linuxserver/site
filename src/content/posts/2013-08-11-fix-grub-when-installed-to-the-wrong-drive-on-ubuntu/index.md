---
title: Fix grub when installed to the wrong drive on Ubuntu
date: 2013-08-12T01:15:00Z
author: IronicBadger
tags:
  - grub
  - ubuntu
---

Install grub to the wrong drive by mistake during install? Easily fix this by first finding your boot drive.

    sudo fdisk -l
    

Mine was `/dev/sdc`, so:

    sudo grub-install /dev/sdc 
    sudo update-grub
    

And you’re done. Easy wasn’t it!?
