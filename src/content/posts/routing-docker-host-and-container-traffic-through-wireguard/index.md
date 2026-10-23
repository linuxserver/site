---
title: Routing Docker Host And Container Traffic Through WireGuard
date: 2022-05-04T08:00:00Z
author: aptalca
tags:
  - linux
  - docker
  - guides
  - how to
  - vpn
  - wireguard
  - routing
  - mullvad
hero: ./petter-lagson-netfkkuo7vy-unsplash.jpg
---

## Table Of Contents:
- [Introduction](#introduction)
- [Routing All Traffic Through WireGuard](#routing-all-traffic-through-wireguard)
- [Routing Docker Container Traffic Through WireGuard](#routing-docker-container-traffic-through-wireguard)
  - [Setting up a container to use the WireGuard container's network stack](#setting-up-a-container-to-use-the-wireguard-containers-network-s)
  - [Routing a container's traffic through the WireGuard container via routing table](#routing-a-containers-traffic-through-the-wireguard-container-via)
     - [Incoming Port Forwarding](#incoming-port-forwarding)
- [Further Reading](#further-reading)

## Introduction

WireGuard is a very simple but fast open source virtual private network (VPN) solution that took the industry by storm. Its code is only about 4,000 lines compared to over 70,000 for OpenVPN, which makes it much easier to audit, and has a relatively small attack surface. Since its incorporation into the linux kernel with version 5.6 in early 2020, its popularity exploded especially in the homelab space.

![wireguard](./wireguard.svg "wireguard")

We originally released [our WireGuard docker image](https://github.com/linuxserver/docker-wireguard) mainly to replace our troublesome OpenVPN server image, which was a fairly popular VPN server solution at the time. However, OpenVPN server is a closed source commercial product, which meant that it was very difficult to fix our image when there were breaking changes as we couldn't even see what they were. And our image frequently broke with updates. We were eager to jump on the WireGuard bandwagon and released the first implementation with the server capabilities built-in and automated in early 2020. While the initial goal was to provide a server solution, we later added the necessary functionality to our image to allow for client and site-to-site VPN scenarios.

** DISCLAIMER: We do not officially provide support for site-to-site VPN configurations as they can be very complex and require specific customization to fit your network setup. We simply do not have the bandwidth to provide individualized support for such scenarios. But you can always seek community support on [our Discord server](https://discord.gg/YWrKVTn?target=_blank)'s #other-support channel. **

Our image also includes the capability to build the WireGuard kernel module if the kernel does not have it built-in. For Ubuntu and Debian based distros, as long as the host is using a stock kernel, our container will automatically install the kernel headers and build the module. If on a different distro or if not using a stock kernel, our container allows for mapping in kernel headers installed on host and will use those to build the module. Alternatively, one can install WireGuard on host and build the module, and our container will detect and use that.

While this image was originally published as a VPN server solution, it has become quite popular as a VPN client due to [recent laws](https://www.aclu.org/blog/privacy-technology/internet-privacy/congress-just-made-it-harder-you-shield-yourself-internet) and attacks on online privacy. Many are turning to commercial VPN providers like [Mullvad](https://mullvad.net/), who promise privacy, and are routing some or all of their traffic through these private remote servers.

In this article, we will highlight three scenarios for how that can be achieved with our WireGuard image. The first scenario will show how the entire traffic from the host can be routed through our WireGuard container operating in client mode, utilizing the host's routing table. The second and the third scenarios will show alternate ways to route select docker container traffic through our WireGuard container.

** DISCLAIMER: This article is not meant to be a step by step guide, but instead a showcase for what can be achieved with our WireGuard image. As with site-so-site VPN mentioned above, we also do not officially provide support for routing whole or partial traffic through our WireGuard container (aka split tunneling) as it can be very complex and require specific customization to fit your network setup and your VPN provider's. But you can always seek community support on [our Discord server](https://discord.gg/YWrKVTn?target=_blank)'s #other-support channel. **

## Routing All Traffic Through WireGuard

In order to route via routing tables, we'll use the container's IP address, therefore it is best that it has a static IP in a defined subnet. Let's first make sure we create a docker bridge network called `wgnet` with a defined subnet via the following command:

```bash
docker network create --subnet 172.20.0.0/24 wgnet
```

Let's inspect our new network via `docker inspect wgnet`:

```json
[
    {
        "Name": "wgnet",
        "Id": "65debd3cb4f053bdb6ccdfd1f60598755041ad17bbcf48c1756930fec74c2b58",
        "Created": "2022-04-16T20:48:45.073776159Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.20.0.0/24",
                    "Gateway": "172.20.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]
```

It is a user defined bridge network with the correct subnet. Now let's check our current routes:

```bash
$ ip route show
default via 192.168.1.1 dev enp1s0 proto dhcp src 192.168.1.209 metric 100
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown
172.20.0.0/24 dev br-65debd3cb4f0 proto kernel scope link src 172.20.0.1 linkdown
192.168.1.0/24 dev enp1s0 proto kernel scope link src 192.168.1.209
192.168.1.1 dev enp1s0 proto dhcp scope link src 192.168.1.209 metric 100
```

We can see that docker automatically created the route for our new bridge network for the subnet `172.20.0.0/24`. However, it is marked as `linkdown` because we don't have any running containers attached to that network yet. According to the these rules, all connections to ranges not specifically defined in the rules will use the `default` rule. Currently all those connections, including all connections to public IPs are routed through our LAN gateway, 192.168.1.1, with our source IP 192.168.1.209, which is the LAN IP of our docker host. Once the WireGuard container is set up and that we have a tunnel up, we'll modify these rules to route everything through the wireguard tunnel instead of our LAN gateway.

Let's first create the config folder for the WireGuard container:

``` bash
mkdir -p /home/aptalca/appdata/wireguard-client
```

Then we'll set up the `wg0.conf` which contains our tunnel details. The following is an example config that I retrieved from my VPN provider Mullvad. When I created it, I selected the options to disable ipv6 so it will only be set up for ipv4 connections. My ISP does not issue ipv6 addresses so I have no need for it. Docker is also tricky with its ipv6 support.

```
[Interface]
PrivateKey = 8AFbMaOQFaOYBrxrq7Kk/mt3jxa5Z1H27CIWNXs4vmY=
Address = 10.64.133.56/32
DNS = 193.138.218.74

[Peer]
PublicKey = M+KYHvnMLh57umbiaBOaivAnProWCAGeQpyFfwFF2iI=
AllowedIPs = 0.0.0.0/0
Endpoint = 89.45.90.197:51820
```

This config defines the private key of our local WireGuard peer, as well as the public key of the WireGuard server we will be connecting. `Address` defines the `tunnel address` Mullvad assigned to our account/peer. `DNS` points to Mullvad's DNS servers but can be changed to anything you like. `AllowedIPs` defines the destination IPs and/or networks for which the connections should be sent through the tunnel. We have it set to `0.0.0.0/0`, aka all networks, which means everything will be sent through the tunnel. And finally, we have `Endpoint` defining the Mullvad WireGuard server's IP address.

With this config, a tunnel will be created and all connections from inside the WireGuard container will be sent through the tunnel. However, we want to route connections from the host, which are coming in from outside the container, we need to tell the container to properly route them. That's where `iptables NAT (network address translation) masquerade` comes in handy. Normally, it can be enabled for the wg0 network via the following command:

```bash
iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE
```

We can easily automate the running of that command by including it in the `PostUp` and `PreDown` sections of the WireGuard config, which define scripts to be run after the WireGuard tunnel is created and before the tunnel is destroyed, respectively. The following statements do just that:

```
PostUp = iptables -t nat -A POSTROUTING -o wg+ -j MASQUERADE
PreDown = iptables -t nat -D POSTROUTING -o wg+ -j MASQUERADE
```

Let's create the final config and save it as `/home/aptalca/appdata/wireguard-client/wg0.conf`:

```
[Interface]
PrivateKey = 8AFbMaOQFaOYBrxrq7Kk/mt3jxa5Z1H27CIWNXs4vmY=
Address = 10.64.133.56/32
DNS = 193.138.218.74
PostUp = iptables -t nat -A POSTROUTING -o wg+ -j MASQUERADE
PreDown = iptables -t nat -D POSTROUTING -o wg+ -j MASQUERADE

[Peer]
PublicKey = M+KYHvnMLh57umbiaBOaivAnProWCAGeQpyFfwFF2iI=
AllowedIPs = 0.0.0.0/0
Endpoint = 89.45.90.197:51820
```

Now we are ready to create our WireGuard container. The following compose yaml will set up a container attached to our `wgnet` network with the static IP `172.20.0.50`. We choose a high number like `50` because docker compose has no way to properly mix and match static and dynamic IP addresses, or in other words proper address reservation. If we have 10 containers listed in the same compose yaml and some have static IPs defined and some don't, docker compose will start assigning IPs to dynamic ones starting with `2` (`1` is assigned to the gateway). It would be nice if it parsed the whole config first, determined the requested static IPs first and reserved them, but it doesn't. By setting the WireGuard container's IP to `50`, we allow ourselves plenty of room for dynamic allocations before that address is dynamically assigned (48 containers before WireGuard to be exact). The `proper way` is to assign every single container a static IP in the compose yaml, instead of mixing and matching, but it could be an undesirable task depending on the number of containers. Let's save the following config as `docker-compose.yml` and issue `docker compose up -d` to create and start it.

```yaml
services:
  wireguard:
    image: lscr.io/linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
    volumes:
      - /home/aptalca/appdata/wireguard-client:/config
      - /lib/modules:/lib/modules
    networks:
      default:
        ipv4_address: 172.20.0.50
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped
networks:
  default:
    name: wgnet
    external: true
```

Once the container is created, let's check the logs to make sure the tunnel is created correctly `docker logs wireguard`:
It should end with the following:
```
[services.d] starting services
[services.d] done.
Warning: `/config/wg0.conf' is world accessible
[#] ip link add wg0 type wireguard
[#] wg setconf wg0 /dev/fd/63
[#] ip -4 address add 10.64.133.56/32 dev wg0
[#] ip link set mtu 1420 up dev wg0
[#] resolvconf -a wg0 -m 0 -x
[#] wg set wg0 fwmark 51820
[#] ip -4 route add 0.0.0.0/0 dev wg0 table 51820
[#] ip -4 rule add not fwmark 51820 table 51820
[#] ip -4 rule add table main suppress_prefixlength 0
[#] sysctl -q net.ipv4.conf.all.src_valid_mark=1
sysctl: setting key "net.ipv4.conf.all.src_valid_mark", ignoring: Read-only file system
[#] iptables-restore -n
[#] iptables -t nat -A POSTROUTING -o wg+ -j MASQUERADE
```
Above, we can see that it created the tunnel with our tunnel address, created a route for `0.0.0.0/0` and finally set up the iptable nat masquerade for routing.
Our routes on host should now show the route for `172.20.0.0/24` as active (no longer marked `linkdown`):

```bash
$ ip route show
default via 192.168.1.1 dev enp1s0 proto dhcp src 192.168.1.209 metric 100
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown
172.20.0.0/24 dev br-65debd3cb4f0 proto kernel scope link src 172.20.0.1
192.168.1.0/24 dev enp1s0 proto kernel scope link src 192.168.1.209
192.168.1.1 dev enp1s0 proto dhcp scope link src 192.168.1.209 metric 100
```

At this point, nothing on the host is routed through WireGuard:

```bash
$ curl https://am.i.mullvad.net/connected
You are not connected to Mullvad. Your IP address is 182.68.23.15
```

In order to route through WireGuard, we first need to delete the `default` route, and create a new default that routes through the WireGuard container. However, doing that will cause a major issue. WireGuard container needs to connect to the Mullvad server, the VPN endpoint, to establish the tunnel. If that connection also gets routed through the container, it will cause a loop and the tunnel will fail. So we need to bypass the tunnel for connections to our VPN endpoint, `89.45.90.197`. These commands will make sure that connections to our VPN endpoint are routed through our LAN gateway, but everything else goes through the WireGuard container:

```bash
sudo ip route del default
sudo ip route add 89.45.90.197 via 192.168.1.1
sudo ip route add default via 172.20.0.50
```

Now let's check our updated routes:

```bash
$ ip route
default via 172.20.0.50 dev br-65debd3cb4f0
89.45.90.197 via 192.168.1.1 dev enp1s0
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown
172.20.0.0/24 dev br-65debd3cb4f0 proto kernel scope link src 172.20.0.1
192.168.1.0/24 dev enp1s0 proto kernel scope link src 192.168.1.209
192.168.1.1 dev enp1s0 proto dhcp scope link src 192.168.1.209 metric 100
```

`89.45.90.197 via 192.168.1.1 dev enp1s0` ensures connections to the VPN endpoint bypasses the tunnel and `default via 172.20.0.50 dev br-65debd3cb4f0` ensures all others go through the WireGuard container on the `wgnet` bridge network.
Let's check our internet connection:

```bash
$ curl https://am.i.mullvad.net/connected
You are connected to Mullvad (server us68-wireguard). Your IP address is 89.45.90.206
```

Voila, our host connections to the internet are now being routed through the WireGuard container and go out through the Mullvad endpoint. In this scenario, since all host connections are going through the tunnel, by default all other docker containers' connections will also go through the WireGuard tunnel.

However, keep in mind that the routing table is dynamically generated on reboot, where some of the entries are created by the docker service, and some by whichever daemon is managing the network connection (on recent Ubuntu it is `netplan`) so all these changes will be lost when we restart our host. There are various ways to make sure these routes are applied on restart. Creating a systemd service is just one way. 

On Ubuntu with systemd for example, we can create a new service file `/lib/systemd/system/iproute.service`, with the following contents:

```
[Unit]
Description=Route everything through WireGuard
After=docker.service

[Service]
Type=oneshot
Restart=on-failure
ExecStart=ip route del default
ExecStart=ip route add 89.45.90.197 via 192.168.1.1
ExecStart=ip route add default via 172.20.0.50

[Install]
WantedBy=multi-user.target
```

Then we can enable our service with `sudo systemctl enable iproute.service`. When we reboot our host, this service will wait until the docker service is started (we need the WireGuard container to be running) and then it will run the commands to change the default route to WireGuard and add the bypass for our VPN endpoint. Again, this is just a very basic example and you should really come up with your own solution best suited for your environment.

## Routing Docker Container Traffic Through WireGuard

There are a few different ways of routing select container traffic through the WireGuard container. The most common way (most reported on in online guides) is setting the container's network to use the WireGuard container's (or service's) network stack. However, when routing multiple containers this way, since all the containers will be using the same network stack, there could be port collisions due to multiple containers trying to listen on the same internal port. In this article we will propose another way that prevents this issue. But let's start with the common way first.

### Setting up a container to use the WireGuard container's network stack

The following compose yaml will set up a WireGuard container and a qBittorrent container:

```yaml
services:
  wireguard:
    image: lscr.io/linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
    volumes:
      - /home/aptalca/appdata/wireguard-client:/config
      - /lib/modules:/lib/modules
    ports:
      - 8080:8080
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent
    container_name: qbittorrent
    network_mode: service:wireguard
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/London
      - WEBUI_PORT=8080
    restart: unless-stopped
```
In this compose yaml, the qBittorrent service is defined with `network_mode: service:wireguard`, which tells docker to let it use the network stack of the service named `wireguard`, which is running our wireguard container. So qbittorrent does not have its own network stack, instead, it attaches to the WireGuard container's network stack (similar to how with `network_mode: host` the container uses the host machine's network stack directly). Therefore, qBittorrent's gui port 8080 is actually listening inside the WireGuard container. In order to map that port to the host for local access, we put the port mapping directive into the `wireguard` service as shown above.

But it doesn't end there. Even though the port is mapped, once the tunnel is up, it won't respond to any requests coming from the host as it's configured to send all outgoing connections through the tunnel. We need to set up `PostUp` and `PreDown` rules to allow outgoing connections to our LAN.

The following rules should cover all private ranges (feel free to adjust to better match your local environment):
```
PostUp = DROUTE=$(ip route | grep default | awk '{print $3}'); HOMENET=192.168.0.0/16; HOMENET2=10.0.0.0/8; HOMENET3=172.16.0.0/12; ip route add $HOMENET3 via $DROUTE;ip route add $HOMENET2 via $DROUTE; ip route add $HOMENET via $DROUTE;iptables -I OUTPUT -d $HOMENET -j ACCEPT;iptables -A OUTPUT -d $HOMENET2 -j ACCEPT; iptables -A OUTPUT -d $HOMENET3 -j ACCEPT;  iptables -A OUTPUT ! -o %i -m mark ! --mark $(wg show %i fwmark) -m addrtype ! --dst-type LOCAL -j REJECT
PreDown = HOMENET=192.168.0.0/16; HOMENET2=10.0.0.0/8; HOMENET3=172.16.0.0/12; ip route delete $HOMENET; ip route delete $HOMENET2; ip route delete $HOMENET3; iptables -D OUTPUT ! -o %i -m mark ! --mark $(wg show %i fwmark) -m addrtype ! --dst-type LOCAL -j REJECT; iptables -D OUTPUT -d $HOMENET -j ACCEPT; iptables -D OUTPUT -d $HOMENET2 -j ACCEPT; iptables -D OUTPUT -d $HOMENET3 -j ACCEPT
```

So let's first create our config folder for WireGuard:

``` bash
mkdir -p /home/aptalca/appdata/wireguard-client
```

Then let's create our WireGuard config with the following and save it as `/home/aptalca/appdata/wireguard-client/wg0.conf`:

```
[Interface]
PrivateKey = 8AFbMaOQFaOYBrxrq7Kk/mt3jxa5Z1H27CIWNXs4vmY=
Address = 10.64.133.56/32
DNS = 193.138.218.74
PostUp = DROUTE=$(ip route | grep default | awk '{print $3}'); HOMENET=192.168.0.0/16; HOMENET2=10.0.0.0/8; HOMENET3=172.16.0.0/12; ip route add $HOMENET3 via $DROUTE; ip route add $HOMENET2 via $DROUTE; ip route add $HOMENET via $DROUTE; iptables -I OUTPUT -d $HOMENET -j ACCEPT; iptables -A OUTPUT -d $HOMENET2 -j ACCEPT; iptables -A OUTPUT -d $HOMENET3 -j ACCEPT;  iptables -A OUTPUT ! -o %i -m mark ! --mark $(wg show %i fwmark) -m addrtype ! --dst-type LOCAL -j REJECT
PreDown = HOMENET=192.168.0.0/16; HOMENET2=10.0.0.0/8; HOMENET3=172.16.0.0/12; ip route delete $HOMENET; ip route delete $HOMENET2; ip route delete $HOMENET3; iptables -D OUTPUT ! -o %i -m mark ! --mark $(wg show %i fwmark) -m addrtype ! --dst-type LOCAL -j REJECT; iptables -D OUTPUT -d $HOMENET -j ACCEPT; iptables -D OUTPUT -d $HOMENET2 -j ACCEPT; iptables -D OUTPUT -d $HOMENET3 -j ACCEPT

[Peer]
PublicKey = M+KYHvnMLh57umbiaBOaivAnProWCAGeQpyFfwFF2iI=
AllowedIPs = 0.0.0.0/0
Endpoint = 89.45.90.197:51820
```

When we issue `docker compose up -d`, both the WireGuard and the qBittorrent containers should be created and started, and the qBittorrent container should send all its traffic through the WireGuard tunnel, except for connections going out to the private IP ranges, including our LAN so we can connect to the qBittorrent gui locally.

This works great for a single container, but imagine including multiple containers in the same compose yaml and more than one tries to listen on the same port. If you can't modify the internal port an app listens on (many linuxserver.io containers don't allow for that), then you'll have port collisions. In those cases, the second method will work much better.

### Routing a container's traffic through the WireGuard container via routing table

This method is very similar to the section titled [Routing All Traffic Through WireGuard](#routing-all-traffic-through-wireguard) above, where we modify the routing table to route traffic through the WireGuard container. However, since we are doing this for individual containers, we will modify the containers' routing tables rather than the host's.

Modifying a container's routing table requires an additional capability that docker doesn't grant by default. That capability is `NET_ADMIN`. There are two ways of going about it. We can either create the container with that capability, so that the processes inside can modify the routing table, or the container can be created without it, and we exec into the container after creation with that capability to modify the routing table. Let's focus on the latter first.

As with the first scenario in this article, let's create our user defined bridge network with a specific subnet via `docker network create --subnet 172.20.0.0/24 wgnet` and create our folder with `mkdir -p /home/aptalca/appdata/wireguard-client`.
Then we can use the following compose yaml to create our containers:

```yaml
services:
  wireguard:
    image: lscr.io/linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
    volumes:
      - /home/aptalca/appdata/wireguard-client:/config
      - /lib/modules:/lib/modules
    networks:
      default:
        ipv4_address: 172.20.0.50
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent
    container_name: qbittorrent
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/London
      - WEBUI_PORT=8080
    ports:
      - 8080:8080
    restart: unless-stopped
networks:
  default:
    name: wgnet
    external: true
```

And we'll use the `PostUp` and `PreDown` directives in `/home/aptalca/appdata/wireguard-client/wg0.conf`, same as in the first example, to enable routing through the WireGuard container:

```
[Interface]
PrivateKey = 8AFbMaOQFaOYBrxrq7Kk/mt3jxa5Z1H27CIWNXs4vmY=
Address = 10.64.133.56/32
DNS = 193.138.218.74
PostUp = iptables -t nat -A POSTROUTING -o wg+ -j MASQUERADE
PreDown = iptables -t nat -D POSTROUTING -o wg+ -j MASQUERADE

[Peer]
PublicKey = M+KYHvnMLh57umbiaBOaivAnProWCAGeQpyFfwFF2iI=
AllowedIPs = 0.0.0.0/0
Endpoint = 89.45.90.197:51820
```

In this example, qBittorrent will be using its own network stack, so the port mapping will be defined under the `qbittorrent` service. Both containers will be attached to the same user defined bridge network, `wgnet`, however qBittorrent's traffic by default will go through the host's gateway as shown in its routing table:
```bash
$ docker exec qbittorrent ip route show
default via 172.20.0.1 dev eth0
172.20.0.0/24 dev eth0 scope link  src 172.20.0.2

$ docker exec qbittorrent curl -s https://am.i.mullvad.net/connected
You are not connected to Mullvad. Your IP address is 182.68.23.15
```

We need to modify the default route so that the traffic is routed through the WireGuard container (we do this by exec'ing in with `--privileged` so we have the `NET_ADMIN` capability required to change routes):
```bash
$ docker exec --privileged qbittorrent ip route del default
$ docker exec --privileged qbittorrent ip route add default via 172.20.0.50
```
And then we check the routes:
```bash
$ docker exec qbittorrent ip route
default via 172.20.0.50 dev eth0
172.20.0.0/24 dev eth0 scope link  src 172.20.0.2
```
And we check the connection:
```bash
$ docker exec qbittorrent curl -s https://am.i.mullvad.net/connected
You are connected to Mullvad (server us68-wireguard). Your IP address is 89.45.90.206
```
Bingo. Now all container traffic is routed through the WireGuard container.

With these routes, all connections, except for ones destined to `172.20.0.0/24`, are forced through the WireGuard tunnel. While this is great for the public connections, it may create a slight hiccup if we try to connect to qBittorrent's webgui from our LAN. If we are using a reverse proxy like [SWAG](https://github.com/linuxserver/docker-swag) to access qBittorrent's gui, which is on the same docker network `wgnet`, then we don't need any additional routes. SWAG will have an IP in the range of `172.20.0.0/24` and the existing route `172.20.0.0/24 dev eth0 scope link  src 172.20.0.2` will allow qBittorrent to send packets to SWAG over the docker network, and SWAG will send packets to our LAN (or WAN) freely. However if we try to access qBittorrent's webgui directly over LAN, all the packets qBittorrent tries to send to our local web browser will match the `default route`; be forced through the tunnel and won't reach us over the LAN. To access the webgui (or more accurately, to receive a response from the webgui), we need to create a route back to our LAN so connections to our local browser can reach the intended destination. If we are connecting to the gui from the LAN subnet `192.168.1.0/24`, then we can create a route for it with the following command:

```bash
$ docker exec --privileged qbittorrent ip route add 192.168.1.0/24 via 172.20.0.1
```

Now we should be able to reach (or rather hear back from) qBittorrent's webgui directly over LAN as the packets destined for our LAN subnet will match the new route and go through the docker gateway.

As described in the first example above, these changes to the routing table get reset on restart. So if we restart or recreate the qBittorrent container, we'll have to rerun the commands to change the default route to point to the WireGuard container. We can either do it from the host via a systemd service like in the first example or whatever other system allows you to run startup scripts; or inside the container via [a custom script](https://www.linuxserver.io/blog/2019-09-14-customizing-our-containers#custom-scripts). Keep in mind that if you do it inside the container instead of exec'ing in, you need to add `cap_add: NET_ADMIN` to your compose yaml.

#### Incoming Port Forwarding

qBittorrent also relies on incoming ports to establish connections with other peers. Above, we established routing of outgoing packets through the WireGuard tunnel. For incoming packets to reach the qBittorrent container, we would need to first get our VPN provider to forward a port for us, and then we would need to tell the WireGuard container to forward that port to the qBittorrent container. VPN providers' port forwarding support varies. Mullvad allows for forwarding up to 5 ports per account, randomly assigned. The ports forwarded are specific to WireGuard server's city, and the local peer's public key.

Let's assume that Mullvad forwarded port `58787` for our key in our selected city and the docker IP of our qBittorrent client is `172.20.0.2`. We can tell WireGuard to forward that incoming port to qBittorrent via the following iptables rule:

```bash
iptables -t nat -A PREROUTING -p tcp --dport 58787 -j DNAT --to-destination 172.20.0.2:58787
```

Let's add that to our `wg0.conf` so the rule is set on tunnel creation and deleted before destruction:

```
[Interface]
PrivateKey = 8AFbMaOQFaOYBrxrq7Kk/mt3jxa5Z1H27CIWNXs4vmY=
Address = 10.64.133.56/32
DNS = 193.138.218.74
PostUp = iptables -t nat -A POSTROUTING -o wg+ -j MASQUERADE; iptables -t nat -A PREROUTING -p tcp --dport 58787 -j DNAT --to-destination 172.20.0.2:58787
PreDown = iptables -t nat -D POSTROUTING -o wg+ -j MASQUERADE; iptables -t nat -D PREROUTING -p tcp --dport 58787 -j DNAT --to-destination 172.20.0.2:58787

[Peer]
PublicKey = M+KYHvnMLh57umbiaBOaivAnProWCAGeQpyFfwFF2iI=
AllowedIPs = 0.0.0.0/0
Endpoint = 89.45.90.197:51820
```

Now that the port is forwarded on both Mullvad and in our WireGuard client container, we can go ahead and set the `incoming connection port` in qBittorrent's settings to `58787` and other peers will be able to connect to our qBittorrent via port `58787` on our public Mullvad IP address.

## Further Reading

With the above scenarios, you can enjoy your online privacy from your ISP and others, but keep in mind that you will be shifting your trust to your VPN provider instead. So choose wisely.

Also keep in mind that not all services will accept connections from public VPNs. Many streaming services actively block connections from public VPNs and so do some websites like Craigslist, Etsy and GameStop to name a few. If you decide to route your traffic through a public VPN, you may need to create additional rules and routes to bypass the VPN on such connections.

Here are some other guides that may be helpful:
- [https://www.wireguard.com/netns/](https://www.wireguard.com/netns/)
- [https://spad.uk/wireguard-as-a-vpn-client-in-docker-using-pia/](https://spad.uk/wireguard-as-a-vpn-client-in-docker-using-pia/)
- [https://virtualize.link/vpn/](https://virtualize.link/vpn/)
