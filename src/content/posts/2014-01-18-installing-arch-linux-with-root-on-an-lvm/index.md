---
title: Installing Arch Linux with /root on an LVM
date: 2014-01-18T14:58:00Z
author: IronicBadger
tags:
  - arch linux
  - grub
  - install
  - linux
  - lvm
---

This post is aimed at simplifying the process of installing Arch on Logical Volume Manager (LVM). The info in this post came mostly from this excellent [Wiki article](https://wiki.archlinux.org/index.php/LVM#Installing_Arch_Linux_on_LVM), with a couple of additions later on of my own.

Why LVM? You can create a snapshot (see my [blog post](http://blog.ktz.me/?p=285) for these) then install some OS updates and if something broke you can just roll back like nothing happened. Neat.

## Installing Arch on LVM

These steps are performed during the partitioning phase of installation. Once you’ve finished here continue installation as normal but checking back to this page when you run into issues (which you will with grub for example).

    fdisk -l # use this to find your installation medium 
    fdisk /dev/sdX # launches fdisk pointed at your drive
    

Once you’re in fdisk create a partition for your LVM to sit inside.

    Command (m for help): o  <--- new MBR
    Command: n  <--- new parititon
    Select: default
    Partition no: default
    First sector: default
    Last sector: +25G <---- change this accordingly
    
    Command (m for help): t
    Hex code: 8e <--- changes partition type to LVM
    
    Command (m for help): w <--- writes changes, so make sure you're sure it's the right drive!
    

Now we have a 25G partition inside which we’ll create the root physical volume, volume group and logical volumes. This partition should ideally be big enough for a base Arch install (about 10-15G with plenty of breathing room afterwards) and enough room for a snapshot too (usually around 10G), for me I go to 25G.

## Create physical volume

Choose your command from below depending on whether you have an SSD or not.

    pvcreate /dev/sdXX # mine was /dev/sda1 
    pvcreate --dataalignment 1m /dev/sdXX # this step for SSDs ONLY
    

View what you’ve just done with

    pvdisplay
    

## Create volume group

    vgcreate vgName /dev/sda1
    

If you want to view what you’ve just done run:

    vgdisplay
    

## Create logical volume

Choose your command accordingly

    lvcreate -L 15G vgName -n lvName # creates an LV of 15G 
    lvcreate -l +100%FREE vgName -n lvName # fills all free space with an LV
    

### Create filesystems and mount logical volumes

    modprobe dm-mod 
    vgscan 
    vgchange -ay
    

Now create your filesystem of choice, I use ext4 but you can use whatever. *Note the file path is `/dev/mapper`**not**`/dev/sdX`. *You should refer to your LVM in this manner throughout the installation.

    mkfs.ext4 /dev/mapper/vgName-lvName 
    mount /dev/mapper/vgName-lvName /mnt
    

### Continue base installation

[You can now continue with the base install](https://put_link_here). Make sure to pay attention when you get to the mkinitcpio steps, come back here.

## Edit mkinitcpio.conf

You’re halfway through your install at this point I hope, and are at the very least running in chroot. Edit this file and insert lvm2 between block and filesystem.

    nano /etc/mkinitcpio.conf 
    

    HOOKS="base udev ... block lvm2 filesystems"
    

## Edit lvm.conf

Edit this file and change the following

    nano /etc/lvm/lvm.conf 
    

`Ctrl + W` search: *lvmetad =*

use_lvmetad = 0 and change this from `1` to `0`

`Ctrl + X` to save: `y` / don't change filename

Then run

    mkinitcpio -p linux
    

## Complete

You can go back to the main [installation instructions](http://blog.ktz.me/?p=371) now, you should be able to reboot once you’ve finished the other stuff and be good to go!
