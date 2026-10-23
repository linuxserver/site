---
title: dstat - How to check individual disk IO in Linux
date: 2017-09-19T00:01:00Z
author: IronicBadger
tags:
  - linux
---

There might be the odd occasion where you want to know what your drives are up to individually. Enter, [dstat](http://dag.wiee.rs/home-made/dstat/). Do follow the link as the site has a plethora of other options to try!

This tool is installable on Debian with `apt install dstat` and provides a bunch of useful information. You can run `dstat` on it's own and it will by default print information about disk total usage, net totals, paging information and system statistics. What we want though is to group drive writes for individual drives.

    dstat -tdD total,sde,sdh,sdc 60
    

For me, this produced the following output when left to run for one minute.

    root@epsilon:/# dstat -tdD total,sde,sdh,sdc 60
    ----system---- -dsk/total----dsk/sde-----dsk/sdh-----dsk/sdc--
         time     | read  writ: read  writ: read  writ: read  writ
    18-09 20:43:36|  17M 3423k:3078k  612k:4243k  821k: 527k 1565k
    18-09 20:44:36|  62k  507k:   0     0 :   0  9694B:  62k  497k
    

There you have it. Quick and simple disk IO monitoring for Linux with `dstat`.
