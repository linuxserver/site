---
title: New and Improved For 2025
date: 2024-12-16T15:00:00Z
author: Spad
tags:
  - docker
  - news
  - linuxserver
  - sbom
  - slsa
hero: ./fireworks-11jgoisgc7.jpg
---

As we approach the end of the year we thought we would take the opportunity to take a look back at some of the things we've achieved in 2024 and how they benefit you now and in 2025. A lot of the changes we make to our pipelines and images take a while to actually reach end users, both because of the time it takes for us to roll them out across our fleet and because some users don't regularly update their containers. So, what have we done and what does it mean for you? Well:

### Images

#### Software Bill of Materials

[Software Bill of Materials (SBOM) Attestations for Docker images](https://docs.docker.com/build/metadata/attestations/sbom/) describe what software artifacts an image contains, and artifacts used to create the image. We have for a long time published a package_versions.txt file in each image repo listing all the software included as part of the container, but it was hard for users to know for sure that it was an accurate reflection of the actual image, or to validate it for older images they might be using.

Now that we're publishing SBOM attestations as part of the images, you can view them for any image tag going forward by doing something like `docker buildx imagetools inspect lscr.io/linuxserver/plex:latest --format '{{ json (index .SBOM "linux/amd64").SPDX }}`, adjusting the architecture to match yours. If you're pulling an arch-specific tag you can instead do something like `docker buildx imagetools inspect lscr.io/linuxserver/socket-proxy:arm64v8-latest --format '{{ json .SBOM.SPDX }}'`. You can then use a tool like Syft to convert the SPDX JSON manifest into something more human-readable e.g. `syft convert SBOM.json -o table=./package_versions.txt`.

Please note there are a few images that cannot currently support SBOM attestation but we're working to get them into a position where they can.

#### Provenance

In a similar vein, [Provenance Attestations for Docker images](https://docs.docker.com/build/metadata/attestations/slsa-provenance/) include facts about the build process, allowing you to see exactly how and when they were built. Again, we already made a lot of this public via our [CI](https://ci.linuxserver.io/) but it was hard to link a specific build run to any given image you might be using.

In the same way as the SBOM attestations you can view Provenance details for any image tag going forward by doing something like `docker buildx imagetools inspect lscr.io/linuxserver/plex:latest --format '{{ json (index .Provenance "linux/amd64").SLSA }}'`, with a similar adjustment for arch-specific tags. Unfortunately we're not aware of any good tools to produce a nice human-readable output for SLSA.

Please note there are a few images that cannot currently support Provenance attestation but we're working to get them into a position where they can.

#### Read-Only

Providing [Read Only running of our containers](https://docs.linuxserver.io/misc/read-only) has involved a steep learning curve. It's amazing just how much stuff expects to be able to write to the container filesystem and doesn't provide you any practical way to redirect it. At time of writing, after testing nearly 200 images, and making quite a few modifications to how we handling their init processes, 35 of our images support running read only.

This number will probably increase over time as we find new ways to handle troublesome applications, but it's never going to be possible for everything. Check the image readmes for up to date information.

#### Non-Root

[Running our containers as a non-root user](https://docs.linuxserver.io/misc/non-root) has been a persistent request for a long time, but hasn't been practical until now due to a number of limiting factors. Even now it won't be a universal feature for similar reasons to the read only functionality above, and has taken a lot longer to figure out due to substantial changes needing to be made to each container's init process to enable it. We're still in the process of updating images to support this so don't expect it overnight. Perhaps this will finally silence the people who don't understand the difference between non-root and rootless, but somehow I doubt it.

### Documentation

#### Init Diagrams

The [docs page](https://docs.linuxserver.io/images/docker-faster-whisper/#building-locally) for each image now includes a [d2](https://d2lang.com) diagram documenting the init steps it follows. I'll be honest, this isn't a lot of use to most people outside of idle curiosity, but if you're someone who uses our images as a base for your own, or develops mods for our images, then it will hopefully help you to have a much better understanding of how they work under the hood.

We have also [published the image](https://github.com/linuxserver/docker-d2-builder) we use to generate the diagrams, but it's very much designed for our images, so don't expect it to work for anything else - even if it uses our base images - without a bunch of changes being made.

#### CI Test Links

We run CI smoke tests for the bulk of our images at the end of every build to make sure that they start up correctly. Previously we published links to these tests for PRs to make them easy to find, but not for the actual live releases. This meant you had to dig through our CI logs, or Discord #builds channel, to track them down. We now include a link to the CI test results for each release so that you can easily view them, e.g. [https://github.com/linuxserver/docker-plex/releases/tag/1.41.2.9200-c6bbc1b53-ls245](https://github.com/linuxserver/docker-plex/releases/tag/1.41.2.9200-c6bbc1b53-ls245), which links to [https://ci-tests.linuxserver.io/linuxserver/plex/1.41.2.9200-c6bbc1b53-ls245/index.html](https://ci-tests.linuxserver.io/linuxserver/plex/1.41.2.9200-c6bbc1b53-ls245/index.html). If there isn't a CI test available (because, for example, the image requires external resources such as databases in order to start up successfully) then it will be listed as N/A.

Please note that for cost reasons CI test results are only stored for 120 days.

#### Kasm Security

In 2024 we saw a spike in reported issues with users exposing their KasmVNC-based containers to the internet without authentication and ending up with them getting compromised, usually with an xmrig miner. To try and mitigate this we [published guidance](https://info.linuxserver.io/issues/2024-10-06-securing-kasm/) on properly securing them before exposing anything to the internet, which has been added to the readme and documentation pages for all KasmVNC-based images. We can't stop users doing dangerous things, but we can at least ensure that they're informed about the risks before they do them.

### Other

#### Commit Signing

This year we also set up long-overdue [git commit signing](https://info.linuxserver.io/issues/2024-08-18-commit-signing/) for our CI account, ensuring that you can now verify that all commits to our repos by our CI account were, in fact, authored by us and that any commits to other random repos, were not. We're in the process of getting all of the individuals who commit to repos set up to sign their commits, but there are some barriers to that we need to work around.

Additionally, due to limitations in the way that Github enforces it, we can't *require* commit signing across our repos as it would prevent any 3rd party submitting a PR that included unsigned commits.

#### QEMU

For a long time our documentation has directed users who wish to use QEMU to build our images cross-platform to the `multiarch/qemu-user-static` Docker image. The problem is that the image hasn't been updated in nearly 2 years now and as a result stopped working on newer systems.

To solve this problem, we created [our own version of the image](https://github.com/linuxserver/docker-qemu-static), which is automatically updated by our build pipeline *and* supports arm64, so in addition to cross-building arm images on amd64 hardware, if you happen to have arm hardware you can use it to cross-build amd64 images as well.

#### Socket Proxy

Equally, for a while we have recommended that users do not directly expose the Docker socket to containers that demand it, instead using a socket proxy. The defacto solution was `tecnativa/docker-socket-proxy` but again we ran into problems; the image wasn't properly maintained and the PRs they accepted from 3rd parties kept breaking things, so we made [our own version](https://github.com/linuxserver/docker-socket-proxy/) instead. This way we're no longer recommending that our users adopt an image that isn't being regularly patched and could break when it is; if it does break it's our own fault.

### Onward to Next Year

We can't predict what's going to happen over the next 12 months, if we could we'd be maintaining all these images from our own private island, but rest assured that we'll keep finding ways to improve the images we publish because we love you all so much. All we ask in return is that you don't turn up in our Github issues and act like a dick, which seems like a reasonable trade.
