---
title: The Problem with Docker - no wait, Moby...
date: 2017-04-24T23:25:00Z
author: IronicBadger
hero: ./featured.png
---

Last week at [Dockercon17](http://2017.dockercon.com/) Docker unleashed [Moby](https://mobyproject.org/) onto the world. This announcement divided opinion and, as expected from Docker Inc. these days, was pretty much a PR [disaster](https://news.ycombinator.com/item?id=14156954). When your founder has to take to [Twitter](https://twitter.com/solomonstre/status/855918630915133440) several days later with a hand drawn diagram you know you've screwed up.

> The [@moby](https://twitter.com/moby) Project in a nutshell: inside and outside. [pic.twitter.com/K8Rn9YYtVs](https://t.co/K8Rn9YYtVs)
> &mdash; Solomon Hykes (@solomonstre) [22 April 2017](https://twitter.com/solomonstre/status/855918630915133440)

### ELI5 - WTF is going on?

Solomon Hykes, the founder and CTO of Docker Inc, last week renamed the core open source component formerly known as `docker` to `moby`. The supposed goal of this radical renaming is to split the docker repo into a modular component based approach. This goal is actually laudable and largely positive in my view. Think of the split thus:

- `moby` = fedora - the open source project where dev occurs
- `docker CE` = centos - the 'reference' assembly of components from the moby repo
- `docker EE` = RHEL - the enterprise version, here be dragons

My biggest concern here is that Docker EE will eventually bear little resemblance to its upstream cousin(s). Docker hardly have a great track record with managing the community.

So, what will change? It's likely we'll see a bunch of new clients meaning you might not be typing `docker run` much longer. The Github repo `docker/docker` is already no more, renamed to `moby/moby`. Besides this, Docker maintain there will be no other fundamental changes to the user experience - for now. We'll see, I guess.

The renaming of Docker to Moby seemingly happened overnight via a [pull request](https://github.com/moby/moby/pull/32691) on Github. The reasons *why* a change of such magnitude were required are as yet, unclear to me. Presumably it has something to do with Docker Inc. wanting to maintain the mind share of the brand but how does renaming the open source bit of your project help with that?

I've followed Docker closely for the past [3 years](https://forum.linuxserver.io/thread-70-post-719.html#pid719) or so and in that time the project has grown beyond its humble roots into *the* container runtime. And yet, I still have no idea where Docker is headed as a company. I suppose it's to be expected that any new project which gains as much success as Docker so quickly, so easily is going to make some pretty hefty mistakes along the way. All too often though, I'm left scratching my head when they announce stuff instead of "oh, that's so cool!".

Thankfully, API breaking, feature deprecating and downright confusing updates seem to have largely calmed down lately but [others](https://thehftguy.com/2016/11/01/docker-in-production-an-history-of-failure/), myself included, are nervous of relying on 'just' Docker in production deployments. The community around Kubernetes is testament to this and is built in a modular way, allowing the core container engine to be replaced by another suitable candidate at any time. Docker could stop wasting time on Swarm and support Kubernetes thereby reducing fragmentation and increasing innovation in one fell swoop.

I suspect this is true motivation for the changes from Docker / Moby this week. Keep the core container engine relevant by separating it from commercial interests (you're not fooling anyone here Solomon Hykes) so that the critical community mass around it remains to maintain the crushing lead in the marketplace. This is of course entirely speculation.

I wonder what this move really means for the future of the Docker (Moby) project, I do not mean Docker, Inc. - the single worst thing that happened to Docker was accepting that sweet VC (venture capital) money. Since the VC, Docker have understandably been on the path to monetise. They've been creating a platform or ecosystem or universal software distribution method or whatever they feel like this week (Swarm, Compose, DTR, UCP - no I mean DDC, etc). Don't get me started on the mess that is Docker Hub, no wait Store. Docker do love rebranding stuff don't they? Some of these tools *are* legitimately useful, but there's a lot of noise and a lack of focus.

I suspect companies like Red Hat who have built Docker into the core of their future strategies such as Openshift will look to fork the project ASAP or replace it completely with something less irrational or immature. Largely I see this as a positive move as hopefully it will lead to less cock-blocking by Docker of the engine. There are many examples of submitted patches and [PRs](https://github.com/moby/moby/pull/5001) that don't fit into the narrative of Docker Inc. which fix production issues from companies such as Red Hat that remain unmerged or deprecating features in face of widespread user protest, despite this being detrimental to overall health of the project.

All in all, it's a decent move but poorly executed. Docker had to find a way to stay relevant when in reality, all they have to sell is a commodity built into every Linux kernel for years. They are trying to sell water to a community with a natural spring. By monetising the ecosystem around Docker (selling the cups and the buckets) they stand a decent chance of staying relevant without wasting all the work they've done on porting Docker to Windows and Mac. It's possible that this is their own death warrant but it's too early to tell. What if someone comes along and builds a better docker from the moby components? Only time will tell.
