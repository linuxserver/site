---
title: How we use DigitalOcean
date: 2020-07-07T16:30:00Z
author: Ryan Kuba
tags:
  - digitalocean
  - infrastructure
hero: ./featured.jpg
---

As we (LinuxServer.io) are lucky enough to be sponsored by DigitalOcean so that we don't have to worry about resources needed to run our infrastructure, we thought it would be a good idea to do an article on how we leverage their services for our community. 

**DigitalOcean Spaces: **
![](/content/images/2019/04/Spaces_CDN_blog-email.png)[https://www.digitalocean.com/products/spaces/](https://www.digitalocean.com/products/spaces/)
Spaces is S3-compatible object storage with a built in CDN and no nonsense pricing. Here at LinuxServer.io we need to quickly and economically publish our continuous integration reports and build artifacts for our 100+ continuous delivery pipelines to the public internet. All of this is made possible with Spaces. 

For the uninitiated, object storage is like an internet accessible network file share — the modern equivalent to an FTP endpoint. You upload your content without knowing anything about infrastructure, and DigitalOcean ensures the data is durable, backed up, and accessible across the globe (if shared publicly) at high speed on an edge cached CDN. 
![](/content/images/2019/04/CDN-blog-1.png)https://blog.digitalocean.com/spaces-now-includes-cdn/
Specifically, we leverage [*boto3*](https://github.com/boto/boto3) embedded into some custom Continuous Integration logic to upload reports we as an organization can consume to make informed decisions about releases. The code for that can be seen here: 

[https://github.com/linuxserver/docker-ci/](https://github.com/linuxserver/docker-ci/)

An example report can be seen here: 
[https://lsio-ci.ams3.digitaloceanspaces.com/linuxserver/duplicati/latest/index.html](https://lsio-ci.ams3.digitaloceanspaces.com/linuxserver/duplicati/latest/index.html)
![](/content/images/2020/05/FireShot-Capture-001---CI-Results---lsio-ci.ams3.digitaloceanspaces.com.png)
What pushed us as an organization to DigitalOcean Spaces outside of our existing relationship was their flat pricing model for $5 monthly offering 250GB of storage and 1TB of outgoing bandwidth. Comparing that to S3 at the time of this writing is ~$95 for storage and bandwidth alone ($0.09 per GB bandwidth, $0.023 per GB storage).

While most normal users will not be interacting with object storage programmatically like we do, there are many options for getting started with object storage using a friendly GUI, one of those is [*Cyberduck*](https://cyberduck.io/) or even directly from DigitalOcean's own web interface. 

Additional information for Spaces can be found here: [https://www.digitalocean.com/products/spaces/](https://www.digitalocean.com/products/spaces/)

And as always DigitalOcean's excellent documentation: [https://www.digitalocean.com/docs/spaces/](https://www.digitalocean.com/docs/spaces/)

## DigitalOcean Droplets
![](/content/images/2020/03/DigitalOcean-Droplets.jpg)[https://www.digitalocean.com/products/droplets/](https://www.digitalocean.com/products/droplets/)
`Droplet` is DigitalOcean's terminology for `Virtual Machine`. DigitalOcean offers droplets with both shared and dedicated CPUs and in various sizes (# of CPU cores, RAM and SSD size). Creating droplets is fairly easy and one can be up and running with any one of the popular Linux operating systems within 55 seconds. We use several shared CPU droplets to host a variety of services (all Docker based due to portability and easy backup/restore). Below is a list of the droplets and the services they host.

### Jenkins:

Shared 4 cores, 8GB of RAM, 60GB of storage

This droplet hosts two Docker containers:

- [Official Jenkins image](https://hub.docker.com/r/jenkins/jenkins) to manage our Jenkins slaves that do all the building, testing and publishing of our docker images to Docker Hub, Quay.io, GitHub and Gitlab.
- [Our Swag image](https://hub.docker.com/r/linuxserver/swag) for reverse proxying Jenkins.

### Web:

Shared 2 cores, 2GB of RAM, 60GB of storage

This droplet hosts seven docker containers:

- [Our Swag image](https://hub.docker.com/r/linuxserver/swag) for hosting the [main website](https://linuxserver.io) and various JSON feeds, and for reverse proxying the other services on this droplet.
- [Our Fleet image](https://hub.docker.com/r/linuxserver/fleet) to list the [Docker images we publish](https://fleet.linuxserver.io).
- [Our Nextcloud image](https://hub.docker.com/r/linuxserver/nextcloud) to store team documents.
- [OnlyOffice DocumentServer](https://hub.docker.com/r/onlyoffice/documentserver) for collaborative editing within Nextcloud.
- [Our Grav image](https://hub.docker.com/r/linuxserver/grav) to publish [our blog](/).
- Two containers based on [our MariaDB image](https://hub.docker.com/r/linuxserver/mariadb), one for Nextcloud and one for Fleet data.

### Forum:

Shared 1 core, 2GB of RAM, 50GB of storage

This droplet hosts the Docker container based on the [official Discourse image](https://github.com/discourse/discourse_docker), publishing [our forum](https://discourse.linuxserver.io).

### Tools:

Shared 1 core, 1GB of RAM, 25 GB of storage

This droplet hosts various miscellaneous tools and services like Discord cogs/bots.

### Test:

Shared 1 core, 1GB of RAM, 25GB of storage

This droplet is created on demand via a cloud-init script, which installs all necessary development and testing tools (including docker and docker-compose), sets up host keys and SSH key based access, and configures dynamic DNS via DuckDNS. Within about 2 minutes of entering the necessary info into DigitalOcean GUI, a fully configured droplet running Ubuntu Bionic is available for SSH access. It is used mainly for testing our docker images, on an off-site, third party machine to prevent any biases that may arise from our controlled and customized home environments. Once testing concludes, the droplet often is destroyed.

We've been using DigitalOcean for our infrastructure for a good number of years and it's given us a solid ground to build upon. We hope you enjoyed reading about how we leverage their services to bring you our containers.
