---
title: The Value of FOSS
date: 2023-12-06T14:45:00Z
author: Spad
description: " The Value of FOSS"
tags:
  - docker
  - open source
  - linuxserver
  - FOSS
  - finances
  - donations
hero: ./096adb9d-e771-4db3-9c2b-8ce6f147fd8f.png
draft: true
---

You've all seen the [xkcd comic](https://xkcd.com/2347/) about software dependencies:

![dependency](./dependency.png "Someday ImageMagick will finally break for good and we'll have a long period of scrambling as we try to reassemble civilization from the rubble.")

Well, it's absolutely true. As an organisation we depend on a bunch of tools that you have likely either never heard of, or are vaguely aware of by name but don't really know what they do. All of them are Free Open Source Software (FOSS), which means we can both use them for free and, if needed, modify and compile them ourselves. Without them we would be either completely unable to offer the images that we do, or they would be greatly diminished in number and quality.

With the exception of some high profile projects that get regular donations from users, or others that have negotiated sponsorship/support agreements with big companies (or been bought out by them), most FOSS projects get little to no financial support from the users of their software. Some offset this by offering commercial versions of their tools, with either additional features or simply providing support contracts, but that isn't a viable or desired option for many.

#### So?

As a fairly visible FOSS organisation we recieve regular [donations](https://opencollective.com/linuxserver) from both users and other projects that we package or work with that cover our operating costs and expenses, and as a non-profit anything beyond those costs currently goes into our rainy day fund. At this point we're comfortable that we have enough of a surplus to deal with ongoing cost increases and emergencies and so we have decided to put our money where our mouth is and start making regular donations to the projects we depend on.

We cannot predict the future, so we're not going to make hard commitments to the amount we will donate, it's something we will re-evaluate as we go forward. Our initial intent is that each year we will pick 5 upstream projects that we rely on and make a £250 donation to each, either as a lump sum or split into monthly payments depending on their preference.

To start us off we have selected the following projects:
* Alpine Linux (the vast majority of our images use Alpine base images)
* s6 (The init system used by all our images, via the s6-overlay packages)
* Curl (The defacto standard tool and library for data transfer across dozens of protocols)
* Jenkins (The CI tool that powers all of our image build pipelines)
* Busybox (A single 1Mb binary that provides minimal versions of almost all core Linux utilities)

#### Why are we doing this?

Because we can afford to and because we feel it's important to support the projects we rely on, both to ensure that they continue to exist, and because we think it's important that the developers behind these projects know that their work is appreciated and valued.

#### Why are we doing it publicly?

In part because we are always transparent about our finances, but also because we hope that it both brings attention to the projects we've mentioned and encourages you to consider donating to FOSS projects that *you* rely on for your own work and personal projects.

#### Why not donate more money/to more projects/to different projects?

We have to be realistic about what we can afford to donate going forward; there's no point in doing this if we can't follow through on it. We're not some huge commercial entity, we're a small organisation run by volunteers and kept going by donations. By keeping the amounts sensible, and limiting the number of projects we donate to we can help ensure it's sustainable for us. By focusing on upstream projects that we rely on, rather than the wider FOSS ecosystem we avoid having to try and pick from thousands of deserving projects, or appearing to play favourites with who we choose to donate to.
