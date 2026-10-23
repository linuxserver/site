---
title: Install Ubuntu Server 13.04 and compile a custom kernel ready for Xen
date: 2013-08-10T23:24:00Z
author: IronicBadger
hero: ./openssh.png
---

As part of my quest to find the ultimate unRAID setup for my needs I stumbled across an interesting post on the Lime Technology forum about Xen and virtualisation. The aim of this post is to take you through the steps of installing Ubuntu Server 13.04, compiling yourself a Xen compatible kernel with subsequent posts detailing exactly how to setup PCI passthrough and virtualise unRAID. In the future beyond that will be guides on libvirt and the like.

## Install Ubuntu Server 13.04

Download Ubuntu Server 13.04 and install it. Ubuntu Server doesn't come with a GUI, but this is easily added later. Make sure your install is at least 20GB in size otherwise you won't have enough room to compile everything. When prompted make sure that you select 'OpenSSH' server and finish up the installation. Reboot, removing your installation media.

![](/content/images/2016/09/OpenSSH.png)

*Ubuntu Server install, make sure to select OpenSSH server.*

SSH into your install and make sure everything is updated.

    sudo su
    apt-get update
    apt-get dist-upgrade -y
    reboot 
    

We are now ready to move onto compiling the kernel (to add Xen support).

## Compiling a custom linux kernel with Xen support

Compiling a custom Linux Kernel will make PCI passthrough much easier and allows for custom driver support (if required for specific NICs etc). Let's being by creating a folder within which we can compile our packages. This can be wherever you like, but I'll use my user's home folder.

    mkdir -p ~/src/linux
    cd ~/src/linux 
    

Next, install the required packages for compiling.

    wget https://www.kernel.org/pub/linux/kernel/v3.x/linux-3.10.5.tar.bz2
    tar jxf linux-3.10.5.tar.bz2 && rm linux-3.10.5.tar.bz2
    cd linux-3.10.5/ 
    

You have two options at this point. One is to use my .config which selects all the relevant Xen related stuff for you or you can go through and manually select everything (this is easy but requires a bit of patience). Skip the next bit if you use my .config.

*OPTIONAL* - Manually select kernel components. Only do this if you fancy getting your hands dirty or have a good reason too... I'll just list the settings we need to change (in order, that's important) as I'll assume if you choose this method you know what to do!

    cp /boot/config-3.8.0-19-generic  .config
    make menuconfig
    

You are now at menu where the magic happens. Select the options listed below and you should be fine. Select items by hitting . You want to make sure things are **not** modules `<M>` but included, denoted by * (see image below).

![](/content/images/2016/09/Screen-Shot-2013-08-10-at-20.53.45.png)

- Linux Guest Support
- Processor Type and Features

- Preemption Model (Voluntary Kernel Preemption (Desktop))

- Preemptible Kernel (Low-Latency Desktop)

- Enable cleancache driver to cache clean pages if tmem is present

- Bus options (PCI etc.)

- PCI Stub driver
- Xen PCI Frontend

- Device Drivers

- Block devices

- Xen virtual block device support
- Xen block-device backend driver

- Network device support

- Xen network device frontend driver
- Xen backend network device

- Xen driver support

- Xen memory balloon driver
- Dynamically self-balloon kernel memory to target
- Memory hotplug support for Xen balloon driver
- Scrub pages before returning them to system
- Xen /dev/xen/evtchn device
- Backend driver support
- Xen filesystem
- Create compatibility mount point /proc/xen
- Create xen entries under /sys/hypervisor
- userspace grant access device driver
- User-space grant reference allocator driver
- Xen PCI-device backend driver

- Firmware Drivers

- EFI Variable Support via sysfs Once you're happy with the above settings then follow the next section, omitting the wget for my .config of course.

#### Using my .config for 'automatic' kernel compilation

Using my .config removes any potential mistakes or missing sections in the kernel make menuconfig menu by mistake.

    cd ~/src/linux/linux-3.10.5
    wget https://dl.dropboxusercontent.com/u/6775695/config_xen_ubuntuserver1304
    mv config_xen_ubuntuserver1304 .config
    make -j4 deb-pkg 
    

`-j4` refers to the number of cores you have. If you have 2 for example, use -j2. This will push your system hard and take a while, on my system it took 45 mins. Go make a cuppa, hug your wife or something interesting. When completed you'll have a set of .deb files which now just need to be installed.

    cd ..
    sudo dpkg -i *.deb
    

Once installed, reboot and you should be running your kernel of choice - 3.10.5 in my case. Check this with `uname -r`.

*My output: Linux ubuntu13 3.10.5 #2 SMP PREEMPT Sat Aug 10 18:58:25 BST 2013 x86_64 x86_64 x86_64 GNU/Linux*

## Custom kernel complete

Congratulations, if you've made it this far you now have a custom kernel on Ubuntu Server 13.04 that is capable of supporting a Xen installation. See my next post (coming soon) on how to install Xen and get PCI passthrough working for unRAID.

- Massive thanks to 'ddeeds' from the lime-technology forums who helped me get this far. It wouldn't have happened without you sir. Thanks!
