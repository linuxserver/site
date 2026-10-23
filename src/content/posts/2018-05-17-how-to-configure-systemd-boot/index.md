---
title: How to configure systemd boot with UEFI
date: 2018-05-17T22:55:00Z
author: IronicBadger
tags:
  - linux
  - arch linux
  - systemd
hero: ./featured.jpg
---

Today we will cover configuring a Linux system to boot using systemd boot on a UEFI system.

Firstly you'll need to check you're booted into EFI mode. You can do this with `dmesg | grep "EFI v"`.

Sometimes it's possible to boot your system from legacy BIOS mode instead of UEFI mode - look for the UEFI options in your boot override menu. Note, the media you are booting from most support UEFI for this to show up.

I used Arch for this guide but, being Linux, you should be able to easily adapt them for the distro of your choice.

### Partitioning

Next we'll create the minimal viable partitions required for this to work. You should adjust the partitioning steps as required for your steup.

    gdisk /dev/sda
    

The use of gdisk means we'll be using `gpt` formatting not `mbr` - use `gpt` unless you have a very good reason for doing otherwise.

> BEWARE: We're about to wipe everything off this drive

We're going to create the partition which will hold `/boot` now.

- `o` create a new EMPTY gpt and erase everything off the drive
- `n` create a new partition
- default partition number (1)
- First sector: leave blank
- `+512M` Last sector
- `ef00` partition type code – EFI system
- `n` create a new partition (this is going to be your root filesystem) - accept defaults
- `w` this will write the changes listed above and ERASE YOUR DRIVE

Use the same method to partition rest of your drive as required. You can leave `last sector` blank and it will use the remaining free space for that partition. `\boot` should be no larger than `512mb`.

### Create the filesystem(s)

Time to put a filesystem on those partitions. Double check your numbers before running any of these commands, just in case.

    mkfs.ext4 /dev/sda2 #the larger one used for /
    mkfs.vfat -F32 /dev/sda1 #used for /boot
    

### Mount the partitions

This must be done in a specific order. First, mount the partition which will form `/`, `/dev/sda2` in our case. Don't forget I'm on Arch, this may differ for other distros.

    mount /dev/sda2 /mnt
    mkdir -p /mnt/boot
    mount /dev/sda1 /mnt/boot
    
    pacstrap /mnt base base-devel
    

### Install the bootloader

Once you've entered your `chroot` it’s then time to install the bootloader using:

    bootctl --path=/boot$esp install
    

Check in `/boot` and you’ll want to end up with a file layout thus (I used `tree` to generate this):

    $ tree /boot
    /boot
    ├── EFI
    │   ├── Boot
    │   │   └── BOOTX64.EFI
    │   └── systemd
    │       └── systemd-bootx64.efi
    ├── initramfs-linux-fallback.img
    ├── initramfs-linux.img
    ├── loader
    │   ├── entries
    │   │   └── arch.conf
    │   └── loader.conf
    └── vmlinuz-linux
    

The important files are `/boot/loader/loader.conf` and `/boot/loader/entries/arch.conf`.

    /boot/loader/loader.conf
    ##############
    
    default arch
    timeout 1
    editor 0
    

Generate your `PARTUUID` by running `blkid -s PARTUUID -o value /dev/sda2`.

    /boot/loader/entries/arch.conf
    ##################
    
    title   Arch Linux
    linux   /vmlinuz-linux
    initrd  /initramfs-linux.img
    options root=PARTUUID=66e3f67d-f59a-4086-acdd-a6e248a3ee80 rw
    

Optionally, your options line could be `options root=/dev/nvme0n1p3 rw intel_iommu=on`.

### Profit

Now you can continue with your installation as required and reboot. That's it.
