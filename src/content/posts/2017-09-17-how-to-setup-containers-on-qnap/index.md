---
title: "How To: Setup Containers on QNAP"
date: 2017-09-17T19:10:00Z
author: j0nnymoe
tags:
  - QNAP
  - how to
  - docker
  - containers
  - tvheadend
hero: ./featured.jpg
---

## Introduction

The aim of this guide will be to show new users of our containers how to get started on the QNAP platform. I will cover how to go about setting up the user and permissions as well as the information you need to enter during each screen of the Container Station wizard. With this guide, I will assume that you have already done the following:

- Latest QNAP Firmware Installed.
- Container Station Installed & Updated.
- Understand how to access your QNAP via SSH.

For this guide, I will be using our [TVHeadend image](https://github.com/linuxserver/docker-tvheadend).

## User Creation

To start, we want to create a user for our docker containers to use so that they are not running as root, primarily for security reasons. Go to "Users" from the main screen QTS, select "Create User" and create your user accordingly. I will be creating a user called "dockuser" and everything else I have left as default (User Group etc).

![](/content/images/2017/04/chrome_2017-04-08_00-34-30.png)

## Folder Creation

Now we are going to create a new shared folder that we will keep all our docker *appdata* in. Load up "File Station" and create a new share by clicking on the `+` next to your Data Volume.

![](/content/images/2017/06/chrome_2017-06-05_21-33-57.png)

Here we will call the folder "appdata" and for the "Configure access privileges for users" we want to give our new user full read/write access to this folder. Everything else I have left as default.

![](/content/images/2017/06/chrome_2017-06-05_21-36-37.png)

Once you have your appdata folder created, create a folder for the container's config data. I will name this "tvheadend" as I am using it for this example.

I will also create another share here as well called "recordings". Same principle again; with any folder you want a container to use, make sure it has R/W permissions.

![](/content/images/2017/06/chrome_2017-06-05_21-37-41.png)

## Get User IDs

Next we need to find the UID/GID of the user we created earlier. This is needed so that the files created by the container are accessible by users on the host OS.  Use your favourite method to ssh into the QNAP NAS and run the following command:

    id <username>
    

Replace `<username>` with the user you created earlier. For this guide, here are my results of that command:

    [~] # id dockuser
    uid=500(dockuser) gid=100(everyone) groups=100(everyone)
    [~] #
    

## Container Creation

Now we have the folders/permissions set up and we know our UID/GID information, we are going to create our TVHeadend container via the Container Station. Load up Container Station and click "Create Container"  (1) then type in the image you want to use - in this case, I typed in `linuxserver/tvheadend` (2) then clicked "Search" (3), followed by "Install" (4).

![](/content/images/2017/04/chrome_2017-04-08_00-53-40.png)

You will then be presented with an option to select which version to install; always choose "latest" unless otherwise stated to. Click "Next" and click "Ok" to the third party warning.

Once you have confirmed that, you will be shown a the "Create Container" window. Fill out the name (1), leave everything else blank and click "Advanced Settings" (2).

![](/content/images/2017/04/chrome_2017-04-08_00-58-06.png)

Here you will be given multiple sections you can set up. For this container we will be using Environments / Network / Shared Folders. Under the "Environments" section, fill it in as I have but adjust your PUID/PGID accordingly. Please note - the variables PUID/PGID reference the UID/GID values you acquired earlier.

![](/content/images/2017/04/chrome_2017-04-08_01-00-43.png)

On the "Network" section, this can vary if you have a DVB device connected directly to your QNAP NAS, which if you do, you would add the ports 9981 and 9982 while under Network Mode "NAT" but as I have a network tuner, I need to set this to "Host" and that's it.

![](/content/images/2017/04/chrome_2017-04-08_01-03-41.png)

If you do have a DVB device connected to your QNAP, you would now go into the "Device" section and add select the device from the drop down. As I don't need this, I will skip past it onto "Shared Folders"

Here we setup our folders for the container appdata and also the recordings. Simply click in "Host Path" and browse to your appdata folder you created for TVHeadend then add `/config` to the "Mount Point" and leave Read & Write ticked. Now do the same for your recordings folder. The mount points within the container need to be kept as they are otherwise when you start the container, the application won't operate correctly.

![](/content/images/2017/04/chrome_2017-04-08_01-11-47.png)

Once this has been done, you are ready to click "Create" and your container will be configured, after which you will see it listed in the "Overview" section.

![](/content/images/2017/04/chrome_2017-04-08_01-14-14.png)

Once up and running, depending on the container you have set up, give it a moment to initialise, then browse to its web UI using [http://ip.address](http://ip.address):portnumber.

## Conclusion

As you can see, this is a fairly painless task getting your first container up and running on a QNAP device. The only thing I can see that is missing is a method to update your existing containers. I have spoken with QNAP and they expect this feature to be available soon. Once it's ready I will update this article.
