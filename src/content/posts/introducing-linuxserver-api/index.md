---
title: Introducing Linuxserver API
date: 2025-02-13T12:53:00Z
author: Quietsy
description: Use our API to get information about our images
tags:
  - how to
  - news
  - images
hero: ./api.png
---

We'd like to introduce our new API available under:

- [https://api.linuxserver.io/](https://api.linuxserver.io/)
- [https://docs.linuxserver.io/API/](https://docs.linuxserver.io/API/)

It currently has a single endpoint under `/api/v1/images` for obtaining information about our images, it gets updated several times a day, and all timestamps are in UTC.

Going forward, we will announce breaking API changes and new API endpoints via [https://info.linuxserver.io/](https://info.linuxserver.io/) (RSS feed available).

Let us know if you'd like us to add more information and endpoints via our support channels.

## Common Uses

### Last image version

Command:

```bash
curl -sX GET 'https://api.linuxserver.io/api/v1/images?include_config=false&include_deprecated=false' | jq -r '.data.repositories.linuxserver | .[] | select(.name == "radarr") | .version'
```

Output:

```
5.18.4.9674-ls259
```

### Last image version timestamp

Command:

```bash
curl -sX GET 'https://api.linuxserver.io/api/v1/images?include_config=false&include_deprecated=false' | jq -r '.data.repositories.linuxserver | .[] | select(.name == "radarr") | .version_timestamp'
```

Output:

```
2025-02-09 17:04:15+00:00
```

### Last image changelog

Command:

```bash
curl -sX GET 'https://api.linuxserver.io/api/v1/images?include_config=false&include_deprecated=false' | jq -r '.data.repositories.linuxserver | .[] | select(.name == "radarr") | .changelog[0] | .date, .desc'
```

Output:

```
23.12.24
Rebase Alpine 3.21.
```

### Image deprecation status

Command:

```bash
curl -sX GET 'https://api.linuxserver.io/api/v1/images?include_config=false&include_deprecated=true' | jq -r '.data.repositories.linuxserver | .[] | select(.name == "radarr") | .deprecated'
```

Output:

```
false
```

### Image details

Command:

```bash
curl -sX GET 'https://api.linuxserver.io/api/v1/images?include_config=false&include_deprecated=false' | jq -r '.data.repositories.linuxserver | .[] | select(.name == "radarr")'
```

Output:

```json

{
  "name": "radarr",
  "initial_date": "2017-01-10",
  "github_url": "https://github.com/linuxserver/docker-radarr",
  "project_url": "https://github.com/Radarr/Radarr",
  "project_logo": "https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/radarr.png",
  "description": "radarr - A fork of Sonarr to work with movies à la Couchpotato.",
  "version": "5.18.4.9674-ls259",
  "version_timestamp": "2025-02-09 17:04:15+00:00",
  "category": "Media Management",
  "stable": true,
  "deprecated": false,
  "stars": 703,
  "monthly_pulls": 2026491,
  "tags": [
    {
      "tag": "latest",
      "desc": "Stable Radarr releases"
    },
    {
      "tag": "develop",
      "desc": "Radarr releases from their develop branch"
    },
    {
      "tag": "nightly",
      "desc": "Radarr releases from their nightly branch"
    }
  ],
  "architectures": [
    {
      "arch": "x86_64",
      "tag": "amd64-latest"
    },
    {
      "arch": "arm64",
      "tag": "arm64v8-latest"
    }
  ],
  "changelog": [
    {
      "date": "23.12.24",
      "desc": "Rebase Alpine 3.21."
    },
    {
      "date": "31.05.24",
      "desc": "Rebase Alpine 3.20."
    },
    {
      "date": "20.03.24",
      "desc": "Rebase to Alpine 3.19."
    }
  ]
}
```

### Image config

Command:

```bash
curl -sX GET 'https://api.linuxserver.io/api/v1/images?include_config=true&include_deprecated=false' | jq -r '.data.repositories.linuxserver | .[] | select(.name == "radarr") | .config'
```

Output:

```json
{
  "application_setup": "https://github.com/linuxserver/docker-radarr?tab=readme-ov-file#application-setup",
  "readonly_supported": true,
  "nonroot_supported": true,
  "volumes": [
    {
      "path": "/config",
      "host_path": "/path/to/radarr/data",
      "desc": "Database and Radarr configs",
      "optional": false
    },
    {
      "path": "/movies",
      "host_path": "/path/to/movies",
      "desc": "Location of Movie library on disk (See note in Application setup)",
      "optional": true
    },
    {
      "path": "/downloads",
      "host_path": "/path/to/download-client-downloads",
      "desc": "Location of download managers output directory (See note in Application setup)",
      "optional": true
    }
  ],
  "ports": [
    {
      "external": "7878",
      "internal": "7878",
      "desc": "The port for the Radarr Web UI",
      "optional": false
    }
  ]
}
```
