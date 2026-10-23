---
title: The dangers of pulling :latest
date: 2018-04-22T15:32:00Z
author: Josh Stark
tags:
  - docker
  - containers
hero: ./featured.jpg
---

On a wonderful sunny Sunday morning, I spent a good few hours sweating over my server in the hopes of restoring a partially corrupted and misconfigured database. Why? Because I was pulling `mysql:latest`.

This should serve as a case study for those that live on the edge - it's not always wise to continually pull the latest build of your favourite server applications. Updates have the potential to break backwards compatibility.

So, what happened? On [19th April 2018](https://github.com/docker-library/mysql/commit/ff627942605ce08a32fa527993337df0e9856760), the docker image for MySQL moved its `latest` tag from the stable `5.7` branch over to the stable `8.0` branch. This resulted in many users of the image [reporting issues](https://github.com/docker-library/mysql/issues/409) when pulling down the newer build of the database software - issues I unfortunately experienced myself.

I use a multitude of our own Docker images, so I get into the habit of refreshing my apps once a week. This includes stopping and removing all containers, pulling the latest version of the images down, then rebuilding all containers. Within that list lies the MySQL image, which I was foolishly pulling from `latest`. Of course, updating an existing database across *three* major versions is going to cause all kinds of pain. If there is one category of software you absolutely *do not want* to change often, it's the DBMS.

Of course, it's not always a dangerous game to play - other software suites are perfectly safe to update regularly, but it's important to understand the side-effects that potential major (or even in some cases, minor) version updates will have on your persisted data.

Thankfully, I back up all of my application data on a regular basis using [Duplicati](https://www.duplicati.com), which we also provide via a [Docker image](https://hub.docker.com/r/linuxserver/duplicati/). After having remembered I indeed had a semi-recent backup of my database, I removed my (now messed up v8.0) container for MySQL, restored my 5.7 version of the database, locked my MySQL image to 5.7, then rebuilt. Presto, I'm back in business.

Remember, `latest` really does mean *latest*, so ask yourself, do you *need* to be running the bleeding edge?
