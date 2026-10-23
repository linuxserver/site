---
title: "PSA: Changes to our Let's Encrypt container (Updated)"
date: 2018-01-11T18:28:00Z
author: Josh Stark
tags:
  - letsencrypt
  - docker
---

Following a [very recent announcement by the Let's Encrypt team](https://community.letsencrypt.org/t/2018-01-09-issue-with-tls-sni-01-and-shared-hosting-infrastructure/49996) regarding a vulnerability that has surfaced relating to the use of the TLS-SNI-01 challenge when validating certificates, we have had to make an emergency change to our image. In short, they have disabled that method of verification until they can properly mitigate the issue.

This means that our Let's Encrypt container will not work as we only make use of the TLS-SNI method of certificate validation. With this in mind, we have made the decision to (hopefully) lessen the impact of this issue to our users by making a change to our image which allows certificate validation via HTTP (port 80).

We're just awaiting final peer review before we push these changes through our pipeline, so in the mean time, we stress that our users try their best **not to restart their Let's Encrypt container until we have pushed this change up**.

We will update you once the new image is available, and what you need to do to enable HTTP validation.

Update: The changes to our image have now been merged. In order to get certificate validation working, you'll need to add the following environment variable to your docker create/run command:

The **HTTPVAL** environment variable has been deprecated. Please do not use this.

**Update 03.02.2018**: We have merged an update to our container that allows you to define which form of validation you want to use when renewing your certificates.

There are two new environment variables available when creating your container:

- `-e VALIDATION`
- Available values: `http`, `tls-sni`, `dns`

- `-e DNSPLUGIN`
- Available values:  `cloudflare`, `cloudxns`, `digitalocean`, `dnsimple`, `dnsmadeeasy`, `google`, `luadns`, `nsone`, `rfc2136` and `route53`

If you decide to use the `dns` form of validation, please ensure you supply the relevant credentials under the `/config/dns-conf` directory.
