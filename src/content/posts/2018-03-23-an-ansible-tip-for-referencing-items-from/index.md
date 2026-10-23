---
title: Ansible Tip - Referencing items from a hash
date: 2018-03-23T14:08:00Z
author: IronicBadger
tags:
  - ansible
  - linux
hero: ./featured.jpg
---

Let's say you are in the midst of writing an Ansible playbook and you need to reference multiple values from an 'item' in different places. Here's a neat code snippet that will allow you to do just that.

    hosts: all 
    vars:
      file_path_1: /usr/bin
      file_path_2: /example
      file_path_3: /opt
    tasks:
      - name: example task
        file:
          path: "{{ item.0 }}/{{ item.1 }}"
    	  state: present
    	with items:
    	  - [ "{{ file_path_1 }}/{{ file_path_2 }}"
    	  - [ "{{ file_path_3 }}/{{ file_path_2 }}"
    

In this example we can reference different parts of the `item` hash simply by using its index value. You can also name keys and reference them thus if you prefer:

    - name: mount disks
      mount:
        name: "{{ item.name }}"
        src: "{{ item.src }}"
        fstype: "{{ item.fs }}"
        # change to 'mounted' to auto mount
        state: present
      with_items:
        - { name: /mnt/disk1, src: /dev/sda1, fs: ext4}
        - { name: /mnt/disk2, src: /dev/sda2, fs: ext4}
