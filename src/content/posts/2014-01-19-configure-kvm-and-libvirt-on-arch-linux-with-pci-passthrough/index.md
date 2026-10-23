---
title: Configure KVM and libvirt on Arch Linux with PCI passthrough
date: 2014-01-19T19:33:00Z
author: IronicBadger
tags:
  - arch linux
  - kvm
  - linux
  - passthrough
  - unraid
hero: ./screen-shot-2014-01-19-at-13-03-11-zsjgmi.png
---

This post is aimed at making setting up KVM with virt-manager a breeze. If you havn’t already, [set up X11 forwarding](http://blog.ktz.me/?p=398) to a remote host or install some kind of a GUI on your Arch install then load up virt-manager via Pacman.

It is assumed that you have created a user, added them to at least the wheel group and have admin access for this. Also, don’t forget to setup your network bridge. If you’ve done this, you can start.

    groupadd libvirt 
    gpasswd -a user libvirt
    

Some info in this post is taken from the excellent KVM on OpenSUSE [guide in this thread](http://lime-technology.com/forum/index.php?topic=30715.0) on the unRAID forums. Thanks go to it’s author, without whom this wouldn’t have happened, grumpybutfun! As per his thread I’ll be aiming to get [unRAID](http://lime-technology.com/) up and running in this guide for you, with other OS’s following later.

Another useful resource is this thread on the [Arch Forums](https://bbs.archlinux.org/viewtopic.php?id=162768).

For unRAID you’ll want this .vhd file to import into virt-manager later, set it downloading whilst you tinker.

[unRAID_KVM_5.0.4.vhd](https://dl.dropboxusercontent.com/u/6775695/unraid/Files/KVM-unRAID-5.0.4.vhd)

## KVM

KVM is turned on by default in the Arch kernel, so we haven’t got to compile a kernel or anything. It’s natively supported, so that’s neat. We do need a couple of packages though so grab these

    pacman -S libvirt qemu
    

Then enable the libvirt daemon service.

    systemctl enable libvirtd 
    systemctl start libvirtd
    

Edit `libvirtd.conf`

    nano /etc/libvirt/libvirtd.conf
    

We want to setup libvirt to communicate over SSH, uncomment the following lines:

    listen_tls = 0
    unix_sock_group = "libvirt"
    unix_sock_ro_perms = "0777"
    unix_sock_rw_perms = "0770"
    unix_sock_dir = "/var/run/libvirt"
    auth_unix_ro = "none"
    auth_unix_rw = "none"
    

Now uncomment for TCP these:

    listen_tcp = 1 
    auth_tcp = "none" <---- Change the default from auth_tcp = "sasl"
    

* Running without sasl is not recommended for real world use.*

When finished, `CTRL+X` will ask you to save and quit.

It is also necessary to make a modification to /etc/conf.d/libvirtd adding –listen.

    LIBVIRTD_ARGS="-p /var/run/libvirtd.pid --listen"
    

## Setup qemu

    nano /etc/libvirt/qemu.conf
    

Look for

    user = "root" 
    group = "root" <---- change this from "kvm"
    

When finished, `CTRL+X` will ask you to save and quit.

Reboot so these changes take effect at this point.

## Configure virt-manager to connect

Load up virt-manager.

    File > Add connection...
    Hypervisor: QEMU/KVM
    Tick connect to remote host
    Method: SSH
    Username: root
    Host: <ip address>
    

Then when asked about this OpenSSH auth passphrase request type YES (all 3 letters) then press OK.

![](/content/images/2016/09/Screen-Shot-2014-01-19-at-13_03_11_zsjgmi.png)

Then enter your root password and you should be connected!

## Create a new unRAID VM

[This post here](http://lime-technology.com/forum/index.php?topic=30715.msg275929#msg275929) tells you all you need to know!

However, if you’re doing this over X11 forwarding like I am you’ll need to setup a libvirt storage pool before going any further or you won’t be able to import the unRAID.vhd file.

## Create a libvirt storage pool

Open virt-manager, right click on your server once connected and hit details. Then navigate to the storage tab and click the **+ **then follow the wizard. I put my .vhd in /root/virtmanpool but you can place it where. Once you have the pool setup I change directory to /root/virtmanpool and used wget to pull the vhd from dropbox.

    cd /root/virtmanpool 
    wget https://dl.dropboxusercontent.com/u/6775695/unraid/Files/KVM-unRAID-5.0.4.vhd
    

Then click refresh next to volumes on the storage tab and you should be good to go!

![](/content/images/2016/09/Screen-Shot-2014-01-19-at-13_31_37_bzadfs.png)

## Enable PCI passthrough for KVM

This process differs only a little to that I have previously documented for Xen. First you need to find your device ID by running

    lspci
    

    07:00.0 RAID bus controller: Marvell Technology Group Ltd. MV64460/64461/64462 System Controller, Revision B (rev 01)
    

This will give a whole ton of crap, but you need to sift through and find your SATA controller to pass through to unRAID. I passed through my USB stick successfully in the virt-manager interface, if you can’t just added your USB controller to the passed through list.

So the device ID I want is 07:00.0. You then need to convert this to a stub pci-id (which will change when you add or remove hardware). I don’t like this fact, and if anyone knows how to make it more permanent then I’m all ears.

    lspci -n
    

    07:00.0 0104: 11ab:6485 (rev 01)
    

So my pci-stub.id is 11ab:6485 – I need to add this my default grub.

    nano /etc/default/grub
    

Modify the default line to look like this.

    GRUB_CMDLINE_LINUX_DEFAULT="quiet ipv6.disable=1 intel_iommu=on pci-stub.ids=11ab:6485"
    

Then update grub.

## Edit mkinitcpio

Now you need to add the pci-stub module into initramfs via mkinitcpio.

![](/content/images/2016/09/Screen-Shot-2014-01-19-at-14_27_06_jresgw.png)

Then run

    mkinitcpio -p linux
    

Reboot.

You can check if the passthrough worked or not by running lspci -k and check for the driver in use like this…

![](/content/images/2016/09/Screen-Shot-2014-01-19-at-14_28_35_pemi95.png)

Finally, add your PCI host device using the virt-manager interface and you should be done. With a working, booting unRAID (with passed through drives!).

![](/content/images/2016/09/Screen-Shot-2014-01-19-at-14_23_54_in2s5o.png)
