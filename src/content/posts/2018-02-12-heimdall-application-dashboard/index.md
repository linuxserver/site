---
title: Heimdall Application Dashboard
date: 2018-02-12T17:23:00Z
author: Chris Hunt
tags:
  - heimdall
hero: ./featured.png
---

## What is Heimdall?

As the name suggests [Heimdall Application Dashboard](https://heimdall.site) is a dashboard for all your web applications.  It doesn't need to be limited to applications though, you can add links to anything you like.

If you're like me, you use an assortment of web based applications; some daily, some weekly, some rarely at all.  Heimdall is an elegant solution to organise those apps.  It’s dedicated to this purpose so you won’t lose your links in a sea of bookmarks.

[![IMAGE ALT TEXT HERE](https://i.imgur.com/s4fX8tf.jpg)](http://www.youtube.com/watch?feature=player_embedded&v=GXnnMAxPzMc
)

Heimdall is a work in progress, but in order to make it the best it can be it follows a few simple key values.

**Simplicity** - Many projects fall into the trap of trying to cater for everyone. In the process a million different options are introduced so users can fine tune the application to perfectly match their needs.  The end result of this is an application that can technically accommodate the needs of all of its users, but is too complicated for any of it’s users.

Heimdall works hard to keep things as simple as possible for end users. There are no iframes here, no apps within apps, no abstraction of APIs. if you think something should work a certain way, it probably does.

**Elegance** - An important aspect in getting people to use an app is to get them to want to use it. For many apps design takes a back seat to functionality. With Heimdall I tried to create a visually pleasing app to encourage people to discover its benefits. Whether I succeeded in this is for you to decide, but I’m happy with its progress so far.

**Support** - Heimdall is backed by the linuxserver.io group

### App support

An item added to Heimdall falls into one of three categories.  It's either a Generic item, a Foundation app, or an Enhanced app.

**Generic Items** - One of the benefits to Heimdall is you can add a link to absolutely anything, whether it's intrinsically supported or not.  With a generic item, you just fill in the name, background colour, add an icon if you want (if you don't a default Heimdall icon will be used), and enter the link url and it will be added.

**Foundation apps** - With these and indeed the Enhanced apps below, you just start typing the name of the app and if it's supported it will show up in a dropdown, click the app name and it will fill in a default background colour and the applications icon.  All you need to do is put the URL you want to link to.

**Enhanced apps** - These are exactly the same as Foundation apps, the only difference is they also allow you to use an apps API to display some extra information automatically by just entering API credentials.

As time goes by the list of supported apps will grow, adding a new Foundation app is [pretty easy](https://github.com/linuxserver/Heimdall/wiki/Foundation-apps), so I hope the community will get involved and help out with this.

### Language support

The app is multilingual ready.  It currently has several languages included, however, by and large they are google translated, so the accuracy could probably be improved.  Current languages are:

- English
- German
- Finnish
- French
- Swedish
- Spanish
- Turkish

To add a new language, create a new folder with the ISO 3166-1 alpha-2 code as the name, copy `app.php` from `/resources/lang/en/app.php` into your new folder and replace the English strings.

For extra browny points send a Pull Request, I'd love to add your translation to the app.

### Installation

**Docker** - Of course we have a [docker container](https://hub.docker.com/r/linuxserver/heimdall/), did you really need to ask?

Check this [readme](https://github.com/linuxserver/docker-heimdall/blob/master/READMETEMPLATE.md) for usage instructions.

**Manual** -

1. Download a release or git clone the repository. 2. Point your httpd web directory to the `public` folder inside the app. 3. Done

If you have php installed on your system you could even run a httpd from the commandline, simply cd into the heimdall directory and type `php artisan serve`

If you struggle with any of the setup, there are more instructions on the [github](https://github.com/linuxserver/Heimdall)

### Links

Github: [Link](https://github.com/linuxserver/Heimdall)

Releases: [Link](https://github.com/linuxserver/Heimdall/releases)

Issues/Requests: [Link](https://github.com/linuxserver/Heimdall/issues)

Support: [Discord](https://discord.gg/KJXmZu5)
