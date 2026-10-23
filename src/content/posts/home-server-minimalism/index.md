---
title: Home Server Minimalism
date: 2025-11-11T17:56:41.000Z
author: Quietsy
description: Use what you need and nothing more
tags:
  - ubuntu
  - install
  - docker
  - server
  - how to
  - zfs
draft: true
---

You've been hanging around reddit, discord, and blogs reading about other people's setups, layers of abstractions, and management GUIs.

#### STOP IT! GET SOME HELP!

If you can accomplish self-hosting with 3 pieces of software, why use 10?

Sitting around looking at GUIs is a waste of time, your objective is to automate what you can and get alerts when something stops working.

### Software

The bare minimum you need for a reliable home server is:
- Ubuntu LTS - has the most online resources and support.
- ZFS - the gold standard filesystem for reliability.
- Docker & docker compose - the most popular container engine, with compose being the most popular deployment method.

#### Steps

- Install Ubuntu LTS on an SSD.
	- Select Install OpenSSH Server.
    - Don't select any snap packages during the installation.
- Remove snapd.
	```bash
    snap list
	snap remove --purge <each-snap-listed>
	apt remove --purge snapd
	apt-mark hold snapd
    ```
- Set up a ZFS pool on `/mnt/data`. [Learn about ZFS](https://klarasystems.com/webinars/the-sysadmins-guide-to-zfs/).
- Install docker and docker compose. Follow the [official instructions](https://docs.docker.com/engine/install/ubuntu/).

#### Paths

- `/home/user/appdata` - for container app data, databases, and `/config` mounts.
- `/home/user/server` - for docker-compose, .env, crontab scripts.
- `/mnt/data` - for large data such as media, photos, documents.

### Management

Manage the compose and other files by mounting server folders on your desktop machine via one of the following network share options.

- SSHFS
- SMB
- NFS

#### Aliases

Add the following aliases to `/home/user/.aliases` to help control your containers.

```bash
# Actions on a single container, such as dcrun restart swag
alias dcrun='docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml '
# Pull all containers
alias dcpull='docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml pull'
# Apply compose changes
alias dcup='docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml up -d --remove-orphans --always-recreate-deps'
# Tail the logs of a container, such as dclogs swag
alias dclogs='docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml logs -tf --tail="50" '
# Exec into a container, such as dcexec swag bash
alias dcexec='docker exec -it '
```

#### Crontab

Crontab scripts can be used to automate tasks on a schedule.

```bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
0 1 * * * /home/user/server/daily.sh
0 2 * * 5 /home/user/server/weekly.sh
```

#### Crontab Scripts

An example of `/home/user/server/daily.sh` for backing up SSD files into ZFS.

```bash
#!/bin/bash

backup_root () {
	echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup root started"

	# Dump any databases to backup
	docker exec mariadb sh -c "/usr/bin/mariadb-dump nextcloud | gzip -c > /config/backup/nextcloud.sql.gz"
	docker exec immichdb sh -c "pg_dump -Fc -U user immich > /var/lib/postgresql/data/backup/immich.sql"

	# Backup the home dir, exclude any unimportant data such as caches
	rsync -ahHAXx --stats --delete --exclude={'/appdata/immich/photos','/appdata/jellyfin/cache','/appdata/nextcloud/appdata_ocytnd8b2l1b/preview'} --delete-excluded /home/user/ /mnt/data/backup/root_backup/home/

	# Backup any files modified under root
	rsync -ahHAXx /etc/fstab /mnt/data/backup/root_backup/
	rsync -ahHAXx /var/spool/cron/crontabs/root /mnt/data/backup/root_backup/root_crontab
	rsync -ahHAXx /etc/sysctl.conf /mnt/data/backup/root_backup/
	rsync -ahHAXx /etc/ssh/sshd_config /mnt/data/backup/root_backup/
	rsync -ahHAXx /etc/security/limits.conf /mnt/data/backup/root_backup/
	rsync -ahHAXx /etc/docker/daemon.json /mnt/data/backup/root_backup/
	rsync -ahHAXx /etc/netplan/00-installer-config.yaml /mnt/data/backup/root_backup/
	rsync -ahHAXx /etc/zfs/zed.d/zed.rc /mnt/data/backup/root_backup/zed.rc
	rsync -ahHAXx /etc/cron.d/zfsutils-linux /mnt/data/backup/root_backup/zfsutils-linux

	echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup root done"
}

mkdir -p /home/user/server/logs
echo "$(date '+%Y-%m-%d %H:%M:%S') - Daily started" > /home/user/server/logs/server_daily.txt 2>&1
backup_root >> /home/user/server/logs/server_daily.txt 2>&1
echo "$(date '+%Y-%m-%d %H:%M:%S') - Daily done" >> /home/user/server/logs/server_daily.txt 2>&1
```

An example of `/home/user/server/weekly.sh` for updating containers and OS packages.

```bash
#!/bin/bash

updates() {
	echo "$(date '+%Y-%m-%d %H:%M:%S') - Updates started"

	# Update containers once a week
	docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml pull --quiet 2>&1 | cat
	docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml down 2>&1 | cat
	docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml up -d 2>&1 | cat
	docker compose --env-file /home/user/server/.env -f /home/user/server/docker-compose.yml up -d 2>&1 | cat
	docker system prune -af 2>&1 | cat

	# Update system packages once a week
	DEBIAN_FRONTEND=noninteractive apt-get -q -y update
	NEEDRESTART_MODE=a DEBIAN_FRONTEND=noninteractive apt-get -q -y upgrade

	echo "$(date '+%Y-%m-%d %H:%M:%S') - Updates done"
}

mkdir -p /home/user/server/logs
echo "$(date '+%Y-%m-%d %H:%M:%S') - Weekly started" > /home/user/server/logs/server_weekly.txt 2>&1
updates >> /home/user/server/logs/server_weekly.txt 2>&1
echo "$(date '+%Y-%m-%d %H:%M:%S') - Weekly done" >> /home/user/server/logs/server_weekly.txt 2>&1
```

### Alerting Tools

- [Beszel](https://beszel.dev/) - a server monitoring tool with alerts.
- [Uptime-kuma](https://github.com/louislam/uptime-kuma) - an endpoint monitoring tool with alerts.
- [ntfy](https://ntfy.sh/) - a notification tool for receiving alerts.
