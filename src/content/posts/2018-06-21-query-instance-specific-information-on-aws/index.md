---
title: Query instance specific information on AWS
date: 2018-06-21T22:00:00Z
author: IronicBadger
tags:
  - devops
  - ansible
  - aws
hero: ./featured.png
---

When working in a dynamic environment you can use the following syntax to query an instance for information about itself.

I found this very useful when needing to discover which availability zone an instance was running in, for example.

`curl http://169.254.169.254/latest/dynamic/instance-identity/document 2> /dev/null |jq '.availabilityZone' | sed 's/\"//g'"`

The full output is thus:

    {
      "devpayProductCodes" : null,
      "marketplaceProductCodes" : null,
      "privateIp" : "x",
      "version" : "2017-09-30",
      "instanceId" : "x",
      "billingProducts" : null,
      "instanceType" : "m4.large",
      "availabilityZone" : "eu-west-2a",
      "kernelId" : null,
      "ramdiskId" : null,
      "accountId" : "x",
      "architecture" : "x86_64",
      "imageId" : "ami-123",
      "pendingTime" : "x",
      "region" : "eu-west-2"
    

This information is covered in more detail [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-identity-documents.html).
