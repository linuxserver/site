---
title: How to fix crackly audio with QEMU, libvirt, Windows 10 and PulseAudio
date: 2018-01-06T02:11:00Z
author: IronicBadger
hero: ./featured.jpg
---

Getting a GPU passed through these days is almost trivially [easy](/blog/2017-04-28-how-to-setup-vfio-gpu-passthrough-using-ovmf-and-kvm-on-arch-linux/) and thanks to the Arch Wiki is *[even easier](https://wiki.archlinux.org/index.php/PCI_passthrough_via_OVMF)*.

In this post I'm going to cover the solution proposed by `u/spheenik` at r/vfio on [reddit](https://www.reddit.com/r/VFIO/comments/74vokw/improved_pulse_audio_driver_for_qemu/) to resolve audio crackling which has plagued my experiences with VFIO for literally years... Full credit for the actual solution goes to him.

## Setting up PulseAudio with a libvirt guest

This is covered by the [Arch Wiki](https://wiki.archlinux.org/index.php/PCI_passthrough_via_OVMF#Passing_VM_audio_to_host_via_PulseAudio). A couple of gotchas for me included making sure change my qemu XML schema validation and to modify libvirt to run as my user, not root. This is all covered in the link, don't skip a section thinking you know better like I did!

## Build forked QEMU

The building of this forked version of QEMU has finally achieved me glitchfree audio for a passed through guest using PulseAudio. This means I can play audio in my guest (Windows 10 in this case) but hear the output on my host Linux system and even control the output as if the guest were 'just another application'. Combine this with [Looking Glass](/blog/2017-12-14-huge-vfio-news-project-looking-glass-released/) and you can have windows running, fully 3d accelerated, as literally just a window on your Linux desktop - sound and all (which LG doesn't handle (yet)).

These instructions are largely a copy of the reddit post. The fork is in the process of being upstreamed but the OP has a life to live so until then...

> Build it ourselves we must.

As usual, I'm on Arch. The build dependencies you'll need are

    pacman -Sy spice-protocol python2 ceph libiscsi glusterfs
    

Then perform the following steps

    git clone https://github.com/spheenik/qemu.git
    cd qemu
    mkdir build
    cd build
    ../configure --prefix=/opt/qemu-test --python=/usr/bin/python2 --target-list=x86_64-softmmu --audio-drv-list=pa --disable-werror
    make -j 8 # adjust for the no of threads your CPU has 
    

This creates a folder `x86_64-softmmu` inside the `build` folder which contains the binary `qemu-system-x86_64`. You can use the binary from there without installing or

    sudo make install
    

This install the fork into the folder given in your `/configure --prefix=` line above (`/opt/qemu-test` here).

## Libvirt - Modify your VM XML

In order for your guest to pick up these changes you need to modify the `<emulator>` line in your VMs xml config file.

    virsh edit guest-name
    

Look for the line `<emulator>...</emulator>` and replace the tag contents with `<emulator>/opt/qemu-test/bin/qemu-system-x86_64</emulator>`.

Fully halt your VM and power it on again and voila, crackle free audio.

#### Anything else?

From here you can use the app `pavucontrol` (ensure that under 'playback' you have show 'All Streams' enabled and you will see your guest pop up as if it were an application there).
