---
title: Spring Cleaning - New Images and Rebasing
date: 2025-06-06T21:17:00Z
tags:
  - Selkies Docker Images
  - Rdesktop Docker Deprecation
  - EmulatorJS Docker Retirement
  - Web-based Linux Desktop
  - RetroArch Docker Image
  - Brave Browser Docker Image
  - 60fps Web Desktop
  - Hybrid VNC Video Codec
  - WebCodecs Docker
  - Desktop Application Containers
hero: ./banner.jpg
---

## Sunsetting Legacy Images and Embracing a New Era

We are announcing an evolution in our Docker image catalog, which includes the sunsetting of several legacy images. This focused approach allows us to concentrate our development efforts on a significantly more modern, robust, and feature-rich platform for delivering desktop applications, built in partnership with the [Selkies organization](https://github.com/selkies-project/).

### Deprecation of Rdesktop and Associated Base Images

Firstly, our [Rdesktop](https://github.com/linuxserver/docker-rdesktop) images and their corresponding `docker-baseimage-rdesktop` bases will be deprecated. These containers were initially developed as part of an ecosystem to serve desktop applications directly to a web browser using the Guacamole stack. However, this technology has seen minimal development since our transition to KasmVNC and is no longer aligned with our current technical direction or the advanced capabilities of our new platform. Over the next two weeks, these images will be removed from our catalog, and we will not be offering direct replacements for RDP-specific containers.

### Retirement of the Docker-EmulatorJS Image

Secondly, we will be retiring the [Docker-EmulatorJS](https://github.com/linuxserver/docker-emulatorjs) image. This container originated from a project that decompiled ad-supported cores used by `emulatorjs.com`. While we subsequently transitioned to building our own cores from Libretro, the web-based emulation landscape has evolved considerably. The team at [EmulatorJS](https://emulatorjs.org/), under the leadership of Ethan O'Brien, has developed a highly integrated and demonstrably superior solution that has far surpassed the capabilities of our containerized offering.

The continued availability of our image has unfortunately led to naming confusion among the three distinct projects (our image, the original `emulatorjs.com`, and the current EmulatorJS project). For this reason, and to guide users towards a more advanced and actively maintained platform, we are formally sunsetting our `EmulatorJS` image. We extend our sincere apologies to the EmulatorJS team for any confusion our project may have inadvertently caused. For users seeking a premier web-based emulation experience, we strongly recommend exploring the official EmulatorJS project and considering these alternatives. 

* [Gaseous Server](https://github.com/gaseous-project/gaseous-server) - Leveraging [EmulatorJS](https://emulatorjs.org/) cores for web based gameplay, its focus is on rom management. 
* [RomM](https://github.com/rommapp/romm/) - Again leveraging [EmulatorJS](https://emulatorjs.org/) cores for web based gameplay with a focus on rom library management. 
* [webЯcade](https://github.com/webrcade/webrcade) - Highly customized cores with an emphasis on cloud based storage backends. 

## Our New Desktop Application Stack: Powered by Selkies

As we retire these older images, we are excited to introduce a new generation of desktop application containers, commencing with a [RetroArch](https://github.com/linuxserver/docker-retroarch) desktop image. This new offering signifies a pivotal shift in how we package and deliver Linux desktop applications, leveraging the cutting-edge technology developed in collaboration with the Selkies organization. This is the same technology underpinning the advancements detailed in our recent article, "[Webtop 3.0 Part 1: A Call to Revolutionize Web-Based Linux Desktops](/blog/webtop-3-0-part-1-a-call-to-revolutionize-web-based-linux-desktops/)."

To further showcase the transformative capabilities of this new rendering stack, we are also releasing an image for the [Brave browser](https://github.com/linuxserver/docker-brave). Despite Brave being a favorite browser among several team members, this marks the first time we have packaged it. Its exceptional performance within this new framework serves as an excellent demonstration of the smooth, high-fidelity experience our new base image provides for general desktop applications.

The core of this advancement lies in the **hybrid VNC and Video Codec protocol** integrated into the Selkies base image. Unlike traditional streaming methods, this protocol intelligently combines VNC's efficiency in tracking screen changes (damage tracking) with the power of modern video codecs (H.264). It divides the screen into horizontal "stripes," encoding and transmitting only those stripes that have changed. This "striped" approach enables massive parallelism, allowing for a **true 60fps desktop experience over the web, efficiently achievable even on low-end x86 or ARM CPUs** without requiring specialized GPU hardware for encoding.

Beyond this core rendering pipeline, the new stack incorporates several key enhancements:

### Advanced Userspace Udev/Evdev Gamepad Support

To enable seamless gamepad utilization within containers without requiring privileged access to host devices, we are leveraging a combination of two userspace interposers:

*   **[js-interposer](https://github.com/selkies-project/selkies/tree/feature/websockets/addons/js-interposer):** This component acts as the core gamepad interface, intercepting input calls from applications for both standard Linux gamepad (`js`) and `evdev` devices.
*   **[fake-udev](https://github.com/selkies-project/selkies/tree/feature/websockets/addons/fake-udev):** This tool simulates a `udev` endpoint. Instead of interacting with the host's device manager, it returns static gamepad configurations that are linked to the virtual device files managed by the `js-interposer`.

This toolset is continuously evolving and, while fully functional with applications like RetroArch, may not yet be compatible with all games that rely heavily on `udev` for dynamic gamepad management. It represents a foundational step towards broader compatibility for controller-based applications.

### Integrated Built-in Shared Mode

Our new Selkies-based images feature native support for screen sharing. More specifically, they allow secondary clients to connect and be mapped to individual virtual gamepads, enabling local multiplayer scenarios directly in the browser. The current implementation utilizes `websocket.broadcast` to efficiently send video and audio streams to multiple clients. While presently optimized for low-latency LAN environments, this feature provides a simple and effective method for shared gameplay and collaborative sessions.

## Navigating the Transition: What to Expect

The migration of all our desktop application containers to this new Selkies-based architecture will introduce significant improvements alongside some necessary changes. We are confident in the substantial long-term benefits, but we want to be transparent about the adjustments users may need to consider.

*   **Client Compatibility:** The new stack relies on modern web technologies, particularly `WebCodecs` for efficient audio and video decoding directly in the browser. Consequently, client compatibility will be primarily limited to browsers that fully support these standards. Users with older or non-compliant browsers may experience issues or be unable to connect.
*   **Performance Over WAN:** Our initial implementation is optimized for low-latency LAN environments to deliver the highest fidelity and responsiveness. While functional over the internet, performance for users on high-latency or very low-bandwidth WAN connections may be perceptibly different compared to older solutions that aggressively compressed static JPEG images. The real-time nature of the advanced streaming protocol is more sensitive to network conditions. Basic backpressure mechanisms are in place, and we are actively exploring further optimizations for WAN performance in future updates.
*   **Mandatory HTTPS Requirement:** The application's web service, which in some legacy setups might have been accessed directly via HTTP (e.g., on port 3000), **must now be served through HTTPS.** This is a critical change to ensure all communication between the client and server is encrypted and, importantly, to enable `WebCodecs` functionality in modern browsers. Direct HTTP access will no longer be supported for the primary application interface. Port 3000 remains available primarily for backward compatibility with existing reverse proxy configurations that handle HTTPS termination.
*   **Temporary Loss of DRI3 Acceleration:** Our new base images do not currently include native support for Intel and AMD GPU acceleration via DRI3. This is an active development item on our roadmap, and we are working diligently to implement it properly in a future release.

## What's Next: A Phased Transition to a new Platform

The process of rebasing our extensive catalog of desktop application images to the new Selkies foundation will occur progressively. We will not be offering new builds based on the legacy stack moving forward. The [new base images](https://github.com/linuxserver/docker-baseimage-selkies/) are designed with the intention of being drop-in replacements for previous versions, with the primary exception being the new HTTPS requirement.

[Webtop](https://github.com/linuxserver/docker-webtop/) is the first major application suite targeted for this transition, and preview tags are already available, as detailed in our previous [blog post](/blog/webtop-3-0-part-1-a-call-to-revolutionize-web-based-linux-desktops/).

We understand that transitions can present challenges, and we sincerely apologize for any inconvenience this may cause to users reliant on the deprecated images or features not yet fully ported. However, this move is essential for us to advance, innovate, and deliver a significantly improved, more sustainable, and future-proof platform for web-based Linux desktop applications. We are excited about the possibilities this new technology unlocks and are committed to supporting our community through this evolution.
