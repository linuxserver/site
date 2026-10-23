---
title: Docker Team Changes
date: 2023-03-16T12:00:00Z
author: Roxedus
tags:
  - docker
  - news
  - linuxserver
  - docker hub
hero: ./45923164272-d160bda67f-c.jpg
---

As you may already know, Docker Inc. is [sunsetting Free team organizations](https://github.com/docker/hub-feedback/issues/2314).

## What does this mean for Linuxserver?

The Linuxserver organization is safe, as it is "Sponsored OSS". This is a program Docker introduced after enforcing pull-limits, being part of this program means our images do not count in the quota for the users' pull-limit. The perks this gives a sponsored organization are comparable to the "Team" organization plan.

In our daily operations we use 3 organizations, this is because we scope images three ways: `linuxserver` for our production images, `lsiodev` for non-live branch builds, and `lspipepr` for PR builds. This means that we need to figure out how to handle lsiodev and lspipepr, as they are currently both Free Team organizations.

Docker's comms on this change have been appalling, but they have at least made a commitment that they won't free up the namespace for any account they delete, which means that at least we don't have to worry about bad actors snapping up popular org names and hosting malicious images on them.

As an end-user, if you are using [lscr.io](/blog/wrap-up-warm-for-the-winter/) for your images, you won't notice any changes regardless of what happens.

## What is a Team organization?

It is an organizational unit which allows multiple users access to a shared "namespace" on Docker Hub. The namespace refers to the `linuxserver` part of `docker.io/linuxserver/swag:latest`. Being able to share this namespace between users is beneficial for multiple reasons; the linuxserver account is an organization primarily to reduce credential sharing, and for the ability to have a "bot" account, which is responsible for the actual pushing of images.

Not having to deal with shared credentials lowers the barrier of entry for onboarding new maintainers, especially if there is no release pipeline set up for the project. There is also quite a lot of trust involved with sharing credentials, you are essentially handing over ownership. A good organization implementation also includes permission management, Docker Hub has just enough roles to be able to say who can push images.

## I publish images under a Free Team organization, what can I do?

- You *can* stop using Docker Hub, or at least not use it as the sole registry you push to. GHCR (GitHub), GitLab, and Quay are all alternatives to consider.
- You can apply to the Docker-Sponsored Open Source (DSOS) program [here](https://www.docker.com/community/open-source/application/).
- You can upgrade your Docker Hub organization to a paid subscription, although they currently have a minimum 5 user count.
