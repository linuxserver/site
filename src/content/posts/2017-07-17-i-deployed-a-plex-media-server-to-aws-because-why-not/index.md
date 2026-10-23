---
title: I deployed a Plex Media Server to AWS because, why not?
date: 2017-07-17T21:21:00Z
author: Josh Stark
tags:
  - plex
  - aws
hero: ./chrome-2017-07-15-21-28-09.png
---

Netflix is, in my eyes, a world-leader in video delivery, so I figured if they can use AWS to serve their content, why can't I? I mean, sure, they're an international multi-billion dollar powerhouse, and I am but one man. Still, I thought to myself if anything else, it'd make an interesting case-study to deploy an EC2 instance and fire up Plex. So, here's what I did.

- [The components](#thecomponents)
- [EC2 - The Server](#ec2theserver)
- [EBS - The Storage](#ebsthestorage)

- [Getting everything in order](#gettingeverythinginorder)
- [And breathe...](#andbreathe)
- [Time to build](#timetobuild)
- [The CLI](#thecli)
- [The script](#thescript)

- [Deploying!](#deploying)
- [Configuring Plex Remotely](#configuringplexremotely)
- [Uploading Content](#uploadingcontent)
- [Performance](#performance)
- [Cost](#cost)
- [TL;DR - Is it worth it?](#tldrisitworthit)

## The components

Firstly, I had to understand what it was I needed in order to get my solution up and running. It was clear I would require two things:

- A running virtual host, preferably Linux
- Some form of storage for the media content

It really only boils down to those two components when it comes to Plex.  Once I'd worked out that obvious list of requirements, I immediately signed up for an AWS account and checked out what the free tier would provide for me. **I tried my best to see what was possible while staying within the confines of the free tier for new AWS accounts.**

AWS is a veritable supermarket of tools, from databases to AI, but in my case all I needed was an EC2 instance and an EBS volume.

#### EC2 - The Server

EC2 (Elastic Compute Cloud) is where the server will be deployed - it's in my eyes the heart of AWS. There are quite a lot of options made available by Amazon, but I decided on the following:

- Image: `Amazon Linux AMI 2017.03.1 (HVM), SSD Volume Type`
- Instance Type: `t2.micro`
- 1 vCPU at 2.5 GHz, Intel Xeon Family
- 1 GiB memory
- Only allows EBS storage

- Region: `eu-west-1`
- Availability Zone: `eu-west-1b`

I figured "when in Rome" and opted for the Amazon-flavoured version of Linux for no reason other than it was the first option in the list. It also helps that installing Docker is a bit easier as the AWS repositories haven't caught up with Docker's change to Moby/Docker CE.

The only instance type I was allowed to use under the free tier was `t2.micro` so my hands were a bit tied. I could have used something more powerful but I figured this would be a good starting point.

#### EBS - The Storage

A running server isn't really any good if there's no storage assigned to it for my media, so I decided on EBS (Elastic Block Storage) as my solution. By default, creating an EC2 instance will automatically create an 8GB EBS volume and assign it as the root partition - quite handy. While that's nice, much like my home solution, I didn't want to mix up my application data with my static media data, so I decided I'd create my own:

- Volume Type: `gp2` (a.k.a General Purpose SSD)
- Partition Size: `20GB`

Remember, I'm trying to stay within the limits of the free tier, so I'm not allowed any more than 30GB of EBS storage at any given time. Considering just having an EC2 instance creates a default 8GB volume, I've only got 22GB left to play around with - 20 is a nice round number.

## Getting everything in order

I'd decided on what I needed at a basic level, so it was time to start thinking about actually building them and deploying them in AWS. Unfortunately it's not *quite* as simple as clicking "GO" and sitting back, waiting for it all to magically show up on the Internet. While there is certainly an aspect to that, I did need to consider some aspects of the deployment that are both specific to AWS and should be considered generally speaking when it comes to networking.

I spent some time reading up on how AWS handled things like VPCs, subnets, Availability Zones, and Security Groups, as this would impact the way I approached deployment of my solution.

## And breathe...

By this point you're probably wondering if this is really worth my time and whether or not I have anything better to do. The answer to *both* questions is definitely "no". This exercise was nothing more than a way of helping me understand how AWS works, and whether or not a basic running instance has what it takes to run Plex. I'd not even considered the long-term cost issues (which I'll cover later on).

## Time to build

I'm an engineer by trade, and this is LinuxServer, so I would be remiss if I didn't at least attempt to automate this! It's quite easy to use AWS's web console to create everything, but there's no fun in that, so instead I looked at CloudFormation - AWS's stack deployment framework. It's great because it meant I was able to test out small incremental bits and pieces of my deployment without having to manually go through all of the steps each time - I just typed in a command and let it do the work for me.

#### The CLI

Before I could think about automation, I needed to install the AWS CLI tool so I could push up my scripts to CloudFormation. It is of course possible, again, to do this via the web console, but that would be too boring.

After installing, I configured it to use the Access Key and Secret Access key of an IAM user I created that had permissions for CloudFormation and EC2. Amazon likes to hint at you to do everything via users with the least amount of privilege, which I think is a very good idea. Best keep my root credentials safe.

    $ aws configure
    AWS Access Key ID [None]: <AWS_KEY>
    AWS Secret Access Key [None]: <SECRET_KEY>
    Default region name [None]: eu-west-1
    Default output format [None]: json
    

#### The script

CloudFormation is a wonderful tool. Much like the way Ansible automates the creation of a machine, CloudFormation automates the creation of an entire ecosystem within AWS. In my case, I used it to create three things: an EC2 Instance, an EBS Volume, and a Security Group. Complete overkill for my end goal - I could have done all of this manually - but very fun and worth learning.

So, let's get stuck in.

First, I needed to define a volume:

    "LsioPlexServerStorageVolume": {
        "Type": "AWS::EC2::Volume",
        "Properties": {
            "Size": "20",
            "VolumeType": "gp2",
            "AvailabilityZone": {
                "Ref": "AvailabilityZone"
            }
        }
    }
    

Nice and easy: I wanted a 20GB size volume, that's a General Purpose SSD (the kind allowed by the free tier), and it should be in my given Availability Zone. *Note*: I'm using `{ "Ref": "AvailabilityZone" }` rather than hard-coding the value because it means I can change it on a whim if I ever decide to redeploy this somewhere else. The reference is to a parameter defined at the top of the script. An Availability Zone is a distinct location within a Region and reflects the physical placement of my volume.

Next came my Security Group, which would define the inbound/outbound firewall rules for my instance:

    "LsioPlexServerFirewallRules": {
        "Type": "AWS::EC2::SecurityGroup",
        "Properties": {
            "GroupName": "LsioPlexServerFirewallRules",
            "GroupDescription": "Restrict inbound access only to the Plex and SSH ports",
            "VpcId": {
                "Ref": "AccountVPCId"
            },
            "SecurityGroupEgress": [
                {
                    "CidrIp": "0.0.0.0/0",
                    "IpProtocol": "-1"
                }
            ],
            "SecurityGroupIngress": [
                {
                    "CidrIp": "0.0.0.0/0",
                    "IpProtocol": "tcp",
                    "FromPort": "22",
                    "ToPort": "22"
                },
                {
                    "CidrIp": "0.0.0.0/0",
                    "IpProtocol": "tcp",
                    "FromPort": "32400",
                    "ToPort": "32400"
                }
            ]
        }
    }
    

I defined the firewall rules (to only allow ports 32400 and 22 inbound), and linked it to a VPC (my default). The EC2 instance is linked to the VPC via its allocated subnets, so this group must also link to the same VPC, although in this case, it does it directly.

Lastly, the really fun bit, the EC2 Instance:

    "LsioPlexServerInstance": {
        "Type": "AWS::EC2::Instance",
        "DependsOn": [ "LsioPlexServerFirewallRules", "LsioPlexServerStorageVolume" ],
        "Properties": {
            "ImageId": { "Ref": "PlexInstanceImageId" },
            "InstanceType": { "Ref": "PlexInstanceType" },
            "KeyName": "LsioPlexServer",
            "AvailabilityZone": {
                "Ref": "AvailabilityZone"
            },
            "NetworkInterfaces": [
                {
                    "AssociatePublicIpAddress": true,
                    "DeviceIndex": 0,
                    "SubnetId": { "Ref": "AccountSubnet" },
                    "GroupSet": [
                        {
                            "Ref": "LsioPlexServerFirewallRules"
                        }
                    ]
                }
            ],
            "Volumes": [
                {
                    "Device": "/dev/sdk",
                    "VolumeId": {
                        "Ref": "LsioPlexServerStorageVolume"
                    }
                }
            ],
            "UserData": {
                "Fn::Base64": {
                    "Fn::Join": [
                        "\n",
                        [
                            "#!/bin/bash -v",
                            "fstype=`file -s /dev/xvdk`",
                            "if [ \"$fstype\" == \"/dev/xvdk: data\" ]",
                            "then",
                            "    mkfs -t ext4 /dev/sdk",
                            "fi",
                            "mkdir -p /data/plex",
                            "mkdir -p /data/media",
                            "chmod 750 /data/plex",
                            "chmod 750 /data/media",
                            "mount /dev/sdk /data/media",
                            "mkdir -p /data/media/movies",
                            "mkdir -p /data/media/tv",
                            "chmod -R 750 /data/media",
                            "chown -R ec2-user:ec2-user /data/media",
                            "chown -R ec2-user:ec2-user /data/plex",
                            "echo \"/dev/sdk /data/media ext4 defaults,nofail 0 2\" >> /etc/fstab",
                            "yum update -y",
                            "yum install -y docker",
                            "service docker start",
                            "usermod -a -G docker ec2-user",
                            "docker create --name=plex --net=host -e VERSION=latest -e PUID=$(id -u ec2-user) -e PGID=$(id -g ec2-user) -v /data/plex:/config -v /data/media/tv:/data/tvshows -v /data/media/movies:/data/movies --restart=always linuxserver/plex",
                            "docker start plex"
                        ]
                    ]
                }
            }
        }
    }
    

There's quite a bit to take in with this configuration but it's all relatively trivial. I needed my instance to be based off an image, which I provided via `"ImageId": { "Ref": "PlexInstanceImageId" }` - again, another parameter reference. The instance type is much the same, as is the availability zone. The parameterisation of `AvailabilityZone` is useful here because my EC2 Instance and EBS Volume need to be in the same place.

Naturally I wanted my instance to be publicly accessible on the Internet, so I added a Network Interface and set it to use one of the three default subnets that AWS gave me. It made sense to choose the subnet that belonged to the same availability zone as the instance and volume (I'm not sure if using another one would have even worked). I also referenced my Security Group and Volume.

For security purposes, I also defined the `KeyName`, which references an EC2 Key Pair. I generated this in the AWS Management Console manually (I could have used the CLI but I figured this was just as good) and downloaded the generated `.pem` file. This would later be used to allow me to SSH in to my instance.

I could have stopped there and that would have been enough to have a fully functional EC2 Instance, but it would have been an empty shell, with nothing running in it. That's where the `UserData` section came in.

The `UserData` script runs when the instance initialises for the first time. It can include pretty much anything you want/need to finalise the deployment of the instance. In my case, I needed firstly to check the integrity of the attached volume by seeing if it was formatted. If not, then I made it an `ext4` filesystem. Then I could create my data folders and mount the volume to the corresponding mount location (`/data/media`). After ensuring the directories have the right permissions, I added a mount line to `fstab` and proceeded to install Docker.

The final thing to do before attempting to deploy this bad boy was to grab our Plex image and start it up in Docker. The command is no different to how we'd ask anyone to run our containers, with the slight exception of how I obtained the `PUID` and `PGID` of the instance's user (which is defaulted to `ec2-user`).

    -e PUID=$(id -u ec2-user) -e PGID=$(id -g ec2-user)
    

I did all of this manually but AWS also provides a template builder to help you visualise the stack you're creating. Here's what my very simple stack looks like:

![CF Stack visualised](/content/images/2017/07/chrome_2017-07-16_10-11-11.png)

If you'd like to see the script in full, I have uploaded it to our [AWS GitHub Repository](https://raw.githubusercontent.com/linuxserver/aws/master/lsio-plex.json).

## Deploying!

Now I can finally put this on AWS! It only took me about four hours of research and scripting. It would have probably taken me about half an hour to do it all manually but I'm an idiot and like to over-complicate things in the name of science (and boredom).

I went back to the CLI and used the following command to deploy my stack:

    aws cloudformation create-stack \
        --stack-name LsioPlexMediaServer \
        --template-body file://E://Users/Josh/Documents/lsio-plex.json \
        --parameters ParameterKey=PlexInstanceType,ParameterValue=t2.micro ParameterKey=PlexInstanceImageId,ParameterValue=ami-d7b9a2b1 ParameterKey=AccountVPCId,ParameterValue=<MY_VPC_ID> ParameterKey=AccountSubnet,ParameterValue=<SUBNET_2_ID> ParameterKey=AvailabilityZone,ParameterValue=eu-west-1b
    

After which I then went to the CloudFormation console in AWS and watched my server get created.

![Stack in create status](/content/images/2017/07/chrome_2017-07-15_21-28-09.png)

Once it had finished deploying, I went over to EC2 and checked the status of my instance:

![Initialising Instance](/content/images/2017/07/chrome_2017-07-16_10-15-50.png)

I could see that it was in a state of "Initializing", which told me that my `UserData` script was running. It took a few minutes for that to change to "2/2 checks passed".

![EC2 showing complete](/content/images/2017/07/chrome_2017-07-16_10-18-33.png)

That was it. My instance was running, the volume had been mounted, and most importantly, it had been assigned a public IP address for me to use! So, that's what I did:

![Plex is alive](/content/images/2017/07/chrome_2017-07-16_10-19-35.png)

IT'S ALIVE!

## Configuring Plex Remotely

One of the security features of Plex is that you can't just log in to the application and set up the server configuration if you're not on the same network as the application. This meant that I needed to create an SSH tunnel to my new instance and map the port locally. This was relatively easy to do.

Using the `.pem` file I generated previously, I imported it in to PuTTY and created a tunnelling rule:

![PuTTY tunnel](/content/images/2017/07/putty_2017-07-16_10-24-10.png)

When I then navigated to `http://localhost:8888/web`, I was directed to my running instance, which saw me as coming from its own local network, allowing me to start the set up process once I'd logged in:

![Plex Setup](/content/images/2017/07/chrome_2017-07-16_10-29-04.png)

I gave it a simple name called "aws" for the time being just to get through the setup process. I did notice that my first attempt at creating a name failed, although a second attempt passed.

Using the directory I had created in the CloudFormation script, I added a "Films" library and finished the setup process.

The final piece of configuration was to ensure that the library was being shared over the correct port, so I went to **Settings** -> **Server** -> **Remote Access** and checked "Manually specify public port", setting the port value to `32400`.

![Remote access enabled](/content/images/2017/07/chrome_2017-07-16_10-37-00.png)

For some strange reason, the first attempt at this failed, but another attempt (without changing anything) worked fine.

## Uploading Content

Well, I had a running Plex server, which was nice, but it was no good without something to stream from it. My next quest was to find a way of getting some content to it. In the end I settled on using SFTP (with my `.pem` file as authentication) and transferring data directly to my mounted volume. Using FileZilla, I uploaded a couple of films to test and then scanned my library.

![SSH showing films](/content/images/2017/07/putty_2017-07-16_10-58-02.png)

## Performance

The real question I'm sure you'll have now is whether or not this solution is performant enough to deal with the heavy task of video transcoding and network streaming.

#### Video

While watching Sintel, I could clearly see in the usage logs that transcoding a 1080p movie at `8 Mbps 1080p` caused the CPU usage to jump to 100%. This can be problematic if it remains at this level for an extended period of time (for example, streaming the extended version of Fellowship of the Ring - that's four hours) because 100% utilisation consumes CPU credits, which will eventually run out if usage is left high for too long. While this doesn't cost anything, it'll choke-hold your instance so that the credits can replenish.

![CPU activity over time](/content/images/2017/07/chrome_2017-07-16_11-21-51.png)

The above graph shows how the CPU was happily idling until I started watching a film that required transcoding. The usage quickly shot up and remained between 90%-100% until I switched the quality level to `Original`, which promptly released the strain from the CPU. Usage dropped because a quality level of `Original` bypasses the server's need to transcode the video on-the-fly, instead opting to stream the video as-is to the client, which takes on the responsibility of transcoding instead. Below is the rate of consumption of CPU credits based on my usage:

![CPU credits](/content/images/2017/07/chrome_2017-07-16_11-35-22.png)

#### Network

It seems that even the modest network speed of a `t2.micro` instance is enough to deal with streaming at least a single video to a client. For anyone sharing libraries with multiple people, it is likely it'll choke under the demand.

![Network usage](/content/images/2017/07/chrome_2017-07-16_11-28-24.png)

The network usage is interesting to observe as in this case I can see that throughout my viewing of Sintel, EC2 sent out just under 750MB of data to my PC. The version of Sintel I have is the 1GB 1080p MKV, so it's clear that Plex is quite efficient at dropping the overall file size to suit different connection speeds. This particular transfer size reflects the whole film's duration.

## Cost

The last question you may now have is "how much is this going to cost me?". The answer, anticlimactically, is probably "it depends". AWS's pricing model is relatively competitive but the costs can very quickly add up, especially once you're out of the grasp of the Free Tier (which expires after 12 months).

My EC2 instance is on "On-Demand" pricing, which means that it's an hourly   fixed rate, regardless of the CPU usage (credits notwithstanding). It's a pretty inefficient pricing model for something designed to always be on. Let's break it down:

1. A `t2.micro` instance costs $0.013 per hour*, or $0.312 per day. That's **$113.88 per year**. Already that's a high price to pay for something you're likely going to use maybe a few hours a day.
2. However, the caveat to this is you can just turn it off when you're not using it. So, assuming you only have it running when you want to use it - say, four hours a day - your costs drop down to **$18.98 per year**. That's a bit more like it.
3. If you set up a task rule in AWS to automatically shut down your instance overnight, or while you're at work, you can have it running at times you know you're going to want it, while still reducing overall compute costs.

* Different regions in AWS will charge slightly different rates.

But that's not all! The instance has been costed, but we've still got the storage to think about. I used a small 20GB SSD for the sake of my test, but some people may want more. EBS does provide much larger volumes but at a cost.

AWS charges you for how much storage space you *provision*, not how much you use. For streaming, I believe "Throughput Optimized HDD (st1) Volumes" to be the best option as they provide a good balance of storage space and read speeds. The pricing model for EBS is a bit more confusing than EC2 because the costs are prorated on an hourly basis, but the general idea is the same:

1. EBS storage (`st1`) costs $0.05 per GB-month, so if we provision 1TB (1000GB) and have it attached to an instance (regardless of whether or not it's running), the monthly cost for that storage is **$50.00**! Utterly mental and in no way cost effective!
2. However, this is for *provisioned* storage, so costs can be reduced by creating a snapshot of the volume, then deleting the provisioned storage when the instance isn't running. AWS's pricing for snapshots is different as it charges for *used* storage, rather than provisioned. If you have only used 300GB of your volume, your monthly cost drops to **$15** for the snapshot. Still a bitter pill to swallow.

So, we've established that it's the storage that's a real kicker regarding costs. The problem is, we've not even thought about *transfer* costs. That's right, AWS also charges for network activity!

Thankfully, AWS doesn't charge for inbound `Internet -> EC2` traffic, so getting the data into the instance isn't a problem. The costs start accruing when data *leaves* EC2 back into the wilds of the 'net. Thankfully, the rates are easy enough to figure out:

1. The first GB of outbound traffic is free.
2. For the next 9999GB of data, the rate is $0.09 per GB.
3. The next 30TB are a tiny bit cheaper at $0.085 per GB.

So, let's say I watch a few episodes of my favourite shows on a daily basis. Each episode is roughly 1.5GB in size, and I stream at `Original` quality, so no change to the file size during streaming. Per day, my outbound traffic is 4.5GB, so that'll cost me **$0.32 per day**. That's **$9.45 per month** just for the luxury of streaming! Yeesh. That doesn't even account for the occasional movie.

The total monthly cost for an instance running for four hours a day, plus 500GB of provisioned storage (without snapshot), streaming around 4.5GB per day comes in at:

**$1.56** + **$25.00** + **$9.45** = **$36.01** per month

## TL;DR - Is it worth it?

No.
