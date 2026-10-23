---
title: "Webtop 3.0 Part 1: A Call to Action!"
date: 2025-05-22T17:02:00Z
tags:
  - Selkies Project
  - Linux Desktop Browser
  - Hybrid VNC Protocol
  - Open Source Remote Desktop
  - High Performance Streaming
  - Low Latency Web Desktop
  - CPU-Centric Remote Access
  - 60fps Linux Streaming Efficient VNC Modern Video Codec Protocol
  - Pixelflux
  - Web-Delivered Applications
hero: ./banner.jpg
---

For years, we've dreamed of running full-fledged Linux desktop applications seamlessly within a web browser. While solutions exist, they often come with a hefty price: sluggish performance, high server costs, or a dependency on powerful, specialized hardware. Today, we're unveiling a new approach, a **hybrid VNC and Video Codec protocol**, poised to change the game, and we're calling on **you, the open-source community**, to help build the next generation of applications upon it.

## The Hybrid Marvel: VNC's Smarts Meet Modern Video Power

Our new protocol isn't about reinventing the wheel; it's about combining the best of existing technologies in a novel way.

*   **VNC's Legacy: Damage Tracking Perfected:** Traditional VNC (Virtual Network Computing) excels at identifying *only the parts of the screen that have changed* (damaged regions). This is incredibly efficient for static or slowly changing content.
*   **Modern Video Codecs: Streaming Performance:** Codecs like H.264 are fantastic for delivering smooth video.

**Our Innovation:** We use VNC-like damage detection to define discrete horizontal "stripes" of the screen. Instead of encoding the entire screen or relying on complex scene analysis, we treat each *active* stripe as an independent encoding pipeline. The `pixelflux` module, which powers this, is fundamentally designed for broad compatibility, capable of ingesting any RGB framebuffer source. This architectural choice means it's not limited to a single platform; while currently optimized for X11 Shared Memory on Linux for maximum performance, its design allows for future extensions to support other sources like those on OSX, Windows, or Wayland/WLRoots environments—essentially, anything that can provide an RGB framebuffer. `pixelflux` then operates in distinct output modes: either **JPEG mode** or **H.264 mode**.

### Stripes = Parallelism = Efficiency on Commodity Hardware

Imagine your screen divided into numerous horizontal bands. When you move your mouse, type text, or drag a window, only the affected stripes are re-encoded and sent to the client.

<video controls playsinline preload="metadata" src="/media/webtop-3-0-part-1-a-call-to-revolutionize-web-based-linux-desktops/stripes.mp4" aria-label="stripes"></video>

This "striped" approach allows for incredible parallelism. Each stripe can be processed by a separate CPU core. This means, for the first time, delivering a **true 60fps desktop experience over the web is efficiently achievable on low-end x86 or even ARM CPUs**, without requiring specialized GPU hardware for encoding.

### Beyond Traditional Streaming & Browser Isolation

This isn't just another video stream of your desktop:

*   **No Nvidia Tax:** Unlike solutions that offload encoding to powerful (often Nvidia) GPUs, our protocol is CPU-centric by design, leveraging multi-core architectures efficiently.
*   **Peak Efficiency & Fidelity:** By only encoding what's necessary and doing so in highly optimized, parallel stripes, we achieve what we believe is the **most efficient, highest-fidelity form of browser-based application delivery available today and it isn't even close**. This even surpasses many GPU-accelerated browser isolation technologies in terms of system resource utilization for typical productivity tasks.

## The "Stripe Protocol" in Action: JPEG & H.264 Modes

The beauty of this protocol lies in its simplicity and the dramatic results it yields. At its core, the server captures the screen, identifies changed stripes, and sends them to the client over a WebSocket, using either JPEG or H.264 for the stripes based on the selected mode.

### H.264 Mode Stripes: For Fluid Motion and Keyframe Refinement

When `pixelflux` is operating in **H.264 mode**:
*   Stripes with dynamic content (scrolling, window dragging, animations) are encoded as H.264 stripes, providing fluid motion.
*   For "paint-over" logic in H.264 mode, if a stripe becomes static, the system will **force an H.264 IDR frame (keyframe)** for that stripe. This ensures that the static region is refreshed with a full-quality intra-coded frame, effectively "painting over" any compression artifacts from previous predictive frames and providing a sharp image.

Each active screen stripe essentially gets its own lightweight, real-time H.264 encoder instance (using `x264` with `ultrafast` preset and `zerolatency` tune). The client maintains a `VideoDecoder` for each stripe Y-coordinate that has sent H.264 data. This ensures that updates are correctly placed and decoded independently, leading to a responsive, high-frame-rate experience.

### JPEG Mode Stripes: For Clarity and Static Content Refinement

When `pixelflux` is operating in **JPEG mode**:
*   Changed stripes are initially encoded as JPEGs.
*   For "paint-over" logic, if a stripe remains static for a user-configurable number of frames, a **new, higher-quality JPEG** (using `paint_over_jpeg_quality`) is sent for that stripe. This ensures visual fidelity sharpens up quickly on static areas.

The C++ `pixelflux` library handles the JPEG encoding for these stripes, including a small header containing a frame counter and the stripe's Y-offset. The Python server then wraps this in a message indicating it's a JPEG stripe before sending it over the WebSocket.

### Revolutionary Results: Drastically Lower TCO

The simplicity of this idea belies its profound impact, especially on Total Cost of Ownership (TCO) for server operators:

*   **Up to 75% Reduced CPU Load:** For "productivity content" (office applications, web browsing, software development – not fullscreen 3D gaming), servers running applications with this protocol can see CPU load drop by as much as 75% compared to traditional full-screen video streaming solutions.
*   **Up to 75% Reduced Bandwidth:** Similarly, bandwidth consumption for these productivity workloads can be slashed by up to 75% over time, as only the changed portions of the screen are transmitted. Static screens consume minimal bandwidth with typical CPU encoders.

This efficiency means you can host more users per server, use less powerful (and cheaper) hardware, and significantly cut down on operational costs. All these quality and behavior settings (like JPEG quality, paint-over quality, H.264 CRF, and paint-over trigger frames) are exposed and configurable by the user or application.

## A Call to Open Source Developers: We need to build the future.

The core technology is here, you can see it with your own eyes, and it's incredibly efficient. Now, we need **you** – the talented open-source developers, the innovators, the Linux enthusiasts – to take this foundation and build the next generation of web-delivered desktop applications.

### How It Works: The Layered Stack

Let's briefly look at the components that make this possible:

1.  **`pixelflux` - The C++ Capture & Encode Engine:**
    *   [Source Code](https://github.com/linuxserver/pixelflux)
    *   At the very core is a highly optimized C++ shared library, `pixelflux`.
    *   It leverages X11 Shared Memory (`XShm`) for extremely fast, low-overhead screen capture.
    *   It implements intelligent stripe generation and hashing (XXHash) to detect changed screen regions.
    *   It operates in one of two main `OutputMode`s: `JPEG` or `H264`.
    *   For changed stripes, it uses multi-threading to dispatch encoding tasks:
        *   **In JPEG Mode:** Uses `libjpeg-turbo`. If `use_paint_over_quality` is enabled, static stripes are re-encoded with `paint_over_jpeg_quality`.
        *   **In H.264 Mode:** Manages a pool of `x264` encoder instances. If a stripe becomes static, it forces an IDR frame for that stripe to ensure clarity. It uses `libyuv` for RGB to I420 conversion.
    *   The C++ module provides a callback mechanism to a host application (e.g., Python) to deliver the `StripeEncodeResult`.

2.  **Python Server Logic - The Orchestrator:**
    *   [Source Code](https://github.com/selkies-project/selkies/tree/main/src/)
    *   The Python server code orchestrates.
    *   It imports and uses the `pixelflux` C++ library.
    *   It manages WebSocket connections.
    *   It handles dynamic settings adjustments from the client.

3.  **Selkies Core JS - The Client-Side Renderer:**
    * [Source Code](https://github.com/selkies-project/selkies/tree/main/addons/gst-web-core)
    *   The JavaScript library (`selkies-core.js`) runs in the browser.
    *   Establishes the WebSocket to the Python server.
    *   Receives binary messages containing image stripes.
    *   Handles input and communicates with a dashboard UI via `window.postMessage`.

4.  **Custom Dashboards - Your Brand, Your Interface:**
    *   [Source Code](https://github.com/selkies-project/selkies/tree/main/addons/selkies-dashboard)
    *   The React dashboard code is an example. Use any framework.
    *   Sends settings and commands to `selkies-core.js`.
    *   Receives and displays stats.
    *   Allows for complete white-label solutions.

### The Vision: A New Standard for Web-Native Remote Desktops

We are specifically calling out to developers who:

*   Package complex desktop applications into Docker containers.
*   Build and maintain containerized Linux desktop environments (KDE, GNOME, XFCE, etc.).
*   Are looking for a way to make these applications accessible via the web with unparalleled performance and efficiency.

Imagine your sophisticated CAD software, your intricate IDE, or your full-featured office suite running in a lightweight container, instantly available in any modern web browser, feeling almost native, all while drastically reducing your server footprint. This hybrid VNC/Video protocol, with its web-native design (WebSockets + Canvas + VideoDecoder API), has the potential to become the **new standard for remote display**.

## The Foundation: The Selkies Project

This innovative hybrid protocol doesn't exist in a vacuum. It builds upon the foundation and experience of the **Selkies project**, a longstanding and ambitious open-source initiative. Selkies is far more than just a demonstration platform for this new protocol; it's a mature project with a clear and vital goal: **to provide a powerful, open-source solution for streaming full Linux desktops and demanding graphical applications to any web browser.**

For years, Selkies has been tackling the "Linux Remote Desktop Protocol Problem"—the challenge of delivering high-performance, low-latency remote access to Linux environments, especially for GPU-accelerated workloads in HPC, AI, and scientific visualization, without resorting to expensive or restrictive proprietary solutions. The project's mission is to bring the governance of remote HPC and interactive computing back to the open-source community.

[Dan Isla](https://github.com/danisla): Project Founder, Owner, Head Maintainer (Start - Sep 2023, August 2024 -), Industry Representative (ex-Google, ex-NASA, ex-itopia)

[Seungmin Kim](https://github.com/ehfd): Co-Owner, Head Maintainer (Apr 2022 - August 2024, est. 2025 -), Academia Representative (Yonsei University College of Medicine, San Diego Supercomputer Center)

**Key Merits and Why Selkies is Central to this New Protocol:**

*   **Proven Track Record & Open Philosophy:** Selkies has a history of developing and integrating technologies for robust remote graphics. Its open-source nature (MPLv2) encourages community involvement and customization.
*   **Web-Native & Accessible:** From its inception, Selkies has embraced web standards like HTML5 and WebRTC, aiming for maximum client accessibility across devices and platforms.
*   **Designed for Modern Workloads & Deployment:** It's built with containerization (Docker, Kubernetes) in mind, making it ideal for scalable deployment in cloud and HPC environments. It supports GPU acceleration for both the applications and the video encoding process itself.
*   **Direct Inspiration and Evolutionary Path:** The `pixelflux` engine and the striped encoding strategy detailed in this post are a direct evolution of research and development within the Selkies ecosystem. Selkies provided the ideal testbed and existing architecture to pioneer this highly efficient CPU-centric approach alongside its existing GPU-accelerated WebRTC/GStreamer capabilities.
*   **Comprehensive Solution:** The Selkies project already integrates many of the necessary components that work in concert with the new protocol:
    *   **Containerized Applications:** Running diverse Linux applications or full desktops.
    *   **`pixelflux` Integration:** The core C++ capture and striped encoding engine is a key component.
    *   **Python Orchestration:** Mature server-side logic for managing WebSockets, client interactions, and data flow.
    *   **`selkies-core.js` Client:** A robust JavaScript library for browser-side rendering, input handling, and communication.
    *   **Flexible Media Handling:** While this post focuses on the new striped `pixelflux` protocol, the broader Selkies framework also supports traditional GStreamer-based WebRTC/WebSocket video delivery, offering flexibility depending on the use case.

Essentially, Selkies provides the battle-tested framework and the visionary drive that made the development of this new, highly efficient protocol possible. It showcases how these advanced streaming capabilities can be integrated into a complete, user-ready system for delivering rich interactive experiences.

## Developer-Focused Images Now Available

Leveraging our vertical integration, from pixel rendering to the web browser, and our commitment to open-source principles, we've seized a unique opportunity to embed a dedicated development mode into every image produced by Linuxserver.io. These are fully compatible with our new Baseimages, accessible [HERE](https://github.com/linuxserver/docker-baseimage-selkies/).
To deploy a rapid development environment, simply clone the source code and mount it into the image while passing the `DEV_MODE` flag. For instance, for dashboard development:

```
git clone https://github.com/selkies-project/selkies.git
cd selkies
docker run --rm -it \
  --shm-size=1gb \
  -e DEV_MODE=selkies-dashboard \
  -e PUID=1000 \
  -e PGID=1000 \
  -v $(pwd):/config/src \
  -p 3001:3001 linuxserver/webtop bash
```

Any code modifications within `/addons/selkies-dashboard` will trigger an automatic rebuild and redeployment to HTTPS on port 3001 via Vite. This powerful concept extends to development on the server and core scripts using `DEV_MODE=core`. Furthermore, you can introduce a completely new dashboard in `/addons/my-new-dashboard` and iterate on its development with `DEV_MODE=my-new-dashboard`. Our goal is to significantly lower the barrier to entry, enabling even "vibe coders" to craft unique, custom dashboards, potentially down to individual application levels. If you identify as a vibe coder, you can feed `/addons/selkies-dashboard/src/components/Sidebar.jsx` to your preferred AI API, paste the results, and witness live updates within a real desktop session—its single-file structure is intentional, facilitating this rapid iteration.

Our "zero security" model, which anticipates that authentication into the images will be managed externally to our stack, has enabled us to open powerful avenues for frontend developers. The reference implementation in the `/addons/selkies-dashboard/` example utilizes window post messages to construct an entire application library and implement installation features without altering any core logic, relying on simple window messages and bash commands. For example:
```
console.log(`Install app: ${appName}`);
window.postMessage({
  type: "command",
  value: `st ~/.local/bin/proot-apps install ${appName}`,
},window.location.origin);
```
You might even envision moving beyond the traditional dashboard concept. Consider rendering a simple PCManFM Openbox desktop, where your "Dashboard" manifests as a start menu at the bottom, launching and managing application installations. The possibilities are truly limitless.

We are actively developing our final standard dashboard [HERE](https://github.com/selkies-project/selkies/tree/main/addons/selkies-dashboard-zinc) for the non vibe crowd and are looking for participation. 

## Demo Images Now Available

We did not forget about the users in this tech preview, we have created two webtop tags `debian-kde` and `ubuntu-mate`. 

The most basic run commands.
CPU only:
```
docker run --rm -it \
 -p 3001:3001 \
 --shm-size=1gb \
 linuxserver/webtop:ubuntu-xfce bash
 ```
Nvidia support:
```
docker run --rm -it \
 -p 3001:3001 \
 --gpus all \
 --runtime nvidia \
 --shm-size=1gb \
 linuxserver/webtop:ubuntu-xfce bash
```

### Demo images improvements


#### Internationalization built in

All images have internationalization support and fonts installed by default: 

* `-e LC_ALL=zh_CN.UTF-8` - Chinese
* `-e LC_ALL=ja_JP.UTF-8` - Japanese
* `-e LC_ALL=ko_KR.UTF-8` - Korean
* `-e LC_ALL=ar_AE.UTF-8` - Arabic
* `-e LC_ALL=ru_RU.UTF-8` - Russian
* `-e LC_ALL=es_MX.UTF-8` - Spanish (Latin America)
* `-e LC_ALL=de_DE.UTF-8` - German
* `-e LC_ALL=fr_FR.UTF-8` - French
* `-e LC_ALL=nl_NL.UTF-8` - Netherlands
* `-e LC_ALL=it_IT.UTF-8` - Italian

And many more!

#### Gamepad support

Using a new userspace gamepad interposer [HERE](https://github.com/selkies-project/selkies/tree/feature/websockets/addons/js-interposer) we are able to enable gamepad support in rootless containers. This currently supports evdev and Linux raw device detection with udev support coming soon. 

Also included is a touchscreen gamepad emulator to enable mobile users to play found [HERE](https://github.com/selkies-project/selkies/tree/feature/websockets/addons/universal-touch-gamepad). 

#### Creature comforts

* Drag and drop file support, just drag the files into the window or use the upload button
* A new fullscreen and "Gaming" mode leveraging the pointer lock API
* Improved Microphone support
* VBR crystal clear OPUS audio spinning down to 70 kbps on silence
* [PRoot-Apps](https://github.com/linuxserver/proot-apps) baked right into the web interface
* New advanced screen controls and local scaling modes. 

#### Coming soon

* websocket.broadcast - shared modes and collaboration with no additional encoding. 
* WebRTC - Restore and modernize previous modes.
* [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport) - Enable modern UDP to browser. 
* Enterprise base images for VFX appplications, EL9/8.
* Expansion of striped settings - color space, RGB paint overs, lossless modes, adjusting CRF for damage, and more.
* Improved Nvidia support - Cudaconvert and advanced settings. 
* Enterprise grade backpressure controls.
* Clientside framebuffer and frame sync settings.

## Get Involved & Shape the Future!

This is more than just a new protocol; it's a paradigm shift in how we can deliver rich application experiences over the web. The foundation is robust, the C++ capture and encoding are highly optimized, the Python server logic is straightforward, and the client-side JavaScript leverages modern browser APIs for maximum performance.

*   **Explore the Code:** Dive into the provided C++, Python, and JavaScript snippets to understand the mechanics.
*   **Build On It:** Fork the concept, adapt it, integrate it into your projects.
*   **Contribute:** We envision a thriving open-source ecosystem around this. Share your ideas, improvements, and applications.
*   **Showcase:** Create novel use-cases. Stream your favorite Linux tools, build collaborative environments, or power remote education platforms.
*   **Request:** We encourage you to file any feature requests or bug reports [HERE](https://github.com/linuxserver/docker-baseimage-selkies/issues). During this pivotal phase, we're suspending the usual "rules" for feedback. We want your direct, unfiltered input to help us make this the absolute best it can be.

Let's work together to make high-performance, low-cost, web-based Linux desktops a reality for everyone. The future is striped, and it's incredibly exciting!
