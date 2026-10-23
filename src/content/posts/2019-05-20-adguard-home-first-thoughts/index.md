---
title: "AdGuard Home: First Thoughts"
date: 2019-05-20T22:05:00Z
author: Josh Stark
tags:
  - adguard
  - opinion
  - dns
hero: ./featured.png
---

While many members of the LinuxServer.io team currently use [PiHole](https://pi-hole.net/) for their ad-blocking needs, I was relatively late to the game having never used a network-level DNS blocker. Like most people (I assume), I stuck to browser plugins like AdBlock Plus and uBlock Origin. However, after having spotted some discussion on our Discord server—and coincidentally during our [rebooted podcast](https://anchor.fm/linuxserverio/episodes/Episode-005---Reborn-e42009/a-af6210)—about a new player on the field, I decided to give AdGuard Home a go.

### So, what is AdGuard Home?

It's a self-hosted variant of AdGuard's own [subscription DNS service](https://adguard.com/en/welcome.html).

In short, AdGuard Home is much like your run-of-the-mill browser ad blocker, but rather than being a plug-in on your favourite web browser, AdGuard Home is a fully-fledged server application which runs on a separate machine somewhere on your network (or perhaps even on a VPS you own). Its primary goal is to provide your network with a mechanism to actively block certain requests that websites you visit make – in this case, requests for adverts, malware, or various other malicious things.

### How does AdGuard Home actually work?

If you know how DNS works, you may skip this part, but as a quick refresher...

To understand how AdGuard Home works, you should first understand how your devices make requests out of your network to the internet. Whenever you navigate to a website using its domain name (https://www.linuxserver.io, for example), your device needs to know which IP address that domain refers to so it can load its content. In order to determine this IP address, it makes a DNS ([domain name system](https://en.wikipedia.org/wiki/Domain_Name_System)) query to a DNS nameserver which will respond with a DNS record for that domain, containing its IP address (and usually some other information). This is known as DNS resolution. *Every request for a website requires this look-up*.

But how do your devices *know* which DNS servers to call for each request? Well, that's generally DHCP's job. Whenever your device connects to your home network (or any network, really) your router's DHCP service will provide your device with a lease on an IP address. With that lease, it also provides your device with the DNS nameservers that it should be using. It is entirely possible to override this on the device, but for the most part people won't do this.

There are thousands of DNS servers out there, but the most common ones people will likely use are Google's public DNS servers (8.8.8.8 and 8.8.4.4) or CloudFlare's (1.1.1.1 and 1.0.0.1). Some ISPs will configure their routers to make DNS queries to their own DNS servers.

So, back to AdGuard Home... When you're running it on your network, you can configure your router's DHCP service to tell all network clients to use *AdGuard Home's IP address* as the DNS nameserver instead. By doing this, AdGuard Home now has carte blanche to decide which DNS queries are allowed and – more importantly – which one's aren't.

AdGuard Home is effectively a DNS proxy, whereby it acts as your network's primary DNS nameserver, filters requests, then relays the requests that satisfy its filters to an "upstream" DNS nameserver, which does the real DNS resolution.

### Why use AdGuard Home?

Network-level ad blockers provide a greater benefit when compared to a device-specific ad blocker because you are able to create blanket rules for *all* devices on your network, making such configuration much simpler. Another boon for this is that web pages which attempt to detect ad blockers (and then block the content until you turn the blocker off) won't know you're blocking their ads, as the content rejection is occurring elsewhere.

### Block-list management

Like all ad blockers, AdGuard Home contains a list of known advertising, tracker or malicious domain names which it uses as a lookup table whenever a DNS query is made. If the query matches one of the known *block* rules, it will refuse to resolve the IP address for that query, thus stopping that URL from loading altogether. At the heart of it, that's how ad blocking works – AdGuard Home just does it at a different stage in the request's life.

AdGuard Home's block-list management page is very easy to configure and comes with a few pre-loaded lists which you can enable (or disable) depending on your own personal preferences. Much like PiHole, it lets you add your own lists (either by other providers or tailored by yourself), which I appreciated as it allowed me to add the same lists that the other LSIO guys were using. These lists take the form of a hosts record, or a set of [domain filters](https://kb.adguard.com/en/general/how-to-create-your-own-ad-filters#examples).
![](/content/images/2019/05/chrome_2019-05-17_19-58-30.png)
One issue I did come across was loading in lists directly from an S3 bucket. It appears that part of the request failed which AdGuard Home deemed bad enough to think the list was not available. Upon further inspection of the URL ([https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt](https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt)), it shows that the favicon request was returning a 403, which AdGuard Home misread as a whole-request failure.
![](/content/images/2019/05/chrome_2019-05-19_11-07-19.png)Response when attempting to load in S3 URL
Thankfully I have a B2 account, so created a public bucket and uploaded a mirror of the list and used that instead. At this point, which lists you decide to load in is entirely up to you. The default [AdGuard Simplified Domain Names Filter](https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt) contains a wealth of filters which for the most part will suffice.

### Query Logs

There is also a very neat log page which lets you view the most recent DNS queries across your network, and which ones have been blocked. This can be a rather helpful tool to decide if AdGuard Home is allowing requests through which you think should have been blocked. These can be blocked on an ad-hoc basis, which is a nice touch. In doing this, AdGuard Home will create a custom filtering rule (separate from the loaded lists).
![](/content/images/2019/05/chrome_2019-05-17_19-58-20.png)Yes, we have a PoGo'er in my household... And yes, they have a dedicated phone just for it.
### Safe Search and Parental Control

While I can't speak for the likes of PiHole, one rather neat feature that AdGuard Home provides is a way to enable search engine filtering, plus parental control. This is a nice touch as it gives an even wider level of filtering not provided by just a bare-bones ad blocker, which I imagine may give parents more peace of mind that any unsavoury material is being blocked from their kids.
![](/content/images/2019/05/chrome_2019-05-19_14-18-16.png)AdGuard Home will replace the response of a blocked site with its own warning page
One thing I observed when testing the parental controls is that if you are navigating to a site over HTTPS, the response from AdGuard Home will cause the web browser to flag it up as being insecure. This makes sense as the response is coming back over HTTP. The overall response is a nice touch and mirrors other common browser plugins provided by popular anti virus products.

Enabling safe search did prove to be a bit troublesome, as AdGuard Home forces searches to be redirected to *forcesafesearch.google.com *(for Google, or *safe.duckduckgo.com* for DuckDuckGo) which could not be resolved. I honestly don't know why this happened, but it appears others have had similar issues with this particular redirection. I was able to rectify this by manually adding a line to the hosts file that AdGuard is using to resolve client names. This is likely an issue with my own configuration and setup of AdGuard Home though (I'm running it inside a bridged Docker container).

### AdGuard Home in action

It's all good and well having a nice UI and an easy enough way to manage its behaviours, but how does AdGuard Home actually perform? My answer: not bad. It became immediately obvious that some ad-laden pages were a lot "quieter", with a greater smattering of white space compared to before. Just look at an article on the Forbes website:
![](/content/images/2019/05/chrome_2019-05-19_11-24-10.png)Before enabling AdGuard Home![](/content/images/2019/05/chrome_2019-05-19_11-25-43.png)After enabling AdGuard Home
Those used to having a browser ad blocker enabled won't be too shocked by this – that's what ad blockers are supposed to do, so this isn't much different. However the result here is effectively the same but without the need for a browser ad blocker. One mild difference is that AdGuard Home won't remove any placeholder elements on the page (unlike browser add-ons which have access to the page's document model).

### Latency and load times

For the most part, I genuinely can't tell the difference with load times when comparing a "direct" DNS query and one through AdGuard Home. Naturally there is going to be a level of latency as each request is being proxied, but it's rather negligible. One metric I am glad to see in the dashboard is the "Average processing time" value which informs me how long AdGuard Home takes on average to respond to a DNS query.
![](/content/images/2019/05/chrome_2019-05-19_11-58-48.png)
I suspect this should be taken with a pinch of salt, especially considering it's an average (I have no idea if outliers are omitted, but it's unlikely). 127ms is a considerably long time.

I ran a generalised DNS benchmark, comparing my instance of AdGuard Home against the more popular DNS providers, and it performed admirably.
![](/content/images/2019/05/DNSBench_2019-05-19_12-06-26.png)
Compared to CloudFlare's *1.0.0.1, *AdGuard Home's rule lookup added a negligible amount of extra time on un-cached lookups, but provided a huge speed up when querying against its own cache.

How long a web page takes to load is entirely up to how that page attempts to load its resources. I have found that a few websites "hang" when attempting to load their adverts. The most prominent example of this is The Verge's website, which shows a black screen for around 3 seconds before all of the content (sans adverts) is correctly loaded. I can't fault AdGuard Home for this as it appears the JavaScript being executed to load the page's content is aggressively attempting to load the adverts, which may or may not be closely tied to the overall content of the page. I've not experienced this with the majority of the other websites I visit.

What may be nice to have as a feature in AdGuard Home, which I don't believe is currently present, is to have it respond with an empty payload, rather than just flat out rejecting/blocking the request. It seems that some sites behave differently when this content can't be resolved.

Compare the errors when using AdGuard Home:
![](/content/images/2019/05/chrome_2019-05-19_12-25-02-2.png)Queries routed through AdGuard Home are left unresolved.
And using uBlock Origin in the browser:
![](/content/images/2019/05/chrome_2019-05-19_12-25-30-2.png)Queries are blocked by uBlock Origin, returning a different error
It is these subtle differences in how AdGuard Home behaves when compared to more traditional ad blockers which may or may not affect your browsing experience. As I mentioned, this only appears to have affected a handful of sites, but your mileage may vary.

### In conclusion...

Despite being an early release, AdGuard Home has proven to be a real benefit on my network in blocking unwanted content on the websites I visit. It has also provided a way for my wife to play her free-to-play iPad games without annoying adverts between each round. General performance is within an acceptable level, with no humanly noticeable difference in page load times (with the exception of what was mentioned above). 

The dashboard metrics provide an incredibly tidy view to see which are the common repeat offenders, and which devices are getting their share of blocked requests. The filter management page is easy to use, and each list gets synchronised regularly, which is handy. It's a bit of a shame that by default AdGuard Home will only display the IP addresses of each client (and how many request they are making), as it makes differentiation a little bit tricky, especially if you rely on random DHCP leases rather than static IP addresses. It is possible to provide a hosts file with host names for each, but that can be cumbersome (you'd have to manage it whenever a new device is added) or downright impossible (if devices end up sharing IP addresses when they get their leases). Hopefully a future version will make this better.

AdGuard Home appears to be a simple yet powerful solution. It is clear that it is a much simpler application in terms of functionality compared to the older kids on the block (i.e. PiHole) but it shows real promise. I'd certainly recommend it to those curious about setting up a network-level ad blocker.
