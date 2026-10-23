---
title: Concatenate a complex string in Ansible
date: 2018-07-04T16:13:00Z
author: IronicBadger
tags:
  - ansible
  - devops
hero: ./featured.jpg
---

Constructing a long, complex string in Ansible can be achieved quite easily utilising Python string subsitution syntax.

Suppose you have the following variables:

    app_protocol: http
    app_host: 12.34.56.78
    app_port: 8080
    app_path: api/v2/testing
    

You could construct a string with all the components item by item using lots of `"{{}}"` syntax. Or, try this instead:

    app_string: >-
      {{ "%s://%s:%d/%s"
    		app_protocol,
    		app_host,
    		app_port,
    		app_path
    	) }}
    

Note that `%s` is used for string interpolation and `%d`for numeric or decimal values.

I think this is much more readable.
