---
title: "Webtop 3.0 Part 3: Putting it all together with SealSkin"
date: 2025-11-21T18:35:00Z
tags:
  - VDI
  - Self-hosted
  - Selkies Project
  - Webtop
  - Remote Desktop
  - SealSkin
  - Docker Containers
  - Browser OS
  - Linux Gaming
  - Cybersecurity
  - Collaboration
  - 4-player splitscreen
hero: ./00015.jpg
---

It has been a long journey from our first experiments with **Taisun** to the polished desktop containers we maintain today. We started by simply trying to put a desktop in a browser. With **WebTop**, we refined that vision using open-source RDP and VNC technologies. Then, we integrated **KasmVNC** for a modern, web-first VNC experience. After that, we worked with the **Selkies** project to pioneer a high-performance, low-latency video delivery stack designed for graphics-intensive workloads.

While we had the engine we lacked the vehicle. We needed a cohesive platform to manage these applications, secure the connection, and integrate them seamlessly into your daily browsing experience without requiring you to write a Docker Compose file for every single application you wanted to try.

Today, we are proud to introduce the culmination of years of development: **SealSkin**.

[https://github.com/linuxserver/docker-sealskin](https://github.com/linuxserver/docker-sealskin)

[https://github.com/selkies-project/sealskin](https://github.com/selkies-project/sealskin)

**Please use the provided run/compose example, unlike most applications this is not designed to work with a reverse proxy**

## What is SealSkin?

![sealskin_screenshot1](./sealskin-screenshot1.png?link "sealskin_screenshot1")

SealSkin is the glue that binds our entire desktop ecosystem together. It is a self-hosted, client-server platform composed of a **[Server Container](https://github.com/linuxserver/docker-sealskin)** and a **[Browser Extension](https://chromewebstore.google.com/detail/sealskin-isolation/lclgfmnljgacfdpmmmjmfpdelndbbfhk)**.

The philosophy is simple: **The browser is your operating system.** SealSkin intercepts your intent—whether that is clicking a link, downloading a file, or launching a shortcut—and redirects that action to a secure, isolated container running on your remote server.

### The Return of the Mainframe

In many ways, we are bringing back the "Mainframe" style of computing, but modernized for 2025.

Equip your students or employees with lightweight, inexpensive Chromebooks or older laptops. These devices don't need powerful GPUs or massive hard drives. They just need a browser. All the heavy lifting—compiling code, rendering 3D models, or processing video—happens on your powerful self-hosted server. You get the performance of a workstation with the portability of a tablet.

## Real World Use Cases

We didn't build this just to look cool; we built it to solve problems we face every day.

**1. The "Shady Link" & Malware Isolation**
You receive an email with a suspicious `.docx` attachment, or you need to visit a website you don't trust. Instead of downloading it to your local machine, you right-click and select "Send to SealSkin."
The extension intercepts the download, streams it in chunks to the server (never writing the full file to your local disk), and automatically launches **LibreOffice** or **OnlyOffice** in a secure container to open it.
For security researchers, you can spin up our **Kali Linux** image. This gives you a completely isolated lab environment to analyze threats without risking your local network. When you are done, the container evaporates, and the threat is gone.

**2. Instant Media Editing**
You find an image or a video clip online that you need to edit. Instead of downloading, saving, opening your local editor, and importing, you simply right-click the asset. SealSkin spins up **GIMP**, **Krita**, or **Shotcut** with that file pre-loaded. You leverage your server's power to render the edit, save the result to your persistent storage, and you are done.

**3. Technical Interviews & Coaching**
In SealSkin , Because the sessions are disposable containers, you can spin up a coding environment (like **VSCodium**), invite a candidate or a junior developer, and pass keyboard and mouse control back and forth instantly.
You can coach them through a problem, watch their workflow, and when the interview is over, you destroy the session. There is no software installed on their machine, and no residual access or files left on yours.

## The App Laboratory: No Dockerfile Required

![lab](./lab.jpg?link "lab")

One of the biggest barriers to entry for self-hosting desktop apps is the complexity of configuration. We hope to have solved this with the **App Laboratory**.

The workflow is designed for the GUI user, not the CLI expert:
1.  **Launch a Base:** Start a session with a base image or an existing app.
2.  **Customize:** Inside the running session, install the software you need, configure your browser bookmarks, set up your code editor themes, or download course materials.
3.  **Commit:** Save the state of your home directory.

SealSkin treats this committed home directory as a template. You can now create a new "App" entry that uses that specific home directory configuration. This is perfect for setting up pre-configured environments for education, specific development workflows, or gaming setups.

## App Templates: Granular Control & Hardening

Once you have created an app, you might want to restrict what a user can do with it. This is where **App Templates** come in.

Using a simple GUI in the dashboard, you can apply a template to any application that manipulates the underlying environment variables of our base image. This allows for extreme granularity in security and user experience:

*   **Kiosk Mode:** Disable window decorations, force fullscreen, and hide the sidebar.
*   **Hardening:** Disable `sudo`, remove terminal emulators, and block the ability to execute `xdg-open` commands.
*   **UI Locking:** Lock specific settings like bitrate, framerate, or encoding quality so users cannot modify the stream.
*   **UI Customization:** Customize the look of the launched application's settings showing or hiding options that do not apply to your audience, even down to removing Selkies branding.

This is ideal for creating a "Public Browser" app that allows a user to browse the web using Chromium, but prevents them from accessing the terminal, changing settings, or modifying the container environment.

## Gaming on the Web

![collab](./collab.jpg?link "collab")

We have talked about performance before, but SealSkin's integration with the **Selkies** streaming stack allows for genuine gaming experiences.

**Pointer Lock for FPS**
Most web-based remote desktops fail at First Person Shooters because the mouse cursor hits the edge of your screen. SealSkin utilizes the browser's **Pointer Lock API** to capture raw mouse input. This means you can play classic arena shooters or modern DRM-free titles with pixel-perfect 360-degree aiming.

**4-Player Local Co-Op (Remotely)**
SealSkin supports up to **4 physical gamepads** passed through to the container simultaneously.
*   Spin up an emulator and play **classic kart racers** split-screen.
*   Launch an emulator for some **4-player arcade beat 'em up** action.
*   Play **split-screen shooters** with friends from different locations.

*Note: While Linux gaming is exploding, we do not provide pre-made images yet for platforms like Steam or EmuDeck due to Docker permission complexities. However, the ecosystem is open for you to bring your own DRM-free Linux native games or set up your own emulators and launch logic via the App Lab.*

## Collaboration: The Virtual Couch

SealSkin features a robust collaboration mode. Both the single-user stream and the collaboration features use a custom Server-Client WebSocket protocol. This ensures high stability, low resource usage (the server encodes once and broadcasts to many), and better compatibility with restrictive firewalls.

As the session controller, you can invite friends via a link. You can then assign input methods to them. You can give "Player 2" control of the second gamepad slot, or pass keyboard and mouse control to a collaborator. It is the virtual equivalent of handing your friend a controller on the couch. You can also invite **Read-Only** users with only basic permissions to chat and view the stream and collaboration.

## File Management & Storage

SealSkin isn't just about apps; it's about data. The platform includes a **File Manager** that allows you to:
*   **Manage Multiple Home Directories:** Keep your "Work" files separate from your "Gaming" configs.
*   **Public Sharing:** Generate public, time-limited, password-protected links to files on your server.
*   **Secure Uploads:** Uploads are chunked and streamed, ensuring reliability even with large files.

While SealSkin currently uses file-based storage, the architecture is designed to be pluggable in the future, with eyes on object storage support for multi-server deployments in the future.

## Hardware & Software Requirements

**Runs on Anything**
You do **not** need a GPU to run SealSkin. The software encoding is highly optimized and runs great on modest hardware while also sipping bandwidth. However, if you have an Nvidia, AMD, or Intel GPU, SealSkin can leverage it for both hardware video encoding and 3D acceleration inside the container.

**Browser Support**
Currently, SealSkin is optimized for **Desktop Chromium-based browsers** (Chrome, Edge, Brave, Vivaldi).
*   **Mobile/iOS:** We are working on it, but Apple's Safari currently lacks support for `MediaStreamTrackProcessor`, which prevents our video collaboration features from working on iOS devices.
*   **Firefox:** Supported, but performance is generally better on Chromium and we currently lack a Firefox browser extension (collaboration client only).

**Internationalization**
We want this to be a global platform. SealSkin along with Selkies is fully localized for the following languages:
*   English (en)
*   Spanish (es)
*   Chinese (zh)
*   Hindi (hi)
*   Portuguese (pt)
*   French (fr)
*   Russian (ru)
*   German (de)
*   Turkish (tr)
*   Italian (it)
*   Dutch (nl)
*   Arabic (ar)
*   Korean (ko)
*   Japanese (ja)
*   Vietnamese (vi)
*   Thai (th)
*   Filipino (fil)
*   Danish (da)

All language configuration is automatic including launching the applications and desktop sessions in the user's native language.

![korean](./korean.jpg?link "korean")

## A Note on Security & Auth

You will notice that setting up SealSkin requires juggling RSA keys. We acknowledge this is a bit more complex than a simple username/password, but it is intentional.
**We do not store authentication credentials on the server.**
By using public/private key cryptography, we ensure that even if your server database were compromised, there are no passwords to steal. For a self-hosted platform exposed to the internet, we believe this is the only bulletproof way to handle authentication for an initial rollout. A user is incapable of generating an insecure configuration with both ports being designed to be exposed to the internet.

This is not a guarantee, but we have done our best to ensure this is ready to go out of the box.

## The Open App Store: It's Just YAML

We do not believe in walled gardens. The "App Store" in SealSkin isn't a proprietary database or a gatekept marketplace; it is a simple YAML file hosted at a URL.

By default, SealSkin points to our [Official App Repository](https://github.com/linuxserver/sealskin-apps), but you are free to change this. This means anyone—enterprises, universities, or hobbyist communities—can host their own "Store" simply by hosting a text file.

### How it Works

The system relies on a manifest file named `apps.yml`. This file defines:
1.  **Extension Groups:** Reusable buckets of file extensions (e.g., `*common_image_files` for jpg, png, gif).
2.  **App Definitions:** The Docker image to pull, the internal port, and hardware requirements (like GPU support).
3.  **Capabilities:** Whether the app can open URLs or specific file types.

If you have built a custom image based on our **Selkies Base Image**, adding it to SealSkin is as simple as adding an entry to your YAML file:

```yaml
  - id: my-custom-app
    name: My Corporate Tool
    provider: docker
    provider_config:
      image: my-registry.com/my-tool:latest
      port: 3000
      nvidia_support: true
      open_support: true
      extensions:
        - *text_files
```

### Custom Launch Logic

For the magic that allows you to right-click a file in Chrome and have it appear inside the remote application, we use **Autostart Scripts**. These are simple shell scripts associated with the app that handle the logic of taking the file path passed by SealSkin and launching the application command (e.g., `gimp /tmp/downloaded_image.png`).

You can view the structure, the `apps.yml` spec, and all our autostart logic at our repository:
[https://github.com/linuxserver/sealskin-apps](https://github.com/linuxserver/sealskin-apps)

## The Library

Our entire desktop catalog based on Selkies baseimages works with SealSkin. Here is what is available right now:

**WebTop Flavors**

**lscr.io/linuxserver/webtop:TAGNAME**

| Tag | Desktop | Distro |
| :--- | :--- | :--- |
| `latest` | XFCE | Alpine |
| `alpine-i3` | i3 | Alpine |
| `alpine-mate` | MATE | Alpine |
| `arch-i3` | i3 | Arch |
| `arch-kde` | KDE | Arch |
| `arch-mate` | MATE | Arch |
| `arch-xfce` | XFCE | Arch |
| `debian-i3` | i3 | Debian |
| `debian-kde` | KDE | Debian |
| `debian-mate` | MATE | Debian |
| `debian-xfce` | XFCE | Debian |
| `el-i3` | i3 | Enterprise Linux |
| `el-mate` | MATE | Enterprise Linux |
| `el-xfce` | XFCE | Enterprise Linux |
| `fedora-i3` | i3 | Fedora |
| `fedora-kde` | KDE | Fedora |
| `fedora-mate` | MATE | Fedora |
| `fedora-xfce` | XFCE | Fedora |
| `ubuntu-i3` | i3 | Ubuntu |
| `ubuntu-kde` | KDE | Ubuntu |
| `ubuntu-mate` | MATE | Ubuntu |
| `ubuntu-xfce` | XFCE | Ubuntu |

**Application Containers**

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
    <a href="https://github.com/linuxserver/docker-azahar" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/azahar-logo.png" alt="azahar logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">azahar</span>
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
    <a href="https://github.com/linuxserver/docker-citron" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/citron-logo.png" alt="citron logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">citron</span>
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
    <a href="https://github.com/linuxserver/docker-dosbox-stating" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/dosbox-logo.png" alt="dosbox logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">dosbox staging</span>
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
    <a href="https://github.com/linuxserver/docker-handbrake" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/handbrake-logo.png" alt="handbrake logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">handbrake</span>
    </a>
    <a href="https://github.com/linuxserver/docker-inkscape" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/inkscape-logo.png" alt="inkscape logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">inkscape</span>
    </a>
    <a href="https://github.com/linuxserver/docker-intellij-idea" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/intellij-idea-logo.png" alt="intellij-idea logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">intellij-idea</span>
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
    <a href="https://github.com/linuxserver/docker-melonds" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/melonds-logo.png" alt="melonds logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">melonds</span>
    </a>
    <a href="https://github.com/linuxserver/docker-modrinth" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/modrinth-logo.png" alt="modrinth logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">modrinth</span>
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
    <a href="https://github.com/linuxserver/docker-orcaslicer" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/orcaslicer-logo.png" alt="orcaslicer logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">orcaslicer</span>
    </a>
    <a href="https://github.com/linuxserver/docker-pcsx2" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/pcsx2-logo.png" alt="pcsx2 logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">pcsx2</span>
    </a>
    <a href="https://github.com/linuxserver/docker-pidgin" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/pidgin-logo.png" alt="pidgin logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">pidgin</span>
    </a>
    <a href="https://github.com/linuxserver/docker-pycharm" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/pycharm-logo.png" alt="pidgin logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">pycharm</span>
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
    <a href="https://github.com/linuxserver/docker-signal" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/signal-logo.png" alt="signal logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">signal</span>
    </a>
    <a href="https://github.com/linuxserver/docker-spotube" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/spotube-logo.png" alt="spotube logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">spotube</span>
    </a>
    <a href="https://github.com/linuxserver/docker-sqlitebrowser" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/proot-apps/refs/heads/master/metadata/img/sqlitebrowser.svg" alt="sqlitebrowser logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">sqlitebrowser</span>
    </a>
    <a href="https://github.com/linuxserver/docker-telegram" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/telegram-logo.png" alt="telegram logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">telegram</span>
    </a>
    <a href="https://github.com/linuxserver/docker-thunderbird" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/thunderbird-logo.png" alt="sqlitebrowser logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">thunderbird</span>
    </a>
    <a href="https://github.com/linuxserver/docker-ungoogled-chromium" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/ungoogled-chromium-logo.png" alt="ungoogled-chromium logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">ungoogled-chromium</span>
    </a>
    <a href="https://github.com/linuxserver/docker-vivaldi" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/vivaldi-logo.png" alt="vivaldi logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">vivaldi</span>
    </a>
    <a href="https://github.com/linuxserver/docker-vlc" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/vlc-logo.png" alt="vlc logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">vlc</span>
    </a>
    <a href="https://github.com/linuxserver/docker-vscodium" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/vscodium-icon.png" alt="vscodium logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">vscodium</span>
    </a>
    <a href="https://github.com/linuxserver/docker-webcord" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/webcord-icon.png" alt="webcord logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">webcord</span>
    </a>
    <a href="https://github.com/linuxserver/docker-weixin" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; background-color: #f9f9f9; transition: box-shadow 0.2s ease-in-out;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.boxShadow='none';">
        <img src="https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/weixin-logo.png" alt="weixin logo" style="width: 128px; height: 128px; object-fit: contain; margin-bottom: 0.5rem;">
        <span style="text-align: center; word-break: break-word;">weixin</span>
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

## Join Us

SealSkin is Open Source. It is self-hosted. It is yours.

This is an **Early Adoption** phase. We have built the foundation, but we need your help to refine it. We invite you to install it, break it, build amazing things in the App Lab, and tell us about it. If you find bugs or have feature requests, please file them [HERE](https://github.com/linuxserver/docker-sealskin)

Hop on our [Discord](https://www.linuxserver.io/discord) and let's build the future of the web-based desktop sessions together.
