---
title: "PSA: Nextcloud & CVE-2019-11043"
date: 2019-10-27T00:47:00Z
author: j0nnymoe
tags:
  - nextcloud
  - news
  - docker
  - security
  - CVE
hero: ./featured.jpg
---

As many of you may be aware, this security issue was posted by NextCloud: [https://nextcloud.com/blog/urgent-security-issue-in-nginx-php-fpm/](https://nextcloud.com/blog/urgent-security-issue-in-nginx-php-fpm/)

After waiting for the updated packages to be released to the alpine repositories, Our Nextcloud has had this security hole fixed.

Please update your containers ASAP and for good measure, delete `default` in `/config/nginx/site-confs/` then restart your container and this file will get regenerated.

Thank you.
