---
title: How to get started mining crypto on Linux with Nvidia
date: 2017-12-18T03:48:00Z
author: IronicBadger
tags:
  - linux
  - arch linux
  - cryptocurrency
  - nvidia
hero: ./featured.jpg
---

I'm really excited about the current influx of new people to building computers for the first time to mine cryptocurrencies such as Bitcoin, Ethereum and more. Spending time browsing Reddit I get the impression some are completely new to building PCs and even newer to Linux. This guide is (hopefully) going to give you some of the answers to start mining crypto on an Nvidia setup under Linux.

Plus, if you use Linux you get to pull this face at Windows users! Incidentally I get *better* performance under Linux than Windows too!

![smugface](https://i.imgur.com/EQdA2gd.jpg)

My rig is currently running 100% headless and is accessible only via [SSH](https://www.digitalocean.com/community/tutorials/how-to-use-ssh-to-connect-to-a-remote-server-in-ubuntu) remotely.  Using some scripts I have automated the monitoring of `ccminer` which is the software I'm currently using to mine [MONA](https://github.com/monacoinproject/monacoin).

## Install Linux

This part of the guide is actually going to be the lightest part even though for some, it is the most daunting. I am using Arch Linux because it is stripped down to the barebones and has pre-compiled versions of the mining softwares in the [AUR](https://aur.archlinux.org/). It doesn't come with anything installed out the box you absolutely don't need for a bootable system. This is both a pro and a con. You can, in theory, use any Linux and apply much of the logic here but YMMV.

![arch](http://www.geekpills.com/wp-content/uploads/2017/11/arch-linux-logo.png)

A full installation guide for Arch is [here](https://wiki.archlinux.org/index.php/installation_guide).

## Setup your system

> N.B. This guide is for Arch Linux. You *will* have to adjust package names and possibly compile software from source if using other distros...

I am assuming at this point you have a booted Arch Linux installation and are either at the console locally (via a screen, keyboard and mouse) or via SSH - either is fine.

Install your [AUR](https://aur.archlinux.org/) helper of choice, I use [pacaur](https://aur.archlinux.org/packages/pacaur/). A script to install it is available [here](https://gist.github.com/Tadly/0e65d30f279a34c33e9b).

First, we'll need some packages:

    pacman -Sy \
      cronie \
      cuda \
      nvidia \
      nvidia-settings \
      xorg-server
    

Next, we'll install the mining software from the AUR:

    pacaur -Sy \
      ccminer-git
    

## Configure X for Nvidia

> You can find the script I use for overclocking on Github [here](https://gist.github.com/IronicBadger/fe82e7c242e8c1f98a1c80eb6f8d7c9e).

Nvidia tooling on Linux kinda sucks but I've tried my best to take the pain out of it with a few commands. First, we need to enable overclocking of the cards by passing the `--cool-bits=28` option along with a few other parameters which let us run the cards and X (the display manager) headlessly.

    nvidia-xconfig \
        --allow-empty-initial-configuration \
        --enable-all-gpus \
        --cool-bits=28 \
        --separate-x-screens
    

This creates a new xorg config in `/etc/X11/xorg.conf`, go look if you like!

Reboot and you should now be able to modify the core clock and memory speeds on your card(s). The above command works for multiple cards in a single system too.

## Overclocking NVIDIA cards under Linux

![nvidia](http://1000logos.net/wp-content/uploads/2017/05/Logo-NVIDIA.jpg)

There's lots of information all over the internet on how to do this. Here's what worked for me. A script that I can execute as part of my automation to ensure the overclocks, power limits and other settings are as they should be before mining commences.

    #!/bin/bash
    # A script for overclocking Nvidia graphics card under Linux
    
    nvidia-smi -pm ENABLED
    
    export GPU_FORCE_64BIT_PTR=0
    export GPU_MAX_HEAP_SIZE=100
    export GPU_USE_SYNC_OBJECTS=1
    export GPU_MAX_ALLOC_PERCENT=100
    export GPU_SINGLE_ALLOC_PERCENT=100
    
    X :0 &
    sleep 5
    export DISPLAY=:0
    sleep 3
    
    # 1080
    nvidia-smi -i 0 -pl 150
    nvidia-settings \
        -a "[gpu:0]/GPUFanControlState=1" \
        -a "[fan:0]/GPUTargetFanSpeed=65" \
        -a "[gpu:0]/GPUGraphicsClockOffset[3]=108" \
        -a "[gpu:0]/GPUMemoryTransferRateOffset[3]=-250"
    
    # 1070
    nvidia-smi -i 1 -pl 130
    nvidia-settings \
        -a "[gpu:1]/GPUFanControlState=1" \
        -a "[fan:1]/GPUTargetFanSpeed=65" \
        -a "[gpu:1]/GPUGraphicsClockOffset[3]=100" \
        -a "[gpu:1]/GPUMemoryTransferRateOffset[3]=-250"
    

I save this script in my home folder as `nvidia.sh`. Mark it as executable with `chmod +x nvidia.sh` and the run it with `./nvidia.sh`. Modify the values to suit your needs of course.

To find out which GPU in your system is which run `nvidia-smi`. That ID is then used in the above script. In my case card `0` is a 1080 and card `1` a 1070 from the following output...

    +---------------------------------------------------------------------------+
    | NVIDIA-SMI 387.34                 Driver Version: 387.34                    |
    |-----------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |=============================+======================+======================|
    |   0  GeForce GTX 1080    On   | 00000000:03:00.0  On |                  N/A |
    | 65%   58C    P2   155W / 150W |   3277MiB /  8114MiB |     93%      Default |
    +-----------------------------+----------------------+----------------------+
    |   1  GeForce GTX 1070    On   | 00000000:04:00.0  On |                  N/A |
    | 65%   48C    P2   119W / 130W |   3251MiB /  8114MiB |     99%      Default |
    +-----------------------------+----------------------+----------------------+
    

Note that I have dropped the power limit for each card to around 65% with `nvidia-smi -i 0 -pl 150`. This increases efficiency (hash per watt) without affecting the actual hashrate. **Experiment at your own risk as it is possible to damage cards by changing these settings.**

## Manual Mining

I won't cover mining pools here, which coin to mine or pretty much anything to do with actual mining as I'm assuming you already know that. If you don't and would like an article on that I can probably be persuaded!

In this example I am using `ccminer` with `cuda` to mine MONA at [https://mona.suprnova.cc/](https://mona.suprnova.cc/). At the most basic level you can simply run the mining software in your terminal using the following command:

    ccminer -o stratum+tcp://mona.suprnova.cc:2995 -a lyra2rev2 -u alexktz.lsio -p thanks -i 21
    

However software crashes, drivers crash, power cuts happen, etc. All of these things require you to be attentive and watch your system closely. I automate things for a living so this naturally didn't sit well with me.

You'll need to edit the username and password above unless you want to throw beer money my way!

## Automated Mining

I wrote a simple script to automate the checking of the utilisation of my GPUs and if below 75%, restart the miner. Full scripts [here](https://gist.github.com/IronicBadger/2f9d5497912b331a50279d6044c44633).

#### Create a systemd service

Firstly I created a systemd service to run the miner in the background. There are many ways to achieve this and systemd is one option...

        [Unit]
        Description=Mine MONA with ccminer
        After=network.target
    
        [Service]
        Environment=GPU_FORCE_64BIT_PTR=0
        Environment=GPU_MAX_HEAP_SIZE=100
        Environment=GPU_USE_SYNC_OBJECTS=1
        Environment=GPU_MAX_ALLOC_PERCENT=100
        Environment=GPU_SINGLE_ALLOC_PERCENT=100
        ExecStart=/usr/bin/ccminer -o stratum+tcp://mona.suprnova.cc:2995 -a lyra2rev2 -u alexktz.lsio -p thanks -i 21
    
        [Install]
        WantedBy=multi-user.target
    

Most of the above should look familiar when you read it closely. Save this file into `/etc/systemd/system/ccmona.service`. Check it works with `systemctl start ccmona` and monitor it with `watch systemctl status ccmona`.

#### Automated mining liveliness check

Save the following as `check.sh`, make it executable with `chmod +x check.sh` and then run it with `./check.sh`. This should work with all recent Nvidia cards without modification.

    #!/bin/bash
    
    for GPU in {0..1}
    do
      UTIL=`nvidia-smi -i $GPU --query-gpu=utilization.gpu --format=csv,noheader | cut -f1 -d" "`
      if (($UTIL < 75)); then
        GPUINFO=`nvidia-smi -i $GPU --query-gpu=index,name,utilization.gpu,temperature.gpu --format=csv,noheader`
    
        ### restart ccminer
        systemctl restart ccmona
        python3 /usr/bin/bootlace -m "Mona ccminer restarted. $GPUINFO was IDLE!" -T "MONA check" -t nope -u nope
    
        # so that we don't restart the service more times the neccessary, force exit here
        exit 1
      else
        echo "all is well"
        
        #TODO: some magic with the whattomine JSON feed...
      fi
    done
    

To automate this check I used [cron](https://wiki.archlinux.org/index.php/cron) but you could use systemd timers or any other number of solutions. My cron entry to run `check.sh` every minute is thus:

    * * * * * /bin/bash /root/check.sh >/dev/null 2>&1
    

You'll need to start and enable the cronie service:

    systemctl start cronie
    systemctl enable cronie
    

#### Notifications via Pushover

> This step is *optional*

![](/content/images/2017/12/Screenshot_20171217-214902.jpg)

A few years ago I wrote a simple Python app to allow the sending of Pushover notifications from Linux called [bootlace](https://github.com/IronicBadger/bootlace). I use this here as part of my `check.sh` script. Save `bootlace.py` somewhere on your system and make it executable (`chmod +x`). Then go to Pushover and register for an account, user and app tokens.

You will need to install `python-pip` with pacman. Then install via `pip install docopt requests`.

    python bootlace.py \
      -m "Message content" \
      -t "Application token" \
      -u "Pushover user token" \
      -d "Override device name" \
      -T "Override notification title"
    

## Future plans

If I get around to it I hope to use the check script to do more stuff like check the most profitable coin on whattomine.com, parse the JSON and switch up the coin being mined automatically. That said, life is short.

Also, the check script as it stands is a bit dumb. Maybe it should check for GPU activity over the course of a few seconds instead of just one occasion. This would help reduce false positives.

Happy mining!
