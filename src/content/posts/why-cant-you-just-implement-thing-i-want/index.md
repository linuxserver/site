---
title: Why Can't You Just Implement <Thing I Want>?
date: 2024-06-15T15:56:00Z
tags:
  - containers
  - docker
  - linuxserver
hero: ./13029008984-ecac8243dd-h.jpg
---

It's a common refrain: "Why can't you just implement this feature that would make my life easier? It's not even that hard, it's just this environment variable or this bit of init logic. There are lots of people just like me who would benefit from it."

![dozens](./dozens.gif "There are dozens of us! Dozens!!")

It should be pretty obvious that we can't implement every feature request we receive, but the important question is why didn't we implement **yours**?

### KISS

As The Notorious B.I.G famously said: Mo Code Mo Problems. Almost every time we add functionality to an image, we're increasing its complexity, and the number of ways it can go wrong. Sure *you* made this change in your homelab and it's all working fine, but *you* are not representative of our user base. You're not running on a 3.x kernel, or on a prebuilt NAS that still ships version 17.x of Docker, or on Proxmox running a VM running LXC running Docker in Docker *for no good reason*. You also probably didn't copy/paste our docker compose example as-is and spin it up; a surprising number of people do, so every extra configuration option requires a level of planning and documentation to ensure that those copy/pasters don't end up with a broken install, which brings us to...

### Limited Resources

We're all volunteers - none of us get paid for this - and we do it in our own time because we enjoy it. Having people yell at you that you're shit because you won't do the things they want is not enjoyable. We have to be realistic about what we're able to support, which is why when images start to require too much ongoing work to keep them running, we have to take a hard look at whether they're worth continuing to maintain (RIP armhf). We maintain over 200 images, so while for you this is a quick fix for your particular use case, for us it could open the gates to a *lot* of extra work.

It's impossible for us to provide support for every use case, and every conceivable way of running our images, which is why we have a published [Support Policy](https://www.linuxserver.io/supportpolicy) to try and limit the scope of what we're expected to cover. We're not doing it because we hate k8s or Podman, or think running rootless is a bad idea, we're doing it because we have to draw a reasonable support boundary that covers the majority of our users. What this means is that if you come to us and say "I'm using this thing you don't support and I want you to change your images to make my life easier doing it" we're probably going to say no, unless it's something trivial with no risk of impacting anything else.

### But *My* Case Is Different

We can't be all things to all people. Even if we had unlimited resources it just isn't practical to support *everything* with one image. We design our images with a particular audience in mind: homelab users running Docker who might not have a great deal of knowledge about containers and want something that is simple to set up and maintain. We'll never go out of our way to make it *harder* for people with other setups and use cases to run things, but they're not going to be our primary consideration. There are plenty of other people who maintain images designed for running in k8s, or rootless, or for zero-touch deployments and we don't feel the need to compete with them.

### Be The Change You Want to See

If you really, desperately, want particular functionality in one of our images, you've got a few options:

* Modify the container at runtime using our [custom script logic or mods](https://www.linuxserver.io/custom)
* Convince us that your request would be beneficial to *a broad range* of other users and isn't going to introduce unnecessary complexity
	* Even better, submit a PR that does the above
* Build your own downstream image FROM ours, incorporating your changes
* Fork the repo and maintain your own copy of the project, incorporating your changes

### Looking to the Future

We're always looking for ways to improve our images, both in terms of user experience and how we build them, and we usually have multiple projects ongoing in service of that. Unfortunately, they don't always pan out; sometimes because we decide the work involved isn't going to be worth it in the end, and sometimes because we run into an insurmountable issue that prevents us from continuing. Not implementing your request today doesn't mean we'll never consider it, or that we hate you specifically, just that right now we have other priorities.
