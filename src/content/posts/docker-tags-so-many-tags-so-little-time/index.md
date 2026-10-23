---
title: "Docker Tags: So Many Tags, So Little Time"
date: 2023-08-07T11:31:00Z
author: aptalca
tags:
  - linux
  - docker
  - tag
  - image
  - registry
  - GHCR
  - quay
  - gitlab
hero: ./angele-kamp-kaeauitiwnc-unsplash.jpg
---

As an organization, we maintain hundreds of Docker images and with each image having multiple tags and different naming conventions on different registries, things can become confusing. In this article we attempt to untangle that web and clarify how all the images and tags we push relate to each other.

## Table Of Contents:
- [Nomenclature](#nomenclature)
- [Registries Used By Linuxserver.io](#registries-used-by-linuxserver-io)
  - [Docker Hub (docker.io)](#docker-hub-docker-io)
  - [Github Container Registry (ghcr.io)](#github-container-registry-ghcr-io)
  - [Quay](#quay)
  - [GitLab](#gitlab)
  - [Lscr.io (Honorable Mention)](#lscr-io-honorable-mention)
- [Branch Tags](#branch-tags)
- [Manifests](#manifests)
  - [Branch tag (dynamic)](#1-branch-tag-dynamic)
  - [Build tag (static)](#2-build-tag-static)
  - [Version tag (dynamic)](#3-version-tag-dynamic)
  - [Pseudo SemVer tag (dynamic)](#4-pseudo-semver-tag-dynamic)
- [Dev and PR Images and Tags](#dev-and-pr-images-and-tags)
- [SemVer Info](#semver-info)

## Nomenclature
- **Registry:** Docker registry is the location/server where the images are stored. The default registry is `docker.io`.
- **Image tag:** Each docker image is assigned a specific tag. If no tag is defined when pushing or pulling, the default tag `latest` is used. The format is `<registry>/<repo>/<image>:<tag>` (except for Gitlab, which uses the format `<registry>/organization/<repo>/<image>:<tag>`). If `<registry>` is not provided, it defaults to `docker.io`, so attempting to pull `linuxserver/swag` will result in pulling `docker.io/linuxserver/swag:latest`.
- **Manifest:** Docker image manifest contains information on the size, layers and digest of an image. A manifest can also contain a list of these items for multiple images such as a multi-arch image manifest. When issuing a `docker pull`, the image manifest is first retrieved.
- **Dynamic tag:** If a docker image tag is updated or overwritten by newer images over time, it is considered a dynamic image tag. Pulling that tag at different times may result in pulling different images. `lscr.io/linuxserver/swag:latest` tag is a dynamic one and it points to a different image every time a new stable build is pushed. Static tags on the other hand are pushed to the registry once and never updated. Repulling the same static tag at a later time will pull the same image as before. `lscr.io/linuxserver/swag:arm64v8-2.6.0-ls224` is a static tag as it contains the specific build number (`ls224`) and will not get overwritten as the build number will get incremented in the next build and push.

## Registries Used By Linuxserver.io
We push our images to four public registries. There are subtle differences between these registries in how the repos and images are structured and named.

### Docker Hub (docker.io)
Docker.io is the default registry. If the user does not define a registry in a command, docker client automatically adds `docker.io/`. For instance pulling `linuxserver/swag` is the same as pulling `docker.io/linuxserver/swag`

In the beginning of time, Linuxserver.io decided to set up multiple organizations on Docker Hub to host images. There were separate orgs for different arches such as `armhf` and `aarch64`, and there were separate orgs for baseimages and community images. Over time, the secondary arch images were brought under the same orgs as the `amd64` ones through the use of multi-arch manifests and those additional orgs were deprecated. The community org that hosted community provided and maintained images was also deprecated as we realized that the community did not contribute further into support and maintenance of the images, so the handful of existing images under there were moved into the main org and maintenance was taken over by the core team.

The baseimages however remained separate under the org `lsiobase`. The original reasoning for separating out the baseimages to a separate org was that baseimages were not meant for end user consumption, therefore they shouldn't be displayed alongside the images meant for the end user. That logic has since shifted as we are now encouraging of other devs using our baseimages for their projects as outlined in these two articles: [How is Container Formed](/blog/how-is-container-formed/) & [Brand New](/blog/brand-new/).

On Docker Hub, our images are currently hosted under the following orgs:
- Final images: `linuxserver/<container-name>` (ie. `linuxserver/swag`)
- Baseimages: `lsiobase/<baseimage-name>:<distro-version-tag>` (ie. `lsiobase/nginx:3.18`)

### Github Container Registry (ghcr.io)
On ghcr.io, our images are tied to their respective source Github repos. They all share the same naming scheme: `ghcr.io/linuxserver/<image-name>`.

Typically all of our source Github repos for docker images follow the naming scheme `github.com/linuxserver/docker-<image-name>`. To convert that to a docker image address, we can replace `github.com` with `ghcr.io` and drop the `docker-` prepend. For instance, our SWAG source repo is at `github.com/linuxserver/docker-swag` and the images are pushed to `ghcr.io/linuxserver/swag`. Baseimages typically have `baseimage-` in the image name, which is also retained in the pushed image address. For instance, our Alpine baseimage's source Github repo is at `github.com/linuxserver/docker-baseimage-alpine` and the Alpine 3.18 image is pushed to `ghcr.io/linuxserver/baseimage-alpine:3.18`.

### Quay
Quay uses a similar naming scheme as Ghcr, however our organization name on there is `linuxserver.io`. So the naming scheme is `quay.io/linuxserver.io/<image-name>`. SWAG image is pushed to `quay.io/linuxserver.io/swag` and the Alpine 3.18 baseimage is pushed to `quay.io/linuxserver.io/baseimage-alpine:3.18`.

### GitLab
GitLab contains a mirror of all of our source Github repos so the naming convention for the source repos are very similar to Github except our organization name is `linuxserver.io`. The SWAG source repo for instance can be found at `gitlab.com/linuxserver.io/docker-swag`.

The image naming convention at GitLab however is different as GitLab adds another layer by splitting up `repo` into `organization` and `repo` in the image format: `<registry>/<organization>/<repo>/<image>:<tag>`. The naming scheme we use is `registry.gitlab.com/linuxserver.io/docker-<image-name>/<image-name>`. For instance our SWAG image is hosted at `registry.gitlab.com/linuxserver.io/docker-swag/swag` and our Alpine 3.18 image is hosted at `registry.gitlab.com/linuxserver.io/docker-baseimage-alpine/baseimage-alpine:3.18`.

### Lscr.io (Honorable Mention)
`lscr.io` is not an actual registry, but is more of a load-balancer/stats platform/vanity URL. All of our sample docker cli commands and compose yamls in our readmes utilize `lscr.io` as the registry for the reasons explained in [this prior article](/blog/wrap-up-warm-for-the-winter/).

## Branch Tags
The default docker tag is `latest`. When a docker image is attempted to be pulled without defining a tag, such as `docker pull lscr.io/linuxserver/swag`, docker pulls the `latest` tag, so the command effectively becomes `docker pull lscr.io/linuxserver/swag:latest`.
We take advantage of this behavior by pushing the latest stable versions of the upstream apps with the tag `latest`. This is a dynamic tag that is overwritten/updated every time there is a new build of the Github repo's default branch.

Some apps also have development versions that are pushed to tags other than `latest`. For instance, for our [Radarr image](https://github.com/linuxserver/docker-radarr) we publish and maintain three branch tags: `latest`, `develop` and `nightly`. In this case, each branch tag follows a different upstream branch release. In other cases, the `latest` may be the upstream stable releases, whereas the `develop` branch may be commits to upstream's master/main branch. The available branch tags are listed and described in each image's readme under the [Version Tags](https://github.com/linuxserver/docker-radarr#version-tags) header. Like `latest`, these branch tags are also dynamic and get updated when a new build is pushed from their respective branches in our Github repos.

Some apps may not have a stable release yet, in which case we wouldn't push a `latest` tag. Instead, there would be branch tags based on the upstream project's development releases or commits. Our [Readarr image](https://github.com/linuxserver/docker-readarr#version-tags) for instance has `develop` and `nightly` branch tags, but no `latest` tag. If you try to pull `lscr.io/linuxserver/readarr`, you will receive an error: `Error response from daemon: manifest unknown` because that tag (manifest) does not exist. In such cases, you have to define the specific tag you'd like to pull (ie. `docker pull lscr.io/linuxserver/readarr:develop`).

**Important:** Our baseimages do not have `latest` tags as each baseimage is tagged with a distro version such as `3.18` for `Alpine 3.18`, or `jammy` for `Ubuntu Jammy Jellyfish aka 22.04`.

## Manifests
For each build with a branch tag, our CI pushes multiple manifests via [this code snippet](https://github.com/linuxserver/docker-swag/blob/f11a75344586875f8dc5de8131ee23a545fd3cef/Jenkinsfile#L786-L799):

### 1. Branch tag (dynamic):
  - Format: `<branch_tag>` (ie. `latest`, `develop`, etc.) or `<arch>-<branch_tag>`
  - Also contains the arch specific tags with an arch prepend
  - Useful for always pulling the latest version of any branch tag
  - Examples:
      - `lscr.io/linuxserver/swag:latest`
      - `lscr.io/linuxserver/swag:amd64-latest`
      - `lscr.io/linuxserver/swag:arm64v8-latest`

### 2. Build tag (static):
  - Format: `<upstream_version>-<lsio_build_tag>`, `<branch_tag>-<upstream_version>-<lsio_build_tag>` or `<arch>-<branch_tag>-<upstream_version>-<lsio_build_tag>`
  - Also contains the arch specific tags with an arch prepend
  - Useful for always pulling the same static image (reproducibility)
  - Examples:
     - `lscr.io/linuxserver/swag:2.6.0-ls224` or `lscr.io/linuxserver/radarr:nightly-4.7.2.7675-ls481`
     - `lscr.io/linuxserver/swag:amd64-2.6.0-ls224` or `lscr.io/linuxserver/radarr:amd64-nightly-4.7.2.7675-ls481`
     - `lscr.io/linuxserver/swag:arm64v8-2.6.0-ls224` or `lscr.io/linuxserver/radarr:arm64v8-nightly-4.7.2.7675-ls481`

### 3. Version tag (dynamic):
  - Format: `version-<upstream_version>`, `<branch_tag>-version-<upstream_version>` or `<arch>-<branch_tag>-version-<upstream_version>`
  - Also contains the arch specific tags with an arch prepend
  - Useful for pinning the upstream app version but still getting any OS package updates (ie. keeping torrent app on a specific or allow-listed version)
  - Examples:
     - `lscr.io/linuxserver/swag:version-2.6.0` or `lscr.io/linuxserver/radarr:nightly-version-4.7.2.7675`
     - `lscr.io/linuxserver/swag:amd64-version-2.6.0` or `lscr.io/linuxserver/radarr:amd64-nightly-version-4.7.2.7675`
     - `lscr.io/linuxserver/swag:arm64v8-version-2.6.0` or `lscr.io/linuxserver/radarr:arm64v8-nightly-version-4.7.2.7675`

### 4. Pseudo SemVer tag (dynamic):
  - _**Unsupported, unpromoted, strongly recommended against**_
  - Result of an experiment that wasn't successful, but kept in case someone needs to utilize it (at their own risk)
  - Utilizes logic to determine if upstream is using SemVer, and if determined not, this tag is not pushed
  - Please see the [following section](#semver-info) to learn about why upstream SemVer version is not an appropriate tag for our images
  - Format: `<upstream_version>`, `<upstream_version>-<branch_tag>` or `<arch>-<upstream_version>-<branch_tag>`
  - Examples:
     - `lscr.io/linuxserver/swag:2.6.0` or `lscr.io/linuxserver/radarr:4.7.2.7675-nightly`
     - `lscr.io/linuxserver/swag:amd64-2.6.0` or `lscr.io/linuxserver/radarr:amd64-4.7.2.7675-nightly`
     - `lscr.io/linuxserver/swag:arm64v8-2.6.0` or `lscr.io/linuxserver/radarr:arm64v8-4.7.2.7675-nightly`

## Dev and PR Images and Tags
[Our CI, Jenkins](https://ci.linuxserver.io/), also builds and pushes test images for every commit and PR made to our source repos on Github. These test images are pushed to separate image names (and different orgs on Docker Hub). The PRs opened against source repos on Github should contain a message posted by our CI bot with a link to the build test results and the test images as can be [seen here](https://github.com/linuxserver/docker-swag/pull/372#issuecomment-1567594234).

On Docker Hub, commit test builds are pushed to the org `lsiodev` and PR builds are pushed to `lspipepr`. All SWAG PR builds can be found [here](https://hub.docker.com/r/lspipepr/swag/tags).

On Ghcr.io, the test builds are pushed to the same repo but under different image names which follow the convention: `ghcr.io/linuxserver/lsiodev-<image-name>` and `ghcr.io/linuxserver/lspipepr-<image-name>` (ie. `ghcr.io/linuxserver/lspipepr-swag`).

On GitLab, the test builds are pushed to the same org and repo as the stable images, but with a different image name: `registry.gitlab.com/linuxserver.io/docker-<image-name>/lsiodev-<image-name>` and `registry.gitlab.com/linuxserver.io/docker-<image-name>/lspipepr-<image-name>` (ie. `registry.gitlab.com/linuxserver.io/docker-swag/lsiodev-swag`)

On Quay.io, the test builds are pushed to the same repo but under different image names which follow the convention: `quay.io/linuxserver.io/lsiodev-<image-name>` and `quay.io/linuxserver.io/lspipepr-<image-name>` (ie. `quay.io/linuxserver.io/lspipepr-swag`).

All commit test builds use the following convention for the image tags: `[<arch>]-[<branch_tag>]-<upstream_version>-pkg-<package-sha>-dev-<commit-sha>`
All PR test builds use the following convention for the image tags: `[<arch>]-[<branch_tag>]-<upstream_version>-pkg-<package-sha>-dev-<commit-sha>-pr-<PR-number>`

## SemVer Info
First and foremost, we do not support, advertise/promote or recommend SemVer tags for our images. We also do not support or recommend using SemVer only based update mechanisms such as Renovate.

We believe SemVer is a valuable tool for upstream projects. However, SemVer works when the versioning refers to the distributed product as a whole. An upstream project releasing a binary with a SemVer version is great. But that's not what we do. We publish a docker image that has various components added to the upstream project's release. These include an entire operating system (OS) with lots of OS packages and dependencies, various init and service files, and an environment created via our Dockerfile build instructions. If we simply applied the upstream project's SemVer version to our docker image, it would be highly inaccurate because none of those added components would be reflected in the versioning. Changes to any one of those components could potentially be breaking for the end user, but the SemVer version would be unaffected by those changes, which makes using only the upstream project's SemVer version to tag our docker images a very very bad idea.

Imagine a scenario where the upstream project releases a minor update, and that coincides with lots of structural changes we implement in our Dockerfile. The SemVer only version would suggest the update is a minor one, when in reality the structural changes may be breaking. It gives the user a false sense of security and worse, an update (perhaps an automated one) would result in a broken setup unexpectedly.

That's why our static docker images are tagged with not only the upstream version (whether SemVer or not), but also our build tag, which makes it unique. We recommend checking the readme changelog before updating, and making versioned backups so one can roll back to the previous state of both the persistent data and the specific docker image used. [A prior article](/blog/2019-10-01-updating-and-backing-up-docker-containers-with-version-control/) outlines a method for creating versioned backups so the user can restore an exact replica of the setup after a failed update.

We also do not delete older tags (in some cases we are not even able to due to registry restrictions). We have received requests in the past from folks who would like to utilize solutions such as Renovate and they noticed Renovate would sometimes suggest updates to a very old tag because it seemed like a newer SemVer tag. As mentioned above, we do not support SemVer tags or Renovate, and we do not delete older tags.
