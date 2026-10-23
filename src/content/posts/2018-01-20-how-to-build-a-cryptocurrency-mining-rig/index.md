---
title: Building a cryptocurrency mining rig
date: 2018-01-21T00:05:00Z
author: IronicBadger
tags:
  - linux
  - cryptocurrency
  - diy
hero: ./featured.jpg
---

When I write for this site I like it to be a reflection of my current interests and right now, that is crypto mining. I'll share some of the tips and tricks I've learned over the last month or so building a 6 (soon to be 8) GPU mining rig.

![](/content/images/2018/01/IMG_8168.jpg)

## Is it profitable?

> Yes.

The basic calculations are quite simple. Take your electricity cost and subtract that from the amount of crypto coin you 'mine' per day. Right now, a GTX 1080ti will mine approx 0.05 Zclassic (ZCL) per day which equates to £6 (ZCL is at £120 today). Minus electric costs of around 60p for 24h and it's a clear profit of £5.40 daily.

I pay 11.8p/kWh for my electricity (it is a 100% renewable plan too so I'm not killing polar bears too badly). `220W X 24h = 5.28kWh * 11.8 = 62.3p` per card, per day.

I managed to snag 6x 1080ti's in mid December for £650-700 each. 3 MSI's and 3 EVGA's (the latter are much better, by the way). Assuming a £700 price and a £5.40 daily earning the return on investment (ROI) period is around 130 days or just over 4 months. At the the end of that time you *own outright* a GTX 1080ti.

Now, obviously a GPU on it's own isn't going to do much so you'll need a motherboard, CPU, RAM, boot media, PCI-e risers and most importantly a good quality PSU. In my case I over spec'd and poached a few components from other builds I was doing at the time. But if I lump all that cost into the mining rig I spent £600 on the 'PC' bits listed above.

Couple that with the cost of 6x 1080ti's and you're looking at *at least* £4,800. Based on today's GPUs prices you cannot build a system for this price. GPUs, and even power supplies, are going for £8-900 now, it's pretty crazy but now you know why... They are basically money printing machines!

## What is "mining"?

The [blockchain](https://en.wikipedia.org/wiki/Blockchain). Buzzword of the moment. It's a public ledger of all transactions in chronological order which require the solving of computationally complex problems for verification.

Whenever someone sends Bitcoin, Ethereum or any cryptocurrency these transactions get placed into blocks. These blocks are then confirmed by miners to ensure things like double spends don't happen and that I actually had the balance I said I did in my wallet to send in the first place! Using algorithms these when these blocks are 'solved' a 'reward' is given, usually in the coin that you've just 'mined'. So cryptocurrency mining is the reward given by the blockchain for confirming transactions on the ledger of a given coin.

## Hardware

> Motherboard - Asus Z270P Prime £115

![](/content/images/2018/01/IMG_8181.jpg)

Running 8 GPUs off one motherboard requires *careful* part selection and patience. It took me 3 motherboards to find one that worked properly. Initially I wanted to recycle my Supermicro X11SAE-F board, but that failed to POST with all PCI-e slots populated. Then I tried an MSI Z170-A Gaming Pro Carbon but that had random issues with not detecting more than 4 GPUs and was just generally rubbish. Finally I purchased the Asus Z270p Prime motherboard, flashed the latest BIOS and all 6 PCI-e plus 2 m2 slot with adapters detected cards first time!

> CPU - i3 6100 £95

Complete overkill for mining but I will be asking this system to perform double duties as a node in my Openshift/Kubernetes home lab cluster. A good alternative would be the cheaper Pentium chips like the G3900 or G4400. The 4 threads on the i3 are nice to have though!

> RAM - Corsair DDR4 32GB used £139

Again, complete overkill but the Kubernetes requirement and a good price meant I just went for it.

> PCI-e risers £6 each (£48)

![](/content/images/2018/01/IMG_8180.jpg)

The PCI-e risers are really quite nifty. They are PCI-e 1x size at the motherboard end and 16x size at the GPU end. They are powered (more on this in a sec) directly from your PSU and connect back to the motherboard via a USB cable. These components aren't known for their reliability so always order a couple more than you need!

![](/content/images/2018/01/IMG_8183.jpg)

Buy risers with 6 pin (GPU style) connectors as the ones with SATA connectors are a huge fire hazard! The SATA connector is rated at 50w but the PCI-e slot can draw up to 75w!! If you do buy the SATA ones throw the el-cheapo adapter that came with them away and never run more than 1 or 2 risers per cable. **I would not do this at all it is just too risky! You have been warned!!**

> M.2 PCI-e risers £7 each

![](/content/images/2018/01/Screen-Shot-2018-01-20-at-18.04.22.png)

A nifty way to add more GPUs to a board which has run out of native PCI-e slots is using [these](https://www.amazon.co.uk/LATTCURE-Female-Adapter-Power-Converter-PCI-4X-M-2-Key-NGFF/dp/B0751FCKPZ/ref=sr_1_3?ie=UTF8&amp;qid=1516471393&amp;sr=8-3&amp;keywords=m2+pcie+adapter) M.2 to PCI-e adapters.

> Boot Media - 16GB USB £5

This decision largely depends on the software you're going to be using. I'm currently using SimpleMiningOS (SMOS), more on this later, so all I need is a simple USB drive. You can get an SSD if you want but a typical mining rig doesn't need more than a USB unless you're running, *shudder*, Windows.

> GPUs

![](/content/images/2018/01/IMG_8151.jpg)

Obviously this is the *most important part of the build*. Right now GPU prices are absolutely sky high and everyone and his dog are moaning about it. Jayztwocents put out a [video](https://www.youtube.com/watch?v=uT-pP4wvLV8) moaning about crypto miners killing gaming. To be clear I don't think miners at the scale I'm talking about here (hobbyists lets face it!) are to blame. Crypto mining farms buying 100s of cards at a time such as Genesis mining and [Bitmain](https://shop.bitmain.com/) (although they focus more on ASICs) etc are. Demand is outstripping supply right now though and the end result? GPUs are selling for double their MSRP. Honestly you've missed the boat at current prices but when things settle down a bit? Who knows...

> Power - Seasonic 850w £150 / HP 1200w Server PSU £60

Given the amount of juice you're going to be pulling from the wall there are many considerations to be made outside of the rig before you even consider PSUs themselves. At full load my rig sucks down 1800w and about 7 amps. That's not an inconsiderable constant load on your home electrical system. Fortunately the UK runs at 220v meaning compared to the US the amperage required is HALF. Please, please, please double check your houses breakers and run at no more than 80% of the rated amperage for that circuit. You may need to spend money here uprating your existing electrical system which obviously affects your ROI potentially quite considerably!

![](/content/images/2018/01/IMG_8154.jpg)

You can buy power supplies that are in the 1800w range but honestly they are just stupid expensive. Therefore I opted to go with a split approach using a Seasonic 850W PSU for the main system and 3 GPUs. Get a platinum rated PSU if you can and try to run the PSU at less than 80% constant load. In my build this component should ideally be a 1000W PSU but I already had the 850W to hand.

![](/content/images/2018/01/IMG_8153.jpg)

The other PSU I am using is a reconditioned HP server PSU (DPS-1200FB). I purchased this initially to act as a PSU for my drone racing battery chargers for around £40 (you will not find any for anywhere *near* that price today - try £100+) along with a £20 breakout board that has 10 6-pin GPU connectors on it. I am able to run the remaining 5 GPUs from this PSU. It is rather noisy at this sort of load though, so bear that in mind!

I think if I were to do this again I'd buy two 1000w consumer PSUs so long as I could find them for £100 or so each. That's probably unrealistic though as most likely for a 1kw platinum rated unit you're looking at high end £150+ units. Something to consider there next time.

> Frame - total cost ~£5

![](/content/images/2018/01/IMG_20180113_145435.jpg)

I built a custom frame from Plywood that was just otherwise sitting in my shed. There are 100s of ways to skin this particular cat so I'll just post some pictures of my creation and leave you to make your own!

![](/content/images/2018/01/IMG_20180113_145430.jpg)
![](/content/images/2018/01/IMG_8174.jpg)
![](/content/images/2018/01/IMG_8176.jpg)
![](/content/images/2018/01/IMG_8177.jpg)

> Extras

![](/content/images/2018/01/IMG_8178.jpg)

Fans and [fan splitter hub](https://www.amazon.co.uk/gp/product/B075H2XWDF/ref=oh_aui_detailpage_o02_s00?ie=UTF8&amp;psc=1). These are cheap and readily available. Cooling your rig is important and it's effectively a 220W (x8) space heater. In winter my conservatory has never been usable, far too cold but with the new space heater - it's lovely and toasty. Come the summer I plan to build a plywood box and put it in my shed with HEPA filters and large box fans to a) keep out the spiders b) keep out the dust c) keep things cool. Guys on Youtube do this in Florida and the Middle East with their crazy hot conditions so a British summer will be warm, but no great problem I'm expecting at this scale.

## Software

SimpleMiningOS (SMOS).

![](/content/images/2018/01/Screen-Shot-2018-01-20-at-18.29.06.png)

It's Linux based. It's simple. It is cheap at $2 per rig per month. SMOS comes with the major miner program pre-baked and is about as simple as it comes for setting up your rig.

A nice straight-forward web UI with overclocking support means I can keep an eye on my rig where I am. This is not a paid endorsement but SMOS is really impressive.

You can of course run the miner yourself but then you need to handle restarts when GPUs fall over, etc. You could run Windows and use Awesome Miner or whatever you like - again there are many ways to skin this cat. I'll leave this section brief and if there is demand (post a comment below) to expand it I will do so in a follow up piece.

## Mining hints

- 
Stick to one coin and try not to switch more than every 24h or so. A great resource is [whattomine.com](http://whattomine.com). Keep an eye on the (not FIAT) amounts of coin it predicts and compare that your actual output. It's been pretty accurate for me.

- 
Use a mining pool. You alone do not have anywhere near enough power to find a block which is how you actually get paid. Using a pool means you have to share your block finding profits and most pools take small fee (~1%). I use MiningPoolHub and I find it's Auto Exchange feature very convenient. I exchange to LTC as it has very low TX fees and is supported by Coinbase.

- 
Overclocking is important but so is undervolting. Mining is all about efficiency. How many watts are you pulling versus how many hashes are you hashing? You will need to tweak your cards yourself but my figures for the 1080ti's are

- Core +122
- Mem +300
- Power 220w per card

- 
Stability is key. Find some stable figures as quick as you can and then leave it. Don't fiddle. Everytime the miner restarts you loose 30 seconds or more of mining time *at least*. It's tempting to tweak every last hash but honestly the reward is probably so miniscule as that you'll wipe them out with the increased downtime.

## Cashing out

The name of the game here is avoiding fees. I do this by auto exchanging my ALTcoins to LTC on Mining Pool Hub and then sending them to Coinbase. From there I send to GDAX (free) and then using a limit order sell the coins for BTC, ETH or FIAT (limit orders are again free). I can then send to my bank or my cold storage wallet for safe keeping.

## Conclusion

So that's about it. A 5 week journey documented in 1 article. Should you build a miner? Yes - if your risk profile suits! Maybe wait for GPU prices to calm down a little. You could always start hunting down the other parts for your build though...

Or, you could just buy crypto directly.

That's the beauty of life - it's up to you to make of it what you will. Happy mining!
