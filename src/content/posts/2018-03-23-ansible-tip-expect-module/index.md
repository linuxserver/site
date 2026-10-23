---
title: Ansible Tip - Using the expect module
date: 2018-03-23T14:08:00Z
author: IronicBadger
tags:
  - ansible
  - linux
hero: ./featured.jpg
---

Another Ansible top tip. Suppose you are running an installer or other process via Ansible which expects the user to be present accept a license agreement, enter some information or something. Enter `expect`, a handy little utility which can listen for certain strings in stdout and react accordingly.

    - name: expect example
      expect:
        echo: yes
        chdir: "{{ dir }}"
        command: "./{{ exectuable_filename }}"
        timeout: "{{ timeout }}"
        responses:
          (.*)Please enter your name(.*): "Fred"
          (.*)Please enter your age(>*): "37"
          (.*)db port(.*): "{{ db_port }}"
          (.*)db user(.*): "{{ db_user }}"
          (.*)db pass(.*): "{{ db_pass }}"
        register: expect_example_result
        failed_when: "expect_example_result.rc != 0 and 'Success' not in expect_example_result.stdout"
    

The responses can be parameterised via variables or hard coded. We can also see that using the `failed_when` option it is easily possible to react to specific events and fail on certain conditions.
