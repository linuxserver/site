---
title: Self hosting Bitwarden Password Manager
date: 2019-01-16T00:48:00Z
author: chbmb
tags:
  - containers
  - NAS
  - server
  - how to
  - data protection
  - docker
hero: ./featured.jpg
---

[Bitwarden](https://bitwarden.com/) is an awesome open source password manager that I've been using for a while. However I've never been entirely comfortable with storing my password database on someone else's computer, so I decided to look into options for self-hosting it.

Enter [bitwarden_rs](https://github.com/dani-garcia/bitwarden_rs); an unofficial implementation of the Bitwarden password manager written in *rust*, and brings a number of advantages to the original project.

1. It's much more lightweight.
2. It only requires a single Docker container to spin it up.

### Prerequisites

So without further ado, let's get started.  To follow this tutorial, you'll need:

1. Our letsencrypt container installed and configured with your hostname and appropriate (sub)domains
2. Your own (sub)domain setup correctly and free to dedicate to bitwarden.

### Docker configuration

Although I tend to prefer to use containers we've produced ourselves, sometimes you have to admit that the original application author has hit the nail on the head with their own container, and that's the case here. So let's grab it from Docker Hub:

     docker run -d \
    	--name='bitwarden' \
    	-e 'SIGNUPS_ALLOWED'='true' \
    	-e 'DOMAIN'='https://bw.server.com/' \
    	-p 8343:80/tcp \
    	-p 3012:3012/tcp \
    	-v /path/to/data:/data/:rw \
    	mprasil/bitwarden
    

As you can see I've changed port `80` on the container side to be `8343` on the host as Unraid is currently using port `80`.  You can choose any free port for this tutorial — just remember what it is so you can configure the reverse proxy appropriately.

With that completed, let's move on.

### Reverse proxy

Navigate to `/config/nginx/site-confs/` on your LinuxServer.io Let's Encrypt container, and create a new server. Call the file `bw`.

In this file paste the following, making sure you edit it to change the variables `$IP` and `$HOST_PORT_FOR_80` appropriate to your own config. Save and restart the Let's Encrypt container.

    server {
        listen         80;
        server_name    bw.*;
        return         301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name bw.*;
      
        include /config/nginx/ssl.conf;
        client_max_body_size 128M;
    
        location / {
            proxy_pass http://$IP:$HOST_PORT_FOR_80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
      
        location /notifications/hub {
            proxy_pass http://$IP:3012;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
      
        location /notifications/hub/negotiate {
            proxy_pass http://$IP:$HOST_PORT_FOR_80;
        }
    }
    

### Finishing Up

You should find now you can access the Bitwarden web vault at `https://bw.server.com`

Now you can create a new account, and if you want to migrate from Bitwarden's own hosted system, export your passwords as a `.json` file and import them to your new self-hosted version.

### Setting up Browser Extensions & Mobile Applications

To point the browser extension to your new self hosted Bitwarden instance, you need to log out from your current Bitwarden session and then click the tiny cog in the upper left corner like below:

![14-01-2019@11-20](/content/images/2019/01/14-01-2019%4011-20.png)

Fill out the Server URL box with `https://bw.server.com`.

Robert's your mother's brother.  You're done!
