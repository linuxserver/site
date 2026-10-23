---
title: Getting started with ZFS on Linux
date: 2019-05-14T19:48:00Z
author: IronicBadger
tags:
  - zfs
  - linux
hero: ./featured.jpg
---

After attending Linuxfest Northwest 2019 where both Allan Jude and Jim Salter gave excellent talks about ZFS, I finally gave in and decided to implement ZFS on my server. I wonder if being a ZFS junkie is a [TechSnap](https://techsnap.systems/) host pre-requisite? Here's a short article giving a ZFS 101 intro and list of commands in one place.

## ZFS on Linux

As of today the only distro that ships ZFS is Ubuntu. There is a full explanation of the drama surrounding the licensing involved if you're interested [here](https://blog.ubuntu.com/2016/02/18/zfs-licensing-and-linux). 

Ubuntu simply requires a couple of user space tools be installed where all other major Linux distros require the use of DKMS kernel modules. DKMS is an OK-ish solution but requires the kernel module be recompiled whenever a kernel update is shipped. No thanks!

Installation of the user space tools is simple. A full wiki post from Canonical is available [here](https://wiki.ubuntu.com/ZFS). But the TL;DR is this:

    apt install zfsutils-linux

## Basic Commands

For a great explanation of why you should be using mirrors see [Jim's blog](https://jrs-s.net/2015/02/06/zfs-you-should-use-mirror-vdevs-not-raidz/).

Creating a mirrored pair is achieved thus:

    zpool create tank mirror -m /mnt/tank -o ashift=12 /dev/disk/by-id/ata-WDC_WD100EMAZ-00WJTA0_serial /dev/disk/by-id/ata-WDC_WD100EMAZ-00WJTA0_serial
    

Once you have created your zpool, do not put any data in the root of it. Instead, use datasets. This makes replication much easier later on and makes logical separation of your data much more easily managed.

    # list zpools
    $ zpool list
    NAME   SIZE  ALLOC   FREE  EXPANDSZ   FRAG    CAP  DEDUP  HEALTH  ALTROOT
    tank  9.06T  2.51T  6.55T         -     1%    27%  1.00x  ONLINE  -
    
    # create datasets
    $ zfs create tank/appdata # takes format of pool/dataset/name
    
    # list datasets
    $ zfs list
    NAME                    USED  AVAIL  REFER  MOUNTPOINT
    tank                   2.51T  6.27T   104K  /mnt/tank
    tank/appdata           8.99G  6.27T  5.87G  /mnt/tank/appdata
    tank/appdata/influxdb    96K  6.27T    96K  /mnt/tank/appdata/influxdb
    tank/backups            293G  6.27T   293G  /mnt/tank/backups
    
    # create snapshot
    $ zfs snapshot pool/dataset@snapshotname
    # or for a recursive (all dirs under this dataset) snapshot
    $ zfs snapshot -r pool/dataset@snapshotname
    
    # list snapshots
    $ zfs list -t snapshot
    NAME                                 USED  AVAIL  REFER  MOUNTPOINT
    tank/appdata@20190506-2300           400M      -  5.67G  -
    tank/appdata@080519-1430             111M      -  5.88G  -
    tank/fuse@20190502-0900              112K      -   144K  -
    tank/fuse/audiobooks@20190502-0900   317M      -  83.6G  -
    
    # create mountpoint if you didn't already
    $ zfs create -o mountpoint=/mnt/point tank/dataset/to/mount
    

## Basic Tuning

Jim Salter's blog at [jrs-s.net](https://jrs-s.net) has a number of excellent posts about ZFS. Make sure you set ashift correctly. Disks often lie about their sector size and if you ignore this setting it can drastically degrade performance. Most large drives have 4k sectors so an `ashift=12` is usually fine. Some Samsung SSD have 8k sectors where `ashift=13` would be required.

> Ashift is per-vdev and immutable once set. It cannot be set at any level below the vdev.
> &mdash; Jim Salter (@jrssnet) [May 1, 2019](https://twitter.com/jrssnet/status/1123723278017757185?ref_src=twsrc%5Etfw)

If you're using systems which rely on SELinux you'll be well served enabling `xattr=sa` for the extended attributes it requires.

It boils down to a few basic parameters as confirmed by Allan Jude in this tweet.

> Compress on, atime off, ashift 12. All looks good
> &mdash; Allan Jude (@allanjude) [May 1, 2019](https://twitter.com/allanjude/status/1123701370220052482?ref_src=twsrc%5Etfw)

I also highly recommend taking a look through some of Jim's presentations [here](https://jrs-s.net/presentations/).

## Maintenance

> edit: Note that Ubuntu automatically schedules scrubs for you. Jim pointed this out to me on Twitter!

> another note: modern versions of Ubuntu schedule a monthly scrub for you automatically. The one you added manually is a dupe. Check for yourself: [pic.twitter.com/VzHjV0lxH7](https://t.co/VzHjV0lxH7)
> &mdash; Jim Salter (@jrssnet) [May 14, 2019](https://twitter.com/jrssnet/status/1128366969294602241?ref_src=twsrc%5Etfw)

ZFS requires that you run regular scrubs. Once a month is generally considered fine.

    # start a scrub
    $ zfs scrub pool/
    
    # see status of a scrub
    $ zpool status
      pool: tank
     state: ONLINE
      scan: scrub in progress since Thu May  9 21:24:30 2019
            14.4G scanned out of 2.51T at 104M/s, 6h58m to go
            0B repaired, 0.56% done
    config:
    
            NAME                                    STATE     READ WRITE CKSUM
            tank                                    ONLINE       0     0     0
              mirror-0                              ONLINE       0     0     0
                ata-WDC_WD100EMAZ-00WJTA0_SERIAL1  ONLINE       0     0     0
                ata-WDC_WD100EMAZ-00WJTA0_SERIAL2  ONLINE       0     0     0
    
    errors: No known data errors

You should probably set this maintenance to run automatically. Add this to your crontab with `crontab -e`

    # zpool scrub every month
    0 2 1 * * /sbin/zpool scrub files && curl -fsS --retry 3 https://hc-ping.com/some-generated-uuid > /dev/null
    0 13 1 * * /sbin/zpool status
    

Note that I am using [healthchecks.io](https://healthchecks.io) to notify me of failures here, rather than email. Linuxserver makes a [container](https://hub.docker.com/r/linuxserver/healthchecks) for this if you'd like to self host.

Good luck and remember, your drives are plotting against you.
