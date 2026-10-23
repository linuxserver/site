---
title: Deploying your own Cryptocurrency network with Docker and Nano
date: 2020-06-01T00:44:00Z
author: Ryan Kuba
tags:
  - docker
  - cryptocurrency
  - Nano
  - self hosted
hero: ./featured.jpg
---

When it comes to self hosting a Cryptocurrency network, almost everything out now revolves around developers with little emphasis on creating a functional payment network for private/public use.  When researching what could fill this role we found that with minimal changes Nano fit the bill perfectly.

A P2P cryptographically secure payment ledger is a powerful tool allowing you to issue your own virtual currency for anything you see fit. Some ideas we had for self hosting one:

- Gift card providers
- Internally issued corporate tokens
- Financial education tools for parents and schools
- Ephemeral currency for events
- Pre-sales of products or services
- Just for fun!

The goal we had going into this was to not only make it easier for a normal user to spin up a payment network, but also for end users/maintainers of that network to easily transact on that network using a browser based wallet. 

Before we get into technical details wanted to thank [marvinroger](https://github.com/marvinroger) for creating [https://github.com/marvinroger/nanocurrency-js](https://github.com/marvinroger/nanocurrency-js) which is used for both our browser based wallet and our Discord bot. Also of course the [Nano Team](https://nano.org/foundation#team)/Community for their node software and excellent [documentation](https://docs.nano.org/). 

## I just want to see numbers on a screen

In the spirit of "eat your own dog food" we have deployed a publicly hosted wallet and RPC endpoint to run our own ledger here: 

https://wallet.linuxserver.io/#/nano.linuxserver.io

To get funds to play around on this network hop into our [Discord](https://discord.gg/YWrKVTn) and ask our bot in the #faucet channel for coins. You will need to generate a wallet with the link above before receiving funds, and remember never share your private key or seed with anyone. 

To promote further transparency our wallet is built and published from source on Github Pages [here](https://github.com/linuxserver/nano-wallet/blob/master/.github/workflows/release.yml), as we allow end users to set the RPC endpoint they want to talk to in the client side wallet feel free to use this hosted version for your network. 

This client side wallet is compatible with the main Nano live network also, currently direct support is limited to the public RPC endpoint provided by [mynano.ninja](https://mynano.ninja/) :

- Get an API key here - [https://mynano.ninja/auth/login#apikey](https://mynano.ninja/auth/login#apikey)
- Use [https://wallet.linuxserver.io/#/mynano.ninja?auth=APIKEY](https://wallet.linuxserver.io/#/mynano.ninja?auth=APIKEY) URL format to open the wallet

## Hello World

Here we are going to cover the bare minimum commands needed to spinup a local payment network and wallet. 

First spinup your containers:

    docker run -d \
      --name node \
      -e CLI_OPTIONS='--config node.enable_voting=true' \
      -p 7076:3000 \
      --restart unless-stopped \
      linuxserver/nano

    docker run -d \
      --name=wallet \
      -p 80:80 \
      --restart unless-stopped \
      linuxserver/nano-wallet

Then unlock the Genesis funds on the local node to allow it to confirm transactions: 

    docker exec -it node bash
    root@f1df092971f0:/# curl -d '{ "action": "wallet_create" }' localhost:7076
    {
        "wallet": "A3D63F1B28AC68BCD9E0FF74278C7984A36841C803EF1A81DF92BCD6E3BB18F9"
    }
    root@f1df092971f0:/# curl -d '{ "action": "wallet_add", "wallet": "A3D63F1B28AC68BCD9E0FF74278C7984A36841C803EF1A81DF92BCD6E3BB18F9", "key": "0000000000000000000000000000000000000000000000000000000000000000" }' localhost:7076
    {
        "account": "nano_18gmu6engqhgtjnppqam181o5nfhj4sdtgyhy36dan3jr9spt84rzwmktafc"
    }
    

Here we are using the default private key of `0000000000000000000000000000000000000000000000000000000000000000` for the image.

Navigate to [http://localhost/#/localhost](http://localhost/#/localhost) and enter this key. You should be greeted by the genesis account wallet with 340.28 Million Nano:
![](/content/images/2020/05/wallet_landing.png)
From here you can generate new wallets from the home screen and send/receive funds on your local network. Now you will be running an insecure centralized network with a single voting representative and a zero security private key using the commands above. To spinup a standard private or even public network you should read up on Nano's documentation [HERE](https://docs.nano.org/) and continue reading the network design section below.

## Your Genesis account

By default this container will launch with a genesis block based on the private key `0000000000000000000000000000000000000000000000000000000000000000`, this should obviously only ever be used for testing purposes. Before you run your node you should use a script baked into this image to determine your private key and required environment variables:

    docker run --rm --entrypoint /genesis.sh linuxserver/nano
    Generating Genesis block
    !!!!!!! ACCOUNT INFO SAVE THIS INFORMATION IT WILL NOT BE SHOWN AGAIN !!!!!!!!
    Private Key: CD4CD6B1E5523D4B5AEDD2B1E5A447C6C6797E729A531A95F9AD7937FC7CD9EA
    Public Key:  2D057DF2EB09E918D3F95B5FCA69A5FD3EA406EF7D1810106324CD7A99FAA32D
    Account:     nano_1da7hqsgp4hb55bzkptzsbntdzbyni5gyzar41a88b8fhcezoasfjkgmyk5y
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    Container Environment Values:
     -e LIVE_GENESIS_PUB=2D057DF2EB09E918D3F95B5FCA69A5FD3EA406EF7D1810106324CD7A99FAA32D \
     -e LIVE_GENESIS_ACCOUNT=nano_1da7hqsgp4hb55bzkptzsbntdzbyni5gyzar41a88b8fhcezoasfjkgmyk5y \
     -e LIVE_GENESIS_WORK=7fd88e48684600b7 \
     -e LIVE_GENESIS_SIG=D1DF3A64BB43C131944401632215569A40AAE858ACF6CB59D5C77070E69DBF6435D93807877628A8B142DBF1AC4C562CD2F4CEBEB7D15486BDB7494A6146E007 \
    

These environment variables will be used for all of the peers in your payment network, but if you are running what you would consider a public or live network never share your private key even if you have drained the funds from that account it can be potentially used to create valid forks. **Even Better**, you should never even trust our Docker image for generating a private key and open block. Do it on an airgapped machine and keep it on a paper wallet.

## Network Design

There are 4 main concepts to grasp from a network standpoint as far as types of endpoints. Before we get started here is a basic network diagram:
![image](https://raw.githubusercontent.com/linuxserver/image-docs/master/img/nano-network.png)
#### Principle nodes and voting representatives

Principle nodes are network representatives with the ability to vote due to having a certain threshold of funds unlocked on that node or pointed to that unlocked address. These nodes should be as airgapped as possible while still being an active 24/7 peer of the network. From a technical perspective this is a node with an account private key that either has the funds it needs itself or enough users have pointed their accounts to it as a representative. In a live and secure configuration to protect the funds of this account you would use an inactive private key account with the funds in it and locally sign a change of representative block to point to the always online representative.

These nodes should never process external RPC calls even on a local network, the same rules go for any node with a local unlocked wallet.

Keep in mind the key to the security of the network is that 51% of active voting funds are pointed to trusted representatives that will generally not argue about chain forks.

In most deployments the best bet is to heavily centralize your voting nodes, this is unless you are intentionally trying to build a distributed ledger and security model like the main Nano live net. Achieving that will be a long and difficult task.

#### Network peers

To a normal user simply transacting on the network using off the shelf tools like a web wallet and web based block explorers is generally all that is required. They get a number in a ledger somewhere and are able to locally sign and publish blocks using their private key using your published RPC endpoints.

For advanced users and just to generally make the network more robust, network operators should promote people running their own nodes. Using this image a network peer simply needs to run a docker run command with your pre-configured variables. IE given the generation example from above in the `Your Genesis account` section and that you have setup a public node at peering.mydomain.com:

    docker create \
      --name=nano \
      -e PUID=1000 \
      -e PGID=1000 \
      -e TZ=Europe/London \
      -e PEER_HOST=peering.mydomain.com \
      -e LIVE_GENESIS_PUB=2D057DF2EB09E918D3F95B5FCA69A5FD3EA406EF7D1810106324CD7A99FAA32D \
      -e LIVE_GENESIS_ACCOUNT=nano_1da7hqsgp4hb55bzkptzsbntdzbyni5gyzar41a88b8fhcezoasfjkgmyk5y \
      -e LIVE_GENESIS_WORK=7fd88e48684600b7 \
      -e LIVE_GENESIS_SIG=D1DF3A64BB43C131944401632215569A40AAE858ACF6CB59D5C77070E69DBF6435D93807877628A8B142DBF1AC4C562CD2F4CEBEB7D15486BDB7494A6146E007 \
      -p 8075:8075 \
      -p 7076:3000 \
      -p 7077:3001 \
      -v /path/to/data:/config \
      --restart unless-stopped \
      linuxserver/nano
    

When the container spins up it will reach out to the node to bootstrap it's local ledger from peering.mydomain.com . This node once fully synced will be able to run local RPC commands to plug into a wallet and default Nano node wallet commands for automated pocketing of transactions etc. It will also get a list of other peers on the network from it's initial network peering and start participating in your distributed cryptocurrency network.

In this example your peering endpoint running at peering.mydomain.com would be running:

    docker create \
      --name=nano \
      -e PUID=1000 \
      -e PGID=1000 \
      -e TZ=Europe/London \
      -e CLI_OPTIONS='--config node.enable_voting=true' \
      -e LIVE_GENESIS_PUB=2D057DF2EB09E918D3F95B5FCA69A5FD3EA406EF7D1810106324CD7A99FAA32D \
      -e LIVE_GENESIS_ACCOUNT=nano_1da7hqsgp4hb55bzkptzsbntdzbyni5gyzar41a88b8fhcezoasfjkgmyk5y \
      -e LIVE_GENESIS_WORK=7fd88e48684600b7 \
      -e LIVE_GENESIS_SIG=D1DF3A64BB43C131944401632215569A40AAE858ACF6CB59D5C77070E69DBF6435D93807877628A8B142DBF1AC4C562CD2F4CEBEB7D15486BDB7494A6146E007 \
      -p 8075:8075 \
      -v /path/to/data:/config \
      --restart unless-stopped \
      linuxserver/nano

To make your network a bit more resilient you might want to consider having your recommended client run commands pass arrays for preconfigured peers and preconfigured representatives like the default Nano node software:

     -e CLI_OPTIONS='--config node.preconfigured_representatives=["nano_3rw4un6ys57hrb39sy1qx8qy5wukst1iiponztrz9qiz6qqa55kxzx4491or","nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji"]\
     --config node.preconfigured_peers=["peering1.mydomain.com","peering2.mydomain.com"]' \

#### Public RPC endpoints

The key to users going to a web page and managing the funds on your network is the ability to get blockchain information and publish new blocks to theirs. We bundle a basic firewall with a core set of RPC functions whitelisted that should be safe to expose publicly in our image, but with that said we have not and are not planning to pay for any kind of security audit so use at your own discretion.

From a network design perspective these nodes should be purely what you would consider client peers and never have any wallets registered or private keys stored on them. Also for redundancy optimally these peers should be run in a cluster behind a load balancer. For standard nodes you are building out a large P2P network, but in the case of the RPC endpoint and specifically the URL the end user is going to pass when accessing their wallet it is up to you to make that resilient.

#### Clientside javascript wallet

Currently we publish a pure javascript client side wallet located here:

[https://github.com/linuxserver/nano-wallet](https://github.com/linuxserver/nano-wallet)
![](/content/images/2020/05/wallet_demo.gif)
It is designed to be run 100% client-side in any web browser and use public RPC endpoints to hook into any network and conduct transactions by locally signing then publishing the result. This can be hosted locally with any simple webserver and pointed to a locally run peer, but for full functionality we recommend providing a public Https URL with these files along with plugging in legitimate SSL certificates into your RPC endpoints running on 7077.

## Anatomy of a transaction using this stack

The web based wallet works by using a bare minimum of RPC calls needed from the hosted public node to perform a transaction and display relevant transaction history. The emphasis on this setup being to keep server load and bandwidth as low as possible and push all actions to the client. 

Overall it looks like this:
![](/content/images/2020/05/transaction.png)
All of the communications the client wallet makes with the node are secure by protocol not by the addition of HTTPS or other layers. A potential attacker intercepting this traffic cannot do anything malicious with it outside of potentially not sending it to the node. This means that the client wallet can communicate over plain HTTP safely and even a malicious RPC node operator would not be able to derive private keys from the communication. As long as you are using our hosted wallet https://wallet.linuxserver.io or hosting the wallet yourself locally you are safe. 

The steps for a transaction are as follows:

1. The client sets and RPC endpoint in the wallet in the URL using the format https://wallet.linuxserver.io/#/RPC_HOST_OR_IP
2. The client sets their private key and derives their public address/key from that
3. Client makes an `account_info` , `account_history`, and `pending` RPC call using derived public address to display account info for the wallet interface
4. Proof of work is generated locally against the current frontier if opened or public key for the account if unopened
5. When the client clicks send the resulting block information is locally processed and signed with the users private key
6. The resulting signed block is sent to the RPC endpoint using `process`
7. The block is checked server side and if valid broadcast to the rest of the peers in that specific network

By leveraging the RPC calls above with the `block_info` call the client side wallet can also be used as a block/account explorer using the following URL format:

- https://wallet.linuxserver.io/#/RPC_HOST_OR_IP/block/YOUR_BLOCK_HASH_HERE - Displays raw block information.
- https://wallet.linuxserver.io/#/RPC_HOST_OR_IP/address/YOUR_ADDRESS_HERE - Displays a stripped down wallet interface with transaction history.

## Distributing funds

How you decide to distribute funds is completely up to you and usually revolves around the network's purpose, at linuxserver.io we are running a ledger for fun and as such we are heavily centralizing our network around the trust built by our core team. We decided to distribute 50%+ to the core team and point those funds to our principle representatives. 

The remaining funds we distribute via a Discord bot and the source code for that can be found [here](https://github.com/linuxserver/docker-nano-discord-bot) feel free to use this bot for your own purposes/network it takes api/private keys along with a distribution amount to run a faucet from Discord based on user unique user IDs. It is important to note this bot is not designed around the concept of high throughput, we intentionally use nodejs and javascript work generation to re-use the code from our client side wallet and reduce maintenance. 

## Appendix live network compatibility

While we cannot endorse this as a core use for our images as they are geared towards self hosting and helping end users bootstrap their own network, as far as we can tell our image is compatible with the Live Nano network, using the following variables will bootstrap your node into their network: 

    docker run -d \
     --name nano-peer \
    -e PEER_HOST=peering.nano.org \
     -e CLI_OPTIONS='--config node.preconfigured_representatives=["nano_3rw4un6ys57hrb39sy1qx8qy5wukst1iiponztrz9qiz6qqa55kxzx4491or","nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji"]' \
     -e LIVE_GENESIS_PUB=E89208DD038FBB269987689621D52292AE9C35941A7484756ECCED92A65093BA \
     -e LIVE_GENESIS_ACCOUNT=xrb_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3 \
     -e LIVE_GENESIS_WORK=62f05417dd3fb691 \
     -e LIVE_GENESIS_SIG=9F0C933C8ADE004D808EA1985FA746A7E95BA2A38F867640F53EC8F180BDFE9E2C1268DEAD7C2664F356E37ABA362BC58E46DBA03E523A7B5A19E4B6EB12BB02 \
     -e PGID=1000 \
     -e PUID=1000 \
     -e TZ=Europe/London \
     -p 7076:3000 \
     -p 7077:3001 \
     -v /path/to/data:/config \
     linuxserver/nano

During our build process we patch their source code to support passing the genesis block information as an environment variable instead of being hard coded and null out any references to pre-configured peers or representatives. 

As our browser based wallet uses raw Nano RPC commands to conduct transactions it is compatible with both our image and Nano's official one [nanocurrency/nano](https://hub.docker.com/r/nanocurrency/nano) with RPC control enabled with the exception that you will need to put a proxy in front of theirs allowing CORS and Https if needed.
