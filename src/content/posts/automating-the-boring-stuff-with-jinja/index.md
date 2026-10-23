---
title: Automating the boring stuff with Jinja
date: 2022-10-01T11:00:00Z
author: Roxedus
tags:
  - unraid
  - docker
  - automation
hero: ./andrea-de-santis-zwd435-ewb4-unsplash1.jpg
---

Yes, I know Jinja is a python library, but where is my original title then?

Docker, and other OCI runtimes can be found in lots of places, that being your laptop, server, home-automation system or maybe even your router, just to name a few. Some of these solutions use wrappers for getting your container running, this wrapper can be CLI based (like docker-compose) or GUI based (like [Yacht](https://github.com/SelfhostedPro/Yacht), [Unraid](https://unraid.net/) etc.). If you have ever looked at our documentation (You do [Read The Freaking Manual](https://en.wikipedia.org/wiki/RTFM), right?) you have seen our `docker-compose` and `docker run` examples, those should be a good primer on getting the container up and running using those systems. However, the GUI based wrappers are less straight forward to create examples or templates for, as they often require deeper knowledge to the system the wrapper is built for. Well, as you may know, the reason Linuxserver.io exists is because of Unraid, which now has evolved to a nice GUI based Docker host, where the containers are managed through the concept of templates.

As someone who got the foot inside the home-server door using Unraid I appreciate their implementation for creating and managing containers trough a GUI, and all the considerations it involves. Linuxserver has had templates in Community Applications from early on, and we still want to. However the creation of said templates has been manual labour, and at times tedious. That is about to change, as we have been working on automatically creating and updating these templates. This gives us the ability to focus more of our free time towards support and development of more awesome stuff.

## Now for the technical stuff

You probably don't know that our pipeline is already heavily templated, we touch on this in a [earlier blogpost](/blog/2019-02-21-the-lsio-pipeline-project/), this pipeline now also creates templates for Unraid, using Jinja2 invoked with Ansible. We are now creating XML files that Unraid can consume in our [templates](https://github.com/linuxserver/templates) repository. This template supports most, if not all, of the current features Community Applications offers.

Unlike our old manual templates this will:

* List all the active branches upon install
* Automatically receive updates when documentation and variables changes
* Link to the new issue section of GitHub for support
* Not keep up with the Kardashians

Roxedus wrote a in-depth post about this adventure on his blog [nonsense.fyi](https://nonsense.fyi/posts/templating-templates-with-templates/)

## So what does this mean for you?

In short, it means an image will be available ASAP after we consider it released, and templates will get the same care and quality as the rest of our work.

These new templates are already set up to use lscr.io, which we covered in [this article](/blog/wrap-up-warm-for-the-winter/).

To help streamline support for our increasing container userbase across multiple platforms, we will soon be focusing support in the following channels:
* [Discord](https://discord.gg/YWrKVTn)
* [GitHub](https://github.com/linuxserver)
* [Our forums](https://discourse.linuxserver.io/)
