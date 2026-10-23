---
title: The LSIO Pipeline Project
date: 2019-02-22T01:58:00Z
author: IronicBadger
hero: ./featured.jpg
---

Over the past year we have been working to modernize our Jenkins build environment and shift as much of our build logic to Git as possible vs locked up in Jenkins Build definitions only accessible to admins. As of today we can now say that these changes have been applied to our catalog of Docker containers.

During this window we have implemented five important changes to our repos that effect our users and community of developers:

- Manifested Dockerhub entries allowing users to pull a latest tag across x86_64, armhf, or aarch64.
- Templated eventually consistent Documentation and build logic
- New versions being built as soon as possible with constant pings out to external software sources
- Human readable version tagging in both Github and Dockerhub
- Deprecation of our dedicated arm repos with all logic contained in the main repository for a project

For an in depth technical overview of these changes please review our own internal documentation here:
[https://github.com/linuxserver/pipeline-triggers](https://github.com/linuxserver/pipeline-triggers)

The new build logic uses Jenkins Declarative pipeline syntax, more about that here:
[https://jenkins.io/doc/book/pipeline/syntax/#declarative-pipeline](https://jenkins.io/doc/book/pipeline/syntax/#declarative-pipeline)

## Users

### Multiple Architectures just one tag

For consumption of our images, our hope is that multi arch manifests help lower the barrier to entry. Docker command examples that work on x86_64 hosts should produce identical results on other platforms in the majority of cases. The tags we push for a release will have individual tags for each arch and two meta tags. Lets take a look at an example below for a single build:

linuxserver/sonarr:latest - Meta Tag containing the following real tags:

- linuxserver/sonarr:amd64-latest
- linuxserver/sonarr:arm32v6-latest 
- linuxserver/sonarr:arm64v8-latest

linuxserver/sonarr:2.0.0.5301-ls3 - Meta Tag containing the following real tags:

- linuxserver/sonarr:amd64-2.0.0.5301-ls3
- linuxserver/sonarr:arm32v6-2.0.0.5301-ls3
- linuxserver/sonarr:arm64v8-2.0.0.5301-ls3  

Here pulling `latest` or `2.0.0.5301-ls3` will yield the same results when they are in sync. It is important to remember that latest will be constantly updated, and to only use that tag if that is your goal.

### The great :latest debate, now you have a choice

Even in our own command examples in our READMEs we default to showing a blank tag which will pull the latest container when the command is run. For the vast majority of users this is fine and particularly good if you want to consistently update this container for projects in heavy development.

We do also deal with many support requests here as an organization, and honestly it is a large part of our development team's bandwidth. We would like to implore our power users and particularly users depending on these containers to run vital infrastructure to start using specifically versioned tags. If `linuxserver/sonarr:2.0.0.5301-ls3` from the example above works for you and does everything you need it to, use that tag and stick with it. Sonarr is not the best example, but we have a wide variety of containers some of them with enterprise grade network software tools. In essence, with these tags now available in a human readable format you might want to consider the "if it ain't broke don't fix it approach" to container upgrades.

## Developers

We do not hide any of our code, and we actively promote any user that is capable of creating a pull request to fix a problem to do so. With this new logic in place a couple of key things to keep in mind are:

- Build logic and Documentation is now templated from YAML files in the repository, changes directly to them without modifying the source of information parsed into the template will have no effect on the resulting file
- All Dockerfiles are now in the same repository, modifications to the build logic need to be reflected across all three arches when possible

### File templating

One of the most common pull requests we get is for README updates to either fix typos or update usage docs. A pull request against just the README.md file will not be accepted without modification and in the end just causes more work for us.
In all repositories you will find a readme-vars.yml file that contains the information we use to build our documentation. Below is an example for docker-nginx:

[https://github.com/linuxserver/docker-nginx/blob/master/readme-vars.yml](https://github.com/linuxserver/docker-nginx/blob/master/readme-vars.yml)

When requesting changes to the repository please make the changes to this file and not the destination file README.md. If complex changes are needed that our templating does not currently support please point your attention to the source template found here: ( don't forget we are here to help )

[https://github.com/linuxserver/doc-builder](https://github.com/linuxserver/doc-builder)

### One repo many Dockerfiles

In all of our repos that support arm you will see three dockerfiles:

- Dockerfile- default x86_64 for building local using `docker build -t <imagename> .`
- Dockerfile.armhf- Armhf build logic
- Dockerfile.aarch64- Arm64 build logic

When making changes to Dockerfiles we highly recommend you test all three builds locally as a basic smoke test. This can be achieved with the use of Qemu binaries on an x86 system following the logic below:

    docker run --rm --privileged multiarch/qemu-user-static:register --reset
    curl https://lsio-ci.ams3.digitaloceanspaces.com/qemu-arm-static -o qemu-arm-static
    curl https://lsio-ci.ams3.digitaloceanspaces.com/qemu-aarch64-static -o qemu-aarch64-static
    chmod +x qemu-*
    docker build -f Dockerfile.aarch64 -t testarm64 .
    docker build -f Dockerfile.armhf -t testarm .
    

As a side note, if you ever have the need to test an arm variant on an x86_64 host we bake the qemu binaries into all of our arm images now to facilitate this, before using an arm tag on your Docker host you simply need to run:

    docker run --rm --privileged multiarch/qemu-user-static:register --reset
    

Qemu is certainly not perfect and seems to specifically have issues with GoLang and Java, but in a pinch it may help you debug an Arm specific issue.

### Application developers

For everyone that makes the software we wrap in Docker containers we have done our best to ingest your software from a reliable endpoint including versioning information.
If you feel we could be doing a better job representing your software or version tags/metadata please hop on our Discord and reach out to any team member:

[https://discord.gg/YWrKVTn](https://discord.gg/YWrKVTn)

We look forward to working with you.
