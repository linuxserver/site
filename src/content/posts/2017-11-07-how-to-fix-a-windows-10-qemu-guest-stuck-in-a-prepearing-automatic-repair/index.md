---
title: How to fix a Windows 10 QEMU guest stuck in a 'preparing automatic repair' boot loop
date: 2017-11-08T03:31:00Z
author: IronicBadger
tags:
  - kvm
  - virtualisation
  - linux
  - windows
  - qemu
  - libvirt
---

My Windows 10 QEMU guest shut down uncleanly and Windows, being the (un)helpful soul it is decided I needed to boot loop through 'preparing automatic repair' until the end of time. Here's how to fix it...

> This guide assumes you are running a Windows guest on a Linux host using libvirt + qemu / kvm. The steps should be the same regardless of host OS (Any Linux distro / unRAID, etc).

## Load the VirtIO drivers

If you are using the VirtIO drivers the reason that the repair wizard is looping in circles is that it cannot see your boot drive. To remedy this, attach to the VM the VirtIO ISO found [here](https://fedoraproject.org/wiki/Windows_Virtio_Drivers).

## Load the command prompt

Boot the VM and load the command prompt. Once there, find the disk containing the drivers. For me this involved spamming `D:` then `dir`, nope. `E:` then `dir`, nope. My other disks are natively connected through SATA using passthrough thus the wizard could see them. Eventually I found the drivers on `F:`.

## Load the drivers

Navigate to `cd w10\viostor\amd64` then type `drvload viostor.inf`.

Now close the command prompt and click on 'continue as normal and boot to Windows 10'. If you don't see this option now you've not got the drivers bit right.

If you need further assistance, come join our Discord.

[https://discord.gg/ctsYTAq](https://discord.gg/ctsYTAq)
