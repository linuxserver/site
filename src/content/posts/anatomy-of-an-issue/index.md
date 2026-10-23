---
title: Anatomy of an Issue
date: 2022-05-10T10:00:00Z
author: spad
tags:
  - docker
  - linuxserver
  - troubleshooting
  - behind the scenes
hero: ./41294995925-b7e1ad61da-k.jpg
---

## Or: How On Earth Do We Track Down A Problem Only A Fraction of Our Users Are Experiencing?

We have [a lot of containers](https://docs.linuxserver.io/general/awesome-lsio) and a lot of users across a [lot of platforms](/blog/unravelling-some-stats/), which means that any time we update an image there's a chance it's going to break for some, many, or all of them. When something breaks for everyone, it's usually quite easy to identify the cause and fix it, apply a workaround, or at least advise users that something upstream has broken and to pin to an older image until it's fixed.

However, when we get random reports from a small but significant group of users, trying to figure out exactly what's gone wrong is more difficult. Having just been through one such situation I thought it might be instructive to give a quick rundown of what happened, how we identified the root cause, and what we've done to try and mitigate the problem.

### Bye Bye Bionic

As you may be aware Ubuntu Bionic LTS goes out of support in June this year and we still have a handful of containers that are, for one reason or another, still using our Bionic base image. In preparation for its end of life, we started working to rebase the containers to the latest Ubuntu LTS release, Jammy. Jammy, or 22.04, has only been out for a month so we were a little wary of potential issues and made sure to thoroughly test the images ourselves before merging the PRs that would put them into production. As part of this testing we identified an issue with .NET core apps that were using version 3.1 or 5.0 and libssl, which meant we couldn't move them to Jammy and had to instead settle for our older - but still supported - Focal base image. Our testing continued and we determined that the nzbhydra2 image - which is Java-based - and our Ombi image - which uses .NET core 6 - were successfully passing all of our tests and so we pushed them live.

### Signs of Trouble

After a few days we had an Issue logged on Github for nzbhydra2 along with some queries on our [Discord server](https://discord.gg/YWrKVTn) reporting that the container was failing to start and throwing a very vague error `ERROR - Unable to determine java version; make sure Java is installed and callable`. In parallel we saw an Issue logged on Github for Ombi with a similar startup failure, with an equally non-specific error `Failed to create CoreCLR, HRESULT: 0x80070008`. Digging into these errors on Google suggested both pointed to an issue with hitting thread creation limits - but we couldn't find any evidence that was happening on the affected machines.

Making this more challenging was that none of us could replicate the problem. We run a wide range of configurations among the Linuxserver team; different hardware, different distros, different architectures, even different container runtimes, but no matter who tested them, both images were working as expected. Finally, one of the team reported being able to replicate the problem and we started digging into what was special about their setup. After a lot of back and forth and numerous test images being built we finally identified a difference: they were running a very out of date version of Docker. Specifically 19.03.5, which was released 2019-11-14. We know we've had issues in the past with older Docker versions causing problems so we got them to update to latest and retest: everything worked as expected.

### Narrowing It Down

So now we knew that it was likely something to do with the version of Docker, but all we knew was that *somewhere* in the last 3 years there was an update that made the images work on Jammy. We went back to the users who logged Issues and checked their reported version (incidentally this is why we ask you to *actually* use the issue template and not just paste your error and hit Submit) and the latest we could see was 20.10.02 (1 year old), which narrowed things down a lot, so I started testing on every Docker host I had available (it may not surprise you to learn I've got 9 of them) to figure out where the break point was. This produced some weird results; it worked fine on my Synology NAS, which was running 20.10.03, and on my Pi 4 running 64-bit Ubuntu when I rolled it back to the same version, but not on an x86_64 Ubuntu VM. I started iterating through the Docker releases one at a time until I found the magic release: 20.10.10 was the first where both containers worked without issue.

### A Conclusion & A Solution

Reading through the [release notes](https://docs.docker.com/engine/release-notes/) it became apparent that [this](https://github.com/moby/moby/pull/42836) was likely the PR that fixed the issue and a little more digging revealed the `clone3` syscall as the root cause of all this trouble. You see, Docker uses [seccomp](https://en.wikipedia.org/wiki/Seccomp) to limit which syscalls a container can make and has a default profile it ships with releases that whitelists a bunch of necessary ones. The problem is that if a new syscall gets introduced but Docker doesn't have it included in the profile then your containers can't use it and if, as in this case, the syscall replaces an older one, new distros using it will break previously functional containers.

Following this discovery, we put together a [FAQ entry](https://docs.linuxserver.io/faq#jammy) to explain the situation and provide users with some options for fixing the problem. For those who can't upgrade Docker for whatever reason, there is a workaround in disabling seccomp for the affected containers, but it's not really ideal. Going forward we're going to take a slow approach to moving other containers to our Jammy base image to give people time to catch up with their Docker installs (20.10.10 is 6 months old but some people are slow to update) except in cases where there's an overriding benefit to getting them on the latest and greatest.
