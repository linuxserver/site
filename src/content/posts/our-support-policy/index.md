---
title: Our Support Policy
date: 2023-10-26T11:00:00Z
author: Spad
tags:
  - docker
  - linuxserver
  - support
  - policy
hero: ./16737997835-4b8499d246-o.jpg
---

We maintain a lot of images, which are used by a lot of people, on a lot of platforms, using a lot of tools, and it's not always immediately clear which of those many combinations we support, and will provide support for. This post is an attempt to clarify that situation and provide links to our formal documentation on the matter.

Any exceptions to our support policy will be clearly called out in the readme for the relevant image.

The TL;DR is if you run up to date versions of our currently maintained images using a supported version of Docker, rootfully, on Linux, using docker compose or the docker CLI to create and update your containers, we will support you with any issues you encounter.

Our support policy can be grouped into 4 categories:

* Formally Supported
* Reasonable Endeavours Support
* Unsupported
* Unsupported and Known To Be Broken

With the exception of the last category it's worth noting that unsupported does not mean it won't work, it just means we won't help you make it work. Additionally, if you *do* manage to get something in the last category working it doesn't change anything, it's still unsupported and a bad idea. Requests for help with anything outside of the Formally Supported category should use the `#other-support` channel on our [Discord](https://discord.gg/linuxserver) server.

Our general support philosophy can be summarised as follows:

* If we build and test on it, we support you running on it.
* If it's not formally supported but we use it ourselves or we know it works, we'll make reasonable endeavours to help you with issues.
* If we don't have knowledge of, or the ability to test/replicate your configuration, we will not provide support for it (though other community members may still be able to help you).
* If we know a configuration will not work, or has serious issues, we will not provide any support for it and will advise you of the risks.

With that out of the way, our current support policy can always be found at [https://linuxserver.io/supportpolicy](https://linuxserver.io/supportpolicy) and we will make announcements via our usual channels if anything substantial changes.
