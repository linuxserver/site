---
title: "Webtop 3.0 Part 2: The Eagle Has Landed"
date: 2025-08-21T16:56:00Z
tags:
  - Selkies Project
  - Linux Desktop Browser
  - Docker Remote Desktop
  - Self-Hosted Applications
  - GPU Acceleration in Docker
  - WebCodecs Streaming
  - Low Latency Streaming
  - Remote Gaming on Docker
  - linuxserver.io Webtop
  - Mobile Trackpad Mode
hero: ./eagle.jpg
---

Following the initial rollout of our new technology stack for desktop images, we have reached a significant milestone in stability. After several months of development focused on bug fixes and community-driven feature requests, we have resolved all major issues and are now shifting our focus to refining existing features and future enhancements.

A critical aspect of this transition has been the enforcement of HTTPS for all connections. This is a fundamental requirement dictated by modern web standards, which are increasingly restricting powerful browser features to secure contexts. Specifically, our new architecture relies on the **[WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)** for high-performance video and audio decoding, an API that is unavailable over unencrypted HTTP. This change also resolves long-standing issues with other browser APIs, such as clipboard and microphone access, which also needed HTTPS.

**A Note on Security:** It is crucial to understand that while HTTPS encrypts data in transit, it does not secure the application endpoint itself. We strongly advise against exposing these or any containers directly to the internet without a proper authentication layer. For this purpose, we recommend implementing a secure gateway that provides, at a minimum, basic authentication and brute-force detection. Our own **[SWAG](https://github.com/linuxserver/docker-swag)** container is an excellent solution for this. Proper security practices are an essential component of self-hosting. Part of owning your own data also comes with the responsibilty of reading technical documentation there is no shortcut here, there is no silver bullet YouTube video that is going to secure your server for you. 

## Progress

It has been 90 days since our initial announcement, and thanks to the incredible help from our community, we've made a flurry of changes and improvements. For those who like lists, here is our three-month progress report.

### Rendering Engine Enhancements

The core rendering pipeline, `pixelflux`, has received significant upgrades to enhance performance, reliability, and feature set for both full-frame and striped rendering modes.

*   **DRI3 & GPU Acceleration:** Full DRI3 support has been enabled through a patched X11 and Xvfb ([linuxserver/docker-xvfb](https://github.com/linuxserver/docker-xvfb)), allowing for 2D Glamor and 3D DRI3 acceleration in applications running on Intel and AMD GPUs.
*   **Performance & Efficiency:**
    *   Reduced server resource consumption on motionless screens by optimizing full-frame damage detection and improving VNC heuristics, resulting in significant performance gains without compromising frame delivery.
    *   Implemented direct data capture from XShm using `libyuv` to accelerate the delivery of pixels to the client, eliminating unnecessary memory copies of RGB data for lower latency.
    *   Asynchronized the server platform to reduce micro-stutters and eliminate performance bottlenecks.
    *   Added a flag to force CPU encoding, which is useful for setups that require GPU acceleration for applications but not for stream encoding.
*   **Visual Quality & Features:**
    *   **Live HiDPI Scaling:** Introduced live scaling updates for HiDPI screens, allowing users to adjust application scaling for a pixel-perfect experience. These settings are now stored client-side and automatically applied when connecting from different devices.
    *   **Paint-Over Quality:** Users can now define not only the desired quality but also a "paint-over" quality for both H.264 and JPEG encoding. This feature cleans up the image with higher-quality re-encodes when the screen is static.
    *   **Static Scene Clarity:** Improved static image quality (especially for text) by using a burst of frames to refresh the screen, rather than a single IDR frame.
    *   **Truecolor Support:** Enabled full Truecolor (4:4:4 chroma subsampling) support for both NVIDIA and CPU-based encoding.
    *   **Watermarking:** Added support for static and animated PNG watermarks on the stream.
*   **Streaming & Stability:**
    *   **Backpressure Control:** Implemented a backpressure mechanism using latency-adjusted frame IDs synced between the client and server to prevent bufferbloat and ensure a smooth stream.
    *   **Turbo Mode:** Introduced a "Turbo Mode" designed for gaming and full-motion video, which pushes frames to the browser like a traditional video encoder.
    *   **VA-API Support:** Added initial, experimental VA-API support. *Note: This currently requires the host and the Docker container to be running the same OS (e.g., Debian on Debian).*
*   **Builds:** Pre-built Python wheels for `pixelflux` and `pcmflux` are now available for all supported distributions, including Alpine. These are compiled against the latest source libraries for maximum performance.

### Input & User Experience Overhaul

We've focused heavily on making interaction seamless and intuitive across all devices and platforms.

*   **Universal Keyboard Support:** Certified and tested every major keyboard layout with direct feedback from native speakers. This includes live hot-swapping of layouts and IME modes. The client now translates and sends true keysyms to the server, meaning no keyboard configuration is needed on either the client or server side.
*   **Advanced Mobile & Touch Support:**
    *   **Trackpad Mode:** Added a new trackpad mode for mobile devices, dramatically improving usability with high-resolution content. The cursor is rendered server-side, and gestures are intuitive:
        *   **Movement:** Moves the cursor.
        *   **Single Tap:** Performs a left click.
        *   **Tap then Tap-and-Hold:** Clicks and holds for dragging.
        *   **Two-Finger Tap:** Performs a right click.
    *   **Two-finger scrolling** is now supported on mobile touch devices.
    *   **iOS Compatibility:** Completed full testing on iOS devices for keyboard pop-ups, general touch input, and external keyboards/mice.
*   **IME Certification:** Certified full IME support (e.g., Chinese Pinyin) on both Windows and macOS clients with native speakers.
*   **Gamepad Plug-and-Play:** Completely overhauled gamepad support. It now features plug-and-play functionality for any PlayStation, Xbox, or Switch controller via a fake `udev` library and a comprehensive mapping database derived from [SDL_GameControllerDB](https://github.com/mdqinc/SDL_GameControllerDB).
*   **Cursor & Mouse Improvements:**
    *   Overhauled cursor rendering to use the real server-side cursor at all times, bounded correctly for accurate hotspot clicks.
    *   Leveraged the `getPredictedEvents()` browser API for smoother, lower-latency cursor movement and feel.
    *   Added a "Gaming Mode" with pointer lock for first-person shooters.
    *   Implemented a `numlock` translation table to ensure the numlock state can never be out of sync between the client and server.
    *   Added support for horizontal scroll wheels on mice.
    *   Fixed an issue where blanking cursors would render as a black box.
    *   General cursor rendering cleanup and logic for applications with low resolution or incomplete cursors.
*   **UI Additions:**
    *   Added softkeys to the sidebar for common modifiers and special keys like `Ctl` `Alt` and `Esc`.
    *   Full support for trackpads, keyboards, and mice on Android/iOS devices.

### Shared & Multiplayer Modes

Collaboration and shared experiences.

*   **Efficient Broadcasting:** Introduced shared modes that leverage `websockets.broadcast` for a zero-overhead method of sending the primary user's screen to all connected shared clients.
*   **Multiplayer Gaming:** Implemented a "Player 2-4" concept, allowing controller input from shared sessions for collaborative multiplayer or split-screen gaming.
*   **Touchscreen Controllers:** Added on-screen touchscreen controls for shared player sessions, enabling mobile devices without a physical controller to participate in games.

We recently blogged about a captive gaming portal using this functionality [here](/blog/making-a-gaming-wifi-captive-portal-on-the-cheap/).

### General Fixes & Quality of Life

A huge number of fixes have been implemented to make the entire platform more stable, flexible, and user-friendly.

*   **Connectivity & Networking:**
    *   Fixed issues with subfolder proxy setups.
    *   Added more complex port mapping options (`HTTP_PORT`, `HTTPS_PORT`, `WS_PORT`) for users combining containers on a single network interface.
    *   Improved client-side messaging to clearly state issues if not using HTTPS or if `WebCodecs` is not supported by the browser.
*   **Client-Side Stability:**
    *   Made client-side setting retention more robust, ensuring users are greeted with their preferred configuration every time they connect.
    *   The client will now automatically reset to safe default settings if it encounters a fatal decoding error, preventing a broken session.
*   **Desktop & Application Compatibility:**
    *   Added D-Bus and XSettings to images, fixing many desktop environment oddities.
    *   Fixed numerous bugs related to manual resolution input and HiDPI modes, ensuring correct mouse positioning.
    *   Expanded and fixed many bugs with Proot application interaction inside containers.
    *   Set the initial application resolution to 1024x768 before the client connects (down from an 8K default), fixing many rendering issues with legacy apps.
*   **System & Environment:**
    *   Added a `MAX_RES` environment variable to support monitors with resolutions over 8K.
    *   The platform now automatically detects if a user is running the NVIDIA runtime without a GPU and falls back gracefully to prevent a broken session.
    *   Optimized client-side Opus audio decoding using Workers and Worklets to eliminate pops and crackles.
*   **Web & Mobile Fixes:**
    *   Fixed Progressive Web App (PWA) metadata to ensure it works correctly and presents the proper tab icon.
    *   Fixed issues where mobile browsers would clip portions of the screen.
    *   Enabled anti-aliasing on non-HiDPI canvas rendering and manual resolution modes to smooth content.
    *   Added latency, bandwidth, and other useful statistics to the UI, while hiding GPU stats on devices that lack them.

### New & Updated Images

We've expanded our distro offerings and rebased our entire existing catalog onto this powerful new stack.

*   **New Base Images:**
    *   **Enterprise Linux 9 (EL9):** For enterprise applications.
    *   **Kali Linux:** Including a downstream KDE desktop image.
    *   **Debian Trixie:** The latest from the Debian team.

Of course, our entire existing catalog of images has been rebased. We've also added many new application images to take advantage of the new high-framerate capabilities.

## Selkies Based Images

More than just Webtop and its flavors we are expanding every day to bring you the best Linux software we can find: 

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; list-style: none; padding: 0; margin: 0; font-family: sans-serif;">
    <a href="https://github.com/linuxserver/docker-altus" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/altus-logo.png" alt="altus logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">altus</span>
    </a>
    <a href="https://github.com/linuxserver/docker-ardour" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/ardour-logo.png" alt="ardour logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">ardour</span>
    </a>
    <a href="https://github.com/linuxserver/docker-audacity" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/audacity-logo.png" alt="audacity logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">audacity</span>
    </a>
    <a href="https://github.com/linuxserver/docker-bambustudio" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/bambustudio-logo.png" alt="bambustudio logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">bambustudio</span>
    </a>
    <a href="https://github.com/linuxserver/docker-blender" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/blender-logo.png" alt="blender logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">blender</span>
    </a>
    <a href="https://github.com/linuxserver/docker-boinc" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/BOINC/boinc/master/doc/logo/boinc_logo_black.jpg" alt="boinc logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">boinc</span>
    </a>
    <a href="https://github.com/linuxserver/docker-brave" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/brave-logo.png" alt="brave logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">brave</span>
    </a>
    <a href="https://github.com/linuxserver/docker-calibre" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/calibre-logo.png" alt="calibre logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">calibre</span>
    </a>
    <a href="https://github.com/linuxserver/docker-calligra" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/calligra-logo.png" alt="calligra logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">calligra</span>
    </a>
    <a href="https://github.com/linuxserver/docker-chrome" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/chrome-logo.png" alt="chrome logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">chrome</span>
    </a>
    <a href="https://github.com/linuxserver/docker-chromium" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/chromium-logo.png" alt="chromium logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">chromium</span>
    </a>
    <a href="https://github.com/linuxserver/docker-cura" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/cura-logo.png" alt="cura logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">cura</span>
    </a>
    <a href="https://github.com/linuxserver/docker-darktable" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/darktable-logo.png" alt="darktable logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">darktable</span>
    </a>
    <a href="https://github.com/linuxserver/docker-digikam" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/digikam.png" alt="digikam logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">digikam</span>
    </a>
    <a href="https://github.com/linuxserver/docker-dogwalk" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/dogwalk-logo.png" alt="dogwalk logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">dogwalk</span>
    </a>
    <a href="https://github.com/linuxserver/docker-dolphin" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/dolphin-logo.png" alt="dolphin logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">dolphin</span>
    </a>
    <a href="https://github.com/linuxserver/docker-doublecommander" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/doublecommander-icon.png" alt="doublecommander logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">doublecommander</span>
    </a>
    <a href="https://github.com/linuxserver/docker-duckstation" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/duckstation-logo.png" alt="duckstation logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">duckstation</span>
    </a>
    <a href="https://github.com/linuxserver/docker-ferdium" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/ferdium-logo.png" alt="ferdium logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">ferdium</span>
    </a>
    <a href="https://github.com/linuxserver/docker-filezilla" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/filezilla-logo.png" alt="filezilla logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">filezilla</span>
    </a>
    <a href="https://github.com/linuxserver/docker-firefox" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/firefox-logo.png" alt="firefox logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">firefox</span>
    </a>
    <a href="https://github.com/linuxserver/docker-flycast" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/flycast-logo.png" alt="flycast logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">flycast</span>
    </a>
    <a href="https://github.com/linuxserver/docker-freecad" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/freecad-logo.png" alt="freecad logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">freecad</span>
    </a>
    <a href="https://github.com/linuxserver/docker-gimp" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/gimp-logo.png" alt="gimp logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">gimp</span>
    </a>
    <a href="https://github.com/linuxserver/docker-github-desktop" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/github-desktop-icon.png" alt="github-desktop logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">github-desktop</span>
    </a>
    <a href="https://github.com/linuxserver/docker-gitqlient" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/gitqlient-icon.png" alt="gitqlient logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">gitqlient</span>
    </a>
    <a href="https://github.com/linuxserver/docker-gzdoom" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/gzdoom-logo.png" alt="gzdoom logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">gzdoom</span>
    </a>
    <a href="https://github.com/linuxserver/docker-inkscape" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/inkscape-logo.png" alt="inkscape logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">inkscape</span>
    </a>
    <a href="https://github.com/linuxserver/docker-joplin" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/joplin-logo.png" alt="joplin logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">joplin</span>
    </a>
    <a href="https://github.com/linuxserver/docker-kali-linux" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/kali-logo.png" alt="kali-linux logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">kali-linux</span>
    </a>
    <a href="https://github.com/linuxserver/docker-kdenlive" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/kdenlive-logo.png" alt="kdenlive logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">kdenlive</span>
    </a>
    <a href="https://github.com/linuxserver/docker-keepassxc" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/keepassxc-logo.png" alt="keepassxc logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">keepassxc</span>
    </a>
    <a href="https://github.com/linuxserver/docker-kicad" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/kicad-logo.png" alt="kicad logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">kicad</span>
    </a>
    <a href="https://github.com/linuxserver/docker-krita" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/krita-logo.png" alt="krita logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">krita</span>
    </a>
    <a href="https://github.com/linuxserver/docker-libreoffice" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/libreoffice-logo.png" alt="libreoffice logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">libreoffice</span>
    </a>
    <a href="https://github.com/linuxserver/docker-librewolf" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/librewolf-logo.png" alt="librewolf logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">librewolf</span>
    </a>
    <a href="https://github.com/linuxserver/docker-lollypop" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/lollypop-icon.png" alt="lollypop logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">lollypop</span>
    </a>
    <a href="https://github.com/linuxserver/docker-mame" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/mame-logo.png" alt="mame logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">mame</span>
    </a>
    <a href="https://github.com/linuxserver/docker-mediaelch" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/mediaelch-logo.png" alt="mediaelch logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">mediaelch</span>
    </a>
    <a href="https://github.com/linuxserver/docker-msedge" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/edge-logo.png" alt="msedge logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">msedge</span>
    </a>
    <a href="https://github.com/linuxserver/docker-mullvad-browser" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/mullvad-browser-logo.png" alt="mullvad-browser logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">mullvad-browser</span>
    </a>
    <a href="https://github.com/linuxserver/docker-mysql-workbench" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/mysql-workbench-icon.png" alt="mysql-workbench logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">mysql-workbench</span>
    </a>
    <a href="https://github.com/linuxserver/docker-obsidian" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/obsidian-logo.png" alt="obsidian logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">obsidian</span>
    </a>
    <a href="https://github.com/linuxserver/docker-onlyoffice" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/onlyoffice-logo.png" alt="onlyoffice logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">onlyoffice</span>
    </a>
    <a href="https://github.com/linuxserver/docker-opera" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/opera-icon.png" alt="opera logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">opera</span>
    </a>
    <a href="https://github.com/linuxserver/docker-pcsx2" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/pcsx2-logo.png" alt="pcsx2 logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">pcsx2</span>
    </a>
    <a href="https://github.com/linuxserver/docker-pidgin" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/pidgin-logo.png" alt="pidgin logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">pidgin</span>
    </a>
    <a href="https://github.com/linuxserver/docker-qdirstat" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/qdirstat-logo.png" alt="qdirstat logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">qdirstat</span>
    </a>
    <a href="https://github.com/linuxserver/docker-rawtherapee" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/rawtherapee-logo.png" alt="rawtherapee logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">rawtherapee</span>
    </a>
    <a href="https://github.com/linuxserver/docker-remmina" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/remmina-icon.png" alt="remmina logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">remmina</span>
    </a>
    <a href="https://github.com/linuxserver/docker-retroarch" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/retroarch-logo.png" alt="retroarch logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">retroarch</span>
    </a>
    <a href="https://github.com/linuxserver/docker-rpcs3" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/rpcs3-logo.png" alt="rpcs3 logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">rpcs3</span>
    </a>
    <a href="https://github.com/linuxserver/docker-rustdesk" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/rustdesk-logo.png" alt="rustdesk logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">rustdesk</span>
    </a>
    <a href="https://github.com/linuxserver/docker-shotcut" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/shotcut-logo.png" alt="shotcut logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">shotcut</span>
    </a>
    <a href="https://github.com/linuxserver/docker-spotube" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/spotube-logo.png" alt="spotube logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">spotube</span>
    </a>
    <a href="https://github.com/linuxserver/docker-sqlitebrowser" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/proot-apps/refs/heads/master/metadata/img/sqlitebrowser.svg" alt="sqlitebrowser logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">sqlitebrowser</span>
    </a>
    <a href="https://github.com/linuxserver/docker-ungoogled-chromium" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/ungoogled-chromium-logo.png" alt="ungoogled-chromium logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">ungoogled-chromium</span>
    </a>
    <a href="https://github.com/linuxserver/docker-vscodium" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/vscodium-icon.png" alt="vscodium logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">vscodium</span>
    </a>
    <a href="https://github.com/linuxserver/docker-webcord" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/webcord-icon.png" alt="webcord logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">webcord</span>
    </a>
    <a href="https://github.com/linuxserver/docker-webtop" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/webtop-logo.png" alt="webtop logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">webtop</span>
    </a>
    <a href="https://github.com/linuxserver/docker-wireshark" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/wireshark-icon.png" alt="wireshark logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">wireshark</span>
    </a>
    <a href="https://github.com/linuxserver/docker-wps-office" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/wps-office-icon.png" alt="wps-office logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">wps-office</span>
    </a>
    <a href="https://github.com/linuxserver/docker-xemu" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/xemu-logo.png" alt="xemu logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">xemu</span>
    </a>
    <a href="https://github.com/linuxserver/docker-yaak" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/yaak-logo.png" alt="yaak logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">yaak</span>
    </a>
    <a href="https://github.com/linuxserver/docker-zen" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/zen-logo.png" alt="zen logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">zen</span>
    </a>
    <a href="https://github.com/linuxserver/docker-zotero" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/zotero-icon.png" alt="zotero logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">zotero</span>
    </a>
</div>

---

<iframe width="560" height="315" src="https://www.youtube.com/embed/FkW9AxYaRWI?si=TkuqAn7hrWN3SFul" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
