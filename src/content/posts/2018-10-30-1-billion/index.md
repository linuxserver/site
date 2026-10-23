---
title: 1 Billion
date: 2018-10-30T14:22:00Z
author: IronicBadger
tags:
  - news
  - docker
hero: ./featured.jpg
---

I am absolutely delighted to announce that Linuxserver.io just passed 1 billion total pulls from Docker Hub.

Whilst somewhat of an inexact science a 'pull' represents a docker compatible client querying to the Docker Hub API for one of our containers. Even if we accept that it's a horrendously unreliable way of measuring how many users Linuxserver.io (LSIO) has, it's still a quite frankly astonishing number. Even if only 1% of this number is active today, that's amazing.

> Thank you.

The thanks don't end with the users though. Of course the wonderful [Linuxserver team](https://www.linuxserver.io/team) must take some credit. I'd like to take some time to personally thank a few guys that have been here a while and contributed significantly. But first, a little history about myself and the site if you'll allow me the indulgence.

## The beginning

Linuxserver.io was first registered in October 2014. J0nnymoe, lonix and I met via unRAID sometime in 2013. At the time and I'd been dabbling in GPU passthrough and documenting my adventures with Linux. This was *years* before that Linus Tech Tips "7 gamers 1 cpu" video made the techonology 'mainstream for nerds'. Back then, I thought Docker was stupid and another needless flash in the pan. I'd left my job as a Genius at the Apple store to undertake an MSc in Computer Science before landing a job as a Python developer for a startup. During my MSc year Lonix kept pestering me about Docker and I kept ignoring him. VMs were the future.

In around March of 2014, when I was procrastinating instead of writing my dissertation, I gave Docker a try and found the learning curve steep but manageable. Docker wasn't 1.0 yet and a lot of the tooling around it was changing rapidly (yes even more rapidly than now!). I had a few containers set up from Docker hub on my server and a few that Lonix and I hacked together. The light bulb moment for me with Docker was when I reinstalled my server (something I did frequently back then as I was a poor student and my server was also my lab), installed Docker and had my apps back up and running in only a few minutes thanks to docker volumes. That was it for me. I've been hooked and an absolutely huge containerisation nerd ever since.

It was clear to Lonix, J0nnymoe and I that the containers floating around on Docker Hub at the time sucked. They had poor quality or just straight up zero documentation, were uploaded and never patched, couldn't handle volume permissions properly and had no standards (as in, they were all made by random people "their way"). We saw an opportunity to change that and in October 2014 we morphed my personal blog ([blog.ktz.me](https://blog.ktz.me)) into Linuxserver.io and began creating a few containers based around the Linuxserver philosophy.

- Freedom respecting and open source (FOSS philosophy)
- A standardised base image
- The best documentation for all skill levels
- Auto updates on container startup
- Frequently patched and updated
- Simple user volume permission management (PUID & PGID)
- A team of people for support
- No tracking or end user monitoring ("call homes")

As our container 'fleet' grew so did our pull count. I distinctly remember being absolutely floored when our Plex container broke 10,000 pulls, then 100,000, then 1,000,000, then 10,000,000 and now it sits at 47 million alone! The team grew with the addition of Sparklyballs and CHBMB along with a few others from different time zones. Originally the site was my blog as you know which constitued articles from me on whatever I found interesting that month. I still write occasional articles with the '[perfect media server](https://blog.linuxserver.io/2017/06/24/the-perfect-media-server-2017/)' series being a very popular article to this day over on our [blog](https://blog.linuxserver.io).

We're probably at some point in mid 2015 now and had assembled a core team of around 10 volunteers or so working on Dockerising, supporting and documenting everything Linuxserver does. We've moved through IRC, Slack and now to Discord which breeds a great sense of community. The team now represents half a dozen countries, several different professions (not all IT!) and is my happy place. Thanks guys, you absolutely rock.

> A full list of our available containers is [here](https://www.linuxserver.io/our-images)

A real feather in our cap came a few months ago when Plex approached us to use our container as the basis for their officially sanctioned one. We used Slack at the time and they joined us there for a few months whilst we worked together on that. Since then we have been approached by countless other open source projects to containerise their applications under the LSIO "brand".

I'd like to take this opportunity to single out Sparklyballs and CHBMB. After Lonix left the team Sparkly became, I suspect, one of the leading experts on application containerisation in the world. I would frequently drop in the chat that I felt like trying "this app" or "that app" in a container and in the hour it took me to get home I'd often find a completed Dockerfile ready to go. He has relentlessly improved, tweaked and worked on these containers for more hours than some of us work whilst being paid in a normal week.

CHBMB on the other hand is the kindest hearted guy on the team. You never need to ask for help from him, it's always there before you know you need it. Technical or personal. His work on the DVB kernels for unRAID has been invaluable to many I know and I think I speak for everyone on the LSIO team when I say a big thank you to them both for their past and continued hard work. CHBMB might also be king of the "harsh but fair" put down.

A quick note to also thank Stark for his hard work on the website as you see it now which underwent a significant redesign earlier this year.

Another vital team member is aptalca who was the leading creative force on our wonderfully simple to use `nginx letsencrypt` container.

Kode, fanart.tv founder, has outdone himself with the creation of Heimdall recently. It's quickly become the go to dashboard for many of us who run multiple apps on a NAS or similar.

A huge thanks to J0nnymoe for sticking around so long and putting up with us all. He's like the glue of the team, really a top chap.

Put simply, this a group of humans - some of whom I've never met in real life - that I'm very fond of. For a full list of team members check out the team page on the Linuxserver.io site. Serial tinkerers, hackers and nerds they are awesome.

## The future

What does the future hold for Linuxserver? More of the same really. The team is growing at a nice pace and I ALWAYS get a huge kick out of seeing our name on r/docker or wherever. Nowadays I work for Red Hat IBM as an Openshift guy and still use dozens of our containers every day at home to supply my friends and family with secure document storage, backups, media and more. We have a few newer team members lately bringing with them strong Devops principles, skill-sets and knowledge in *TheLamer* and *hackerman*.

We're in the midst of automating a bunch of our more manual processes such as documentation generation [here](https://github.com/linuxserver/doc-builder). A new CI pipeline is in the works which should improve our ability to release containers whenever an upstream patch is detected within minutes, not once a week as currently happens.

The [forums](https://discourse.linuxserver.io/) and Discord are undergoing a redesign courtesy of Homer and J0nnymoe. More on that in future posts on this blog.

The podcast keeps threatening to revive itself. I just emigrated from London to Raleigh, NC (coincidentally near to hackerman) and we will be making an effort to revive the podcast over the coming weeks / months. Let us know in the comments any topics you'd like us to specifically cover.

We also now have [merch on the redbubble site](https://www.redbubble.com/shop/linuxserver?search_type=search_box). LSIO is a non profit organisation and 100% of the profits made will go back into the Linuxserver project towards hosting costs or be repatriated upstream to other FOSS projects.

We're *always* looking for contributors. If you think you could then let us know!

If our funding allows I hope that the team can have a presence at a conference or two this year Stateside or in Europe - we have an equal split of members so we'll see. Comment down below on your preference!

I owe a lot of my personal journey to this site and those on the team and to them I am extremely grateful. This site is a true showcase for the power of FOSS of which I am immensely proud. Freedom and Open Source values are at the core of our values here and will always remain so. Here's to the team, the users and the future!
