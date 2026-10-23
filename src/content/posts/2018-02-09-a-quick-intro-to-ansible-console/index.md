---
title: A quick introduction to Ansible Console
date: 2018-02-09T22:33:00Z
author: IronicBadger
tags:
  - linux
  - ansible
  - automation
  - openshift
  - kubernetes
  - ansible-console
hero: ./featured.png
---

Managing multiple machines sucks. No matter how much you automate there are always going to be edge cases where you'd like to perform the same command on multiple machines simultaneously. Enter, `ansible-console` - my personal favourite tool discovered in 2017.

[Ansible console](http://docs.ansible.com/ansible/2.4/ansible-console.html) ships with Ansible itself. It allows for on the fly execution of Ansible modules or arbitrary commands. Just like regular Ansible, connections to the hosts are made via SSH and configuration follows standard Ansible practices.

    ansible-console -i <inventory> --limit <optional-tag> --become -u root
    

The tool really comes into it's own when debugging an Openshift clusters worth of hosts. Ensuring that services are running, disks have been resized or that DNS is functioning as expected can be achieved in a few seconds ad-hoc. Pair this with the ability to `--limit <by-tag>`, e.g. `--limit masters`, and you can begin to see why `ansible-console` is so powerful.

A quick tip if you're new to the tool, use the documentation linked above for a full range of commands available, `<tab>` is your friend. Begin typing a module name and tab completion will do the rest. Not sure what options are available to you with that module? `<tab> <tab>` will display a list of the available parameters for the module.

Another useful command I use to check hosts have come back after a reboot is `ping`, demo'd above.

`list` prints the IPs of all the hosts which match the criteria set out in the inventory and / or limits. This is most helpful when working with dynamic inventories such as Digitalocean, demo'd above.

I hope you found this quick intro to `ansible-console` useful and interesting.
