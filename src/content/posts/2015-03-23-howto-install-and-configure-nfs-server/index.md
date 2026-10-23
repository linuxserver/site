---
title: Install and configure NFS Server
date: 2015-03-23T15:40:00Z
author: Josh Stark
tags:
  - file share
  - nfs
  - server
---

NFS (Network File System) is a network sharing protocol that is commonly used by Linux servers due to its low network overhead and use of UID authentication.

NFS is particularly useful for low power systems such as the Raspberry Pi thanks to this lower overhead when compared with Samba. In conjunction with OSMC/OpenELEC (a way of running Kodi on a Pi) NFS enables flawless high bitrate streaming whereas Samba can occasionally use just that bit more CPU, meaning a stutter happens.

## Install the required packages

###### Ubuntu

    apt-get install -y nfs-common 
    

###### Arch

    pacman -Sy nfs-utils
    

###### CentOS

    yum install nfs-utils nfs-utils-lib
    

###### Fedora

    yum install -y nfs-utils system-config-nfs
    

## Set up your file shares (exports)

NFS configures its shares via `/etc/exports`. Configuring your exports may at first glance look daunting but once you get a basic understanding of the syntax, it is simple to maintain. The exports file — much like `/etc/fstab` — consists of multiple lines, each representing an export (file share), alongside its network restriction and share options. Below is an example:

    /media/storage/share1 192.168.0.0/24(ro,all_squash,insecure,anonuid=1003,anongid=1004,subtree_check,fsid=1)
    /media/storage/share2 192.168.0.0/24(ro,all_squash,insecure,anonuid=1003,anongid=1004,subtree_check,fsid=2)
    /home/user/documents 192.168.0.0/24(rw,root_squash,insecure,subtree_check)
    

In the above example, three shares are exported: two are media shares, with the third a documents share. When done creating / editing your exports, ensure you run the following command:

    exportfs -ra
    

`exportfs` re-exports all directories listed in the exports file and simply ensures that the shares get set up correctly.

### Understanding an export entry

Each line is split into three sections: the folder to share; the network access restriction; and the options. Taking the first export as an example:

- `/media/storage/share1` – The folder I want to share
- `192.168.0.0/24` – Limit access to this export to IP addresses on the local network. If you are not overly interested in locking down access via IP, you can use *** **instead.
- `(ro,all_squash,insecure,anonuid=1003,anongid=1004,subtree_check,fsid=1)` – The options that further restrict who can access this share.

### NFS options explained

- `ro` – The export is read-only (the opposite is `rw`).
- `all_squash` – Set the UID and GID of all clients to the default anonymous user *nobody* (65534).
- `insecure` – Ensure the share is accessible on any requesting port.
- `anonuid` – Used in conjunction with `all_squash`. The UID set here remaps the client to the specified UID. In this case, I’ve created a user with a UID of 1003. This way, I can ensure the share’s UNIX file permissions are respected as all files under /media/storage/share1 are only accessible to UID 1003.
- `anongid` – Same usage as `anonuid` but deals with remapping the clients GID (group ID).
- `subtree_check` – When a file is requested, this option makes sure that it’s under the exported directory (i.e. within the exported subtree).
- `fsid` – This option is required if you are exporting multiple directories on the same mount. They should be unique and numerical. In the above example, I’m exporting two directories on the same mount (/media/storage), so I need to set them apart.
- `root_squash` – This maps any client connected as root to the anonymous user. However, any other UID/GID are left alone. This is a useful option if you want to open access to a share based on that share’s UNIX file permissions based on the client user.

### Authentication

It is important to remember that **NFS does not authenticate based on username and password**. In fact, passwords are not used at all.

NFS makes use of UNIX userids and groupids instead. Generally, NFS is used for insecure data (i.e. perfect for media sharing) or for an internal network where userids are shared across systems. NFS may not be the perfect solution to all requirements but it is a very useful protocol to use when retrieving large quantities of files.

## Starting/Stopping the NFS server

NFS runs as a service and can be started/stopped as follows:

###### Ubuntu

    service nfs-kernel-server stop 
    service nfs-kernel-server start
    

###### Arch

    systemctl enable rpcbind.service nfs-server.service 
    systemctl restart rpcbind.service 
    systemctl restart nfs-server.service
    

###### CentOS

    service nfs stop service nfs start
    

###### Fedora

    service nfs stop 
    service nfs start
