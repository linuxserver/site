---
title: Changes to our UniFi image
date: 2019-02-18T11:49:00Z
author: Josh Stark
tags:
  - docker
  - unifi
hero: ./featured.jpg
---

In recent months we have seen a steady increase in interest for our current UniFi image. This image serves Ubiquiti's UniFi Controller software. As Ubiquiti improved their quality control for releases the number of requests coming our way for an updated image increased too.

Time for a rethink.

TL;DR - We are deprecating `linuxserver/unifi` and replacing it with `linuxserver/unifi-controller`. Read on to find out more...

## Previously on "The Great UniFi Debate"...

To those who consume our UniFi image it is likely no secret that its tagging structure has raised contention over the last couple of years. When the image was first conceived, we observed instances where bleeding edge releases of the controller would break existing installs (our own included). 

As a vendor of pre-packaged software, we felt an obligation to make attempts to protect users from something like that happening, so we devised a tagging method which would make it harder for these kinds of bleeding edge changes to make it into the main tagging pipeline. Thus, the infamous `latest` vs `unstable` debate was born.

However, what we didn't account for was the steady increase in popularity for the Controller software, and the updates that came with it. Ubiquiti slowly improved their release process, and fewer bugged releases hit their downloads page. Users wished to be on the latest release – often as soon as it became available – which put extra strain on us to ensure these releases were available through our own image **immediately**. To fix this, the team here has accepted that changes needed to be made to ensure we follow the Controller release train more closely.

## Introducing `linuxserver/unifi-controller`

We have forked our original image into `linuxserver/unifi-controller` which will be our new primary image for the UniFi Network Controller (and SDN Controller). 

#### The new tags

This new image now provides you with a much more granular choice over which release train you wish to be on when consuming our image.

- `latest` will *always* package the most recent build version of the Controller software, regardless of release train. At the time of writing, this is the 5.10.x release, but will move at the same pace as Ubiquiti's releases.
- `5.9` will provide you with the most recent 5.9.x release.
- `5.8` will provide you with the most recent 5.8.x release.
- `5.7` will provide you with the most recent 5.7.x release.
- `LTS` will provide you with the most recent Long Term Support release from Ubiquiti, which at the time of writing is the 5.6.x release (SDN Controller).

## Deprecation Notice for `linuxserver/unifi`

All focus has now shifted on future development and maintenance of our new UniFi image. Because of this, we are officially deprecating our old image, and ask users to migrate over to the new one. The inner workings of the new image are effectively identical to before (with the exception of the introduction of our new pipeline logic, and the tagging), so migrating should be an easy affair:

1. Shut down the existing container (`docker stop unifi`).
2. Remove the old container (`docker rm unifi`).
3. Pull the new image (`docker pull linuxserver/unifi-controller`).

- **Note**: This will pull the `:latest` branch. If you were originally on 5.6.x, use `unifi-controller:LTS`.

4. Create a new container from the new image, with identical volume and port bindings.

**Please make sure you use the relevant tag in line with the version of the Controller you are running when you migrate**. This will minimise any issues (if any).
