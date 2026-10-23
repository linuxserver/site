---
title: Hello MkDocs
date: 2023-10-25T23:50:00Z
author: j0nnymoe
tags:
  - docker
  - documentation
  - readme
  - mkdocs
  - gitbook
hero: ./archive-1850170-1920.jpg
---

As early as 2019, we started centralizing all our documentation for container images, informational snippets, Frequently Asked Questions as well as full-blown user-guides, this has all lived on GitBook. The reason for going with GitBook at the time was simply because of its native ability to build off of a git repo, as well as its hosted nature (yes, we want to spend most of our time creating containers, not maintaining infrastructure). We were also considering Read The Docs and Bookstack for this usecase. The git integration was a killer feature, as it allowed us to implement it as step in our [pipeline project](/blog/2019-02-21-the-lsio-pipeline-project/) to automatically push updated documentation with the same base as the readme.  

As time went on, the LinuxServer team grew. Which as an organization, the skillset also grew. A part of this skillset included various takes on other documentation tools. Since we always want improve, our documentation has also seen multiple iterations. While doing these updates certain pain points arose:
- No ability to easily test changes, other tools we knew for documenting let us spin up a development instance.
	- This caused multiple pushes to master in order to test i.e. GitBook specific markdown syntax. 
- No automatic index generation. For some reason the git integration we depend on does not automatically update the index of pages, meaning that while we push a file for a new container image into the repo, it does not get included on the site.
	- For 3 years, listing the latest containers in the sidebar was a [manual task](https://github.com/linuxserver/docker-documentation/commits/master?before=a75f02127ae30e06001aa32619d908f58dd906ad+35&branch=master&path%5B%5D=SUMMARY.md&qualified_name=refs%2Fheads%2Fmaster), which we automated in [Nov 2022](https://github.com/linuxserver/docker-documentation/pull/63). 
- GitBook also doesn't build pages for markdown-files that are in the repo, but not defined in the index, which means we couldn't publish documentation for "pre-release" containers, which are applications we package despite there being no stable build upstream. 

## Freezing GitBook
The sync from our GitHub repo to GitBook has been disabled for a couple of months, as we have been preparing, improving and testing MkDocs. The freeze has been necessary because we adapted the templates our jenkins-builder generates for MkDocs, and we didn't want the current docs to get formatted weirdly, as the syntaxes differ just enough.

The switch to MkDocs allows us to customize the build-output to our liking, with the knowledge we have within the team. It also resolves all the pain-points listed above.

### Thanks GitBook
We would just like to give a shout out to GitBook and say thank you for providing us with a OSS license.
