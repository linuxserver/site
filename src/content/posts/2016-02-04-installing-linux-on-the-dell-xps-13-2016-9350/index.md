---
title: Installing Linux on the Dell XPS 13 (2016) 9350 Skylake revision
date: 2016-02-05T02:25:00Z
author: IronicBadger
tags:
  - arch linux
  - hardware
  - linux
---

Let me begin by saying if you are reading this article considering whether or not to purchase the Dell XPS 13 (9350) Skylake revision to run Linux, just do it. The build quality is fantastic, it runs Linux extremely well and dat display. That display…

This article will get you up and running from ‘out the box’ to ‘Linux desktop’ bringing together all the disparate documentation from across the web into one place. I’ll assume you’re a competent Linux user, honestly the install process begs that of you anyway – well it did before I wrote this guide!

## 1 – Update the BIOS

Upon first boot you’ll end up in Windows (sigh). I took the opportunity to upgrade the BIOS as it’s been reported that doing so adds 2+ hours to battery life. This was down to the NVMe PCI SSD preventing the CPU from entering a low power state. Flashing the BIOS is a straightforward process and shouldn’t take you too long.

I’ll make numerous references to this Arch wiki [entry](https://wiki.archlinux.org/index.php/Dell_XPS_13_(2016)) throughout this article, it also gives you a route to update the BIOS without Windows.

## 2 – Download a *very* recent Linux distribution

In order for this laptop to work you’re going to need the Broadcom and Skylake support in the Linux kernel added in `4.4.1-1`. At the time of writing Arch ships with `4.4.1-2` which makes it a good fit for this project. Those of you who know me know that I’ve been a big fan of Arch for a long time anyway – any excuse right?

## 3 – Install Arch Linux

In order to get the installer to boot I had to disable secure boot. I didn’t bother looking into getting around this as I just don’t care about it. If anyone cares to comment about this below, I’ll add it into this write up.

This laptop represented my first foray into a UEFI only system which meant a steep learning curve. The Arch Wiki is a fabulous resource here but it has to cover every eventuality and it took me several hours to find a working setup.

### 3.1 – Partitioning

Using `fdisk -l` you’ll see that the SSD in this laptop is a NVMe model presented under `/dev/nvme0n1`. The naming schemes for NVMe drives is a little different from the `sdaX` days. **`n1`** refers to the device and not the partition. Partitions are denoted `p1` meaning a full device would look like `/dev/nvme0n1p1`.

With UEFI you *must* use `gpt` unless you want pain and suffering.

    gdisk /dev/nvme0n1
    

> BEWARE: We’re about to wipe everything off this drive

- `o` create a new EMPTY gpt and erase everything off the drive
- `n` create a new partition
- default partition number (1)
- `+512M` size of partition
- `ef00` partition type code – EFI system
- `n` create a new partition (this is going to be your root filesystem) - accept defaults
- `w` this will write the changes listed above and ERASE YOUR DRIVE

When finished your drive structure should look something like this.

    [root@ktzXPS alex]# fdisk -l
    Disk /dev/nvme0n1: 238.5 GiB, 256060514304 bytes, 500118192 sectors
    Units: sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disklabel type: gpt
    Disk identifier: E9C6329B-4D3B-4534-9C24-53B995003C6B
    
    Device           Start       End   Sectors  Size Type
    /dev/nvme0n1p1    2048   1050623   1048576  512M EFI System
    /dev/nvme0n1p2 1050624 500118158 499067535  238G Linux filesystem
    

Time to put a filesystem on those new partitions. Double check your `pX` matches before running these commands!!

`mkfs.vfat -F32 /dev/nvme0n1p1` you will mount this partition as `/boot``mkfs.ext4 /dev/nvme0n1p2` this will be `/`

### 3.2 – Connectivity

The Arch installer from February ships with kernel `4.4.3` – not new enough for our Broadcom chip. I didn’t have a USB ethernet adapter to hand so I opted for a bit of a cheat and USB tethered my Android phone to `pacstrap` Arch. It was really easy to do and a nice get out of jail free card…

Full information on USB Android tethering is on the [Arch Wiki](https://wiki.archlinux.org/index.php/Android_tethering).

The best solution is to order the Intel Wireless 7265 card as this will be much better supported by the Linux kernel.

### 3.3 – OS Installation

Mount your partitions

    mount /dev/nvme0n1p2 /mnt
    mount /dev/nvme0n1p1 /mnt/boot
    
    pacstrap /mnt base base-devel
    

Proceed with your installation as usual until you reach the point of setting up your bootloader…

### 3.4 – UEFI + Bootloader hell

I originally started with `grub`, following numerous guides but eventually getting nowhere. I eventually read a post that the functionality required to support the NVMe SSD is only in the git branch of grub (the thread was for the 15″ XPS) but it recommended to use systemd’s `bootctl`. I was reluctant to leave grub behind as it’s been my faithful bootloader for over 10 years, in the end though `bootctl` worked and `grub` did not.

You need to be booted into “UEFI” mode (I’m not sure it’s possible not to be with this laptop) but you can check with `efivar -l`. No errors = “UEFI” mode. If you experience any issues with these commands I implore you to take the time on the Arch wiki to read and understand, it’s complex but not impossible.

Now it’s time to install the bootloader using `bootctl --path=/boot$esp install`. Check in `/boot` and you’ll want to end up with a file layout thus (I used `tree` to generate this):

    /boot
    ├── EFI
    │   ├── Boot
    │   │   └── BOOTX64.EFI
    │   └── systemd
    │       └── systemd-bootx64.efi
    ├── initramfs-linux-fallback.img
    ├── initramfs-linux.img
    ├── loader
    │   ├── entries
    │   │   └── arch.conf
    │   └── loader.conf
    └── vmlinuz-linux
    

The important files are `/boot/loader/loader.conf` and `/boot/loader/entries/arch.conf`.

    /boot/loader/loader.conf
    ##############
    
    default arch
    timeout 1
    editor 0
    

Generate your `PARTUUID` by running `blkid -s PARTUUID -o value /dev/nvme0n1p2`.

    /boot/loader/entries/arch.conf
    ##################
    
    title   Arch Linux
    linux   /vmlinuz-linux
    initrd  /initramfs-linux.img
    options root=PARTUUID=66e3f67d-f59a-4086-acdd-a6e248a3ee80 rw
    

Optionally, your options line could be `options root=/dev/nvme0n1p3 rw`.

With that, your bootloader should be sorted. You can run `bootctl update` if required after making changes.

### 3.5 – initramfs modules

In order to get everything working correctly I required the following modules:

    MODULES="intel_agp i915 nvme"
    

Run `mkinitcpio -p linux` to build these modules into the initramfs image.

### 3.6 – reboot

It’s time for the moment of truth. Please post a comment if you find something missing above.

## 4 – Broadcom Wireless

As previously mentioned you’ll need to be on Linux kernel 4.4.1-1 or higher. The Arch wiki suggests enabling the testing repos in `/etc/pacman.conf` to make sure you get the correct binaries from `linux-firmware`.

Run `ip link` and look for the wifi adapter. Then plug that into wpa_supplicant below (which you hopefully installed in the chroot via Android USB tethering or a USB ethernet adapter).

`wpa_supplicant -D nl80211 -i wlp58s0 -c <(wpa_passphrase "<SSID>" "<password>")`

This will run in the foreground (use `-B`) to background the connection. If you’re not getting an IP address then run `dhcpcd wlp58s0`.

Once I’d made this connection I finally downloaded and installed the rest of my system like `gnome` etc. If you’re using gnome you’ll want to `systemctl enable NetworkManager` as well as `systemctl enable dhcpcd`.

## 5 – Wrap up

The hardest bit, without a doubt was getting my head around UEFI. Hopefully you’ll have less issues than me due to this article. Please let me know in the comments your experiences.
