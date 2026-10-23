---
title: Automated Ethereum Crypto Mining using systemd
date: 2017-12-06T03:06:00Z
author: IronicBadger
tags:
  - cryptocurrency
  - ethereum
  - bitcoin
  - mining
hero: ./featured.jpg
---

Time is money in crypto mining. So how do you make sure that your card is always mining? What if whilst you're sleeping or not paying attention when your mining software crashes? This happened to me today and I lost about 8 hours.

I'll show you how we can use systemd to fix this by automatically restarting your miner when the process crashes.

Start by creating the systemd unit file in `/etc/systemd/system/ethmine.service` containing

    [Unit]
    Description=Eth miner
    After=network.target
    
    [Service]
    Environment=GPU_FORCE_64BIT_PTR=0
    Environment=GPU_MAX_HEAP_SIZE=100
    Environment=GPU_USE_SYNC_OBJECTS=1
    Environment=GPU_MAX_ALLOC_PERCENT=100
    Environment=GPU_SINGLE_ALLOC_PERCENT=100
    ExecStart=/usr/bin/ethminer --farm-recheck 200 -G -S eu1.ethermine.org:4444 -O 68dC7a87F3725bE19FbEaC25E59B25285C3974cb.zaphod-rx560
    Restart=always
    
    [Install]
    WantedBy=multi-user.target
    

When you're done, save the file and start the service.

    sudo systemctl start ethmine
    

You can monitor the service status in realtime with

    watch -n0 systemctl status ethmine
    

If all is well, enable the service

    sudo systemctl enable ethmine
    

Systemd is simple enough but finding the right syntax can often be a right pain, especially if you're new to Linux.

One of the things I love about crypto-mining is that it's bringing new people to Linux. If that's you, welcome!
