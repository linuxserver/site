---
title: Updating and Backing Up Docker Containers With Version Control
date: 2019-10-01T22:47:00Z
author: aptalca
tags:
  - docker
  - compose
  - update
  - automation
  - containers
  - backup
  - versioning
hero: ./featured.jpg
---

Docker compose is a great tool to manage docker containers and makes it easy to update containers using the `latest` tags of images. However, the simple `pull` and `up -d` operation, while convenient, does not offer any easy mitigation options if an updated image breaks a container. This article will focus on how to put in place those mitigation steps so if something goes wrong during an update, one can easily revert back to the last working state.

## Issues with the `latest` tag

Most docker aficionados and enterprise users will tell you that using `latest` tags in docker  images is not good practice. See our blog article titled ["The dangers of pulling :latest"](https://blog.linuxserver.io/2018/04/22/the-dangers-of-pulling-latest/) for more insight on that. While true, using the `latest` tag makes it much easier to keep containers up to date for home users. Considering the fact that LinuxServer.io releases new images not only when there is an app update, but also when there are OS package updates, there can be frequent updates to our images. Of course no one would argue against updating OS packages from a security perspective. However, having to manually update docker image tags in the compose yamls every time there is an image update would require a significant time commitment and is not very practical or feasible in the real world. Like most of our users I imagine, I also use `latest` tags in compose yamls for convenience and issue `pull` and `up -d` operations whenever I can.

There are various reasons why an update of containers can go wrong. New images may have issues or new app or package versions may not be compatible with existing data (our images are automatically built and published and although our Jenkins does certain tests on the new image before publishing, they are not very extensive and do not cover updating with existing data). Currently, when an update breaks things, our recommendation is to go back to the previous tag. In most cases, the user has no idea which previous image they were using (as they know them only by the `latest` tag, rather than the versioned tags). So they would have to dig through the tag listings on Docker Hub and try older versioned tags and see if any of them work. This is not only time consuming, but also requires a higher degree of knowledge of Docker Hub and the `tag` concept.

## Scripting versioned backups and updates

I will share with you a set of scripts I came up with to mitigate this problem, so one command can back up the data, update the containers, another command to restore to the previously working state, and another to resume updates to `latest` again. Let's start with the individual components and concepts first, and we'll put together the whole script at the end.

## Update concept

Before we update the containers, we need to preserve the current working state. There are three components to that:

- App data (`/config` folder and any other mapped folder that needs to be persistent)
- Docker image (the specific tag for the image our container is currently based on)
- Docker compose yaml

With these three components, we can create an exact replica of our current working containers.

### Backup concept

App data can be backed up via `tar` and stored in an archive file on the same machine or a remote machine. App data can also be transferred to another machine via rsync or any other copy protocol. In this case, we will use a tar archive but feel free to substitute your own method.

### Repo digest

Getting the specific tag of the current image is a two step process. We first need to query the local image tag via `docker inspect --format='{{ .Image }}' <container_name>` . Then we use that local image tag to query the repo digest of the image, which will let us pull that very same image from Docker Hub: `docker inspect --format='{{ index .RepoDigests 0 }}' <local_image_tag>`. That will spit out a `repo digest` that looks like `linuxserver/mariadb@sha256:1986f7bd4c842931b830be2f7ac03fcb8d2a83be3c7784cf1471d0d8938a4487`, which will point to the current image our container is using on Docker Hub so we can pull it later if needed.

Saving the docker compose yaml is as simple as copying and renaming the file into our backup location for our reference later.

Once these three steps are completed, our script can successfully do the `pull` and `up -d` operations to update our containers because we have preserved the critical information required to recreate our last working state exactly.

## Restore concept

If something breaks, we can restore the last working state with the following steps:

- Stop and remove the containers
- Restore app data from the backup (untar, or rsync back)
- Edit the docker compose yaml to replace the `image:tag` directives with the `repo digests` we saved during update
- Perform `pull` and `up -d` to create containers based on the last working images and with the backed up app data

## Resume concept

As you can see, our compose yaml is now pointing to specific image tags (`repo digests`) of the last working images rather than `latest` so the `pull` /`up -d` operation will no longer update the images to latest. That means our script will also need a `resume` function to go back to the `latest` images after we confirmed that the issues that resulted in the break are mitigated.

## Constructing the script

### Script prerequisites & assumptions

Now let's try to put that whole structure into a somewhat automated script. But first, let's establish some prerequisites and assumptions:

- This script will assume that there is only one docker compose yaml that manages various services
- The app data for all containers reside under a single dedicated folder (ie. `/home/user/appdata`)
- For full automation, we will require `yq` to be installed so we can parse the docker compose yaml and retrieve the service and container names. You can install `yq` via `sudo snap install yq` or other methods described [here](https://github.com/mikefarah/yq). Alternatively, we will include a method for you to manually input the container and image names into the script if you cannot or wish not to install `yq`.

Here's my folder structure that works with this script:
![](/content/images/2019/10/Annotation-2019-10-01-104002.png)
### User variables

First we'll set our user defined variables:

- `APPDATA_LOC="/home/user/appdata"` this will tell the script where the app data folder resides
- `COMPOSE_LOC="/home/user/docker-compose.yml"` this will tell the script where the docker compose yaml resides
- Then our script will figure out where to save the versions of images via `VERSIONS_LOC="${APPDATA_LOC}/versions.txt"` (Don't change this)

### Functions

Then we'll create 3 functions that can be called externally (`update`, `restore`, and `resume`), and have the script execute whichever is called:

    function update {
    }
    
    function restore {
    }
    
    funtion resume {
    }
    
    # Check if the function exists
    if declare -f "$1" > /dev/null; then
      "$@"
    else
      echo "The only valid arguments are update, restore, and resume"
      exit 1
    fi

### Update function

As mentioned above, our `update` function will do three things: 1) save the versions, 2) back up the app data, and 3) update images and recreate containers.

First, let's make sure `yq` is installed:

    echo "Searching for yq"
    if which yq; then
        echo "yq found, continuing"
    else
        echo "Please install yq first"
        exit 1
    fi

Here's how we figure out and save the versions:

    if [ ! -f "$VERSIONS_LOC" ];then
    	for i in $(docker-compose -f "$COMPOSE_LOC" config --services); do
    		container_name=$(yq r "$COMPOSE_LOC" services."${i}".container_name)
    		image_name=$(docker inspect --format='{{ index .Config.Image }}' "$container_name")
    		repo_digest=$(docker inspect --format='{{ index .RepoDigests 0 }}' $(docker inspect --format='{{ .Image }}' "$container_name"))
    		echo "$container_name,$image_name,$repo_digest" >> "$VERSIONS_LOC"
    	done
    else
    	mv "$VERSIONS_LOC" "${VERSIONS_LOC}.bak"
    	for i in $(cat "${VERSIONS_LOC}.bak"); do
    		container_name=$(echo "$i" | awk -F, '{print $1}')
    		image_name=$(echo "$i" | awk -F, '{print $2}')
    		repo_digest=$(docker inspect --format='{{ index .RepoDigests 0 }}' $(docker inspect --format='{{ .Image }}' "$container_name"))
    		echo "$container_name,$image_name,$repo_digest" >> "$VERSIONS_LOC"
    	done
    	rm "${VERSIONS_LOC}.bak"
    fi

If this is the first update operation, we pull the original (`latest`) images and tags from the compose yaml, if not, we pull them from the `versions.txt` that was saved last time. This is because once the `restore` function runs, we lose the original images from the compose yaml. This way, we preserve them in the `versions.txt` to be used during `resume`. 

Essentially, this part of the script retrieves and saves 3 pieces of info for each container in comma separated values, one line for each container: 

1. container name,
2. original image name and tag, and
3. repo digest of the current image. 

It will look something like this:

    mariadb,linuxserver/mariadb,linuxserver/mariadb@sha256:1986f7bd4c842931b830be2f7ac03fcb8d2a83be3c7784cf1471d0d8938a4487
    wordpress,linuxserver/nginx,linuxserver/nginx@sha256:40a929941fca10e2b38fe9575409eabb21fa3569a59c2de6ece1068dc27a7292
    letsencrypt,linuxserver/letsencrypt,linuxserver/letsencrypt@sha256:566386b5762721c36643103f882db70dfda9c4d2441133e40e754ae22f2db734

This `versions.txt` will be stored inside the app data folder so it can be backed up alongside the app data.

#### Alternative method without `yq`

If we can't or don't want to install `yq`, we can define our container and image names in the script manually instead. We can go ahead and comment out the two sections above, the one checking for `yq` and the one that writes the `versions.txt` and use the following code instead:

    CONTAINERS=( \
        letsencrypt,linuxserver/letsencrypt \
        mariadb,linuxserver/mariadb \
        phpmyadmin,phpmyadmin/phpmyadmin \
        )
    for i in "${CONTAINERS[@]}"; do
        container_name=$(echo "$i" | awk -F, '{print $1}')
        image_name=$(echo "$i" | awk -F, '{print $2}')
        repo_digest=$(docker inspect --format='{{ index .RepoDigests 0 }}' $(docker inspect --format='{{ .Image }}' "$container_name"))
        echo "$container_name,$image_name,$repo_digest" >> "$VERSIONS_LOC"
    done

You can enter all of your container and image names in the above format, comma separated, no spaces, and one container per line.

### Continuing with the update function

Although the second step in `update` is backing up the app data folder, we first need to stop the running containers. I also like to update the images prior to stopping the containers to minimize container down time, as the image update process can take a significant amount of time for larger images and/or on slow connections.

    sudo docker-compose -f "$COMPOSE_LOC" pull
    docker-compose -f "$COMPOSE_LOC" down

Then we save a copy of our docker compose yaml inside the app data folder as well and back it up:

    APPDATA_NAME=$(echo "$APPDATA_LOC" | awk -F/ '{print $NF}')
    cp -a "$COMPOSE_LOC" "$APPDATA_LOC"/docker-compose.yml.bak
    sudo tar -C "$APPDATA_LOC"/.. -cvzf "$APPDATA_LOC"/../appdatabackup.tar.gz "$APPDATA_NAME"

This will create an `appdatabackup.tar.gz` one folder up from our app data folder. Then we create the new containers as soon as backup is completed (to minimize downtime), and then fix our permissions and remove stale docker images:

    docker-compose -f "$COMPOSE_LOC" up -d
    sudo chown "${USER}":"${USER}" "$APPDATA_LOC"/../websitebackup.tar.gz
    
    docker image prune -f

Now we have updated our images and container, but we also preserved all the necessary info to recreate our last working state in a tar archive.

### Restore function

First we stop and remove the existing containers:

    sudo docker-compose -f "$COMPOSE_LOC" down

Then we move/rename the current (potentially broken) app data folder by appending it with an 8 digit random string (for reference):

    randstr=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-8};echo;)
    mv "$APPDATA_LOC" "${APPDATA_LOC}.$randstr"
    cp -a "$COMPOSE_LOC" "${COMPOSE_LOC}.$randstr"

Now we can restore our app data folder from the backup:

    mkdir -p "$APPDATA_LOC"
    sudo tar xvf "$APPDATA_LOC"/../websitebackup.tar.gz -C "$APPDATA_LOC"/../

And we can read the previously working image repo digests from the `versions.txt` file we saved before, and modify our docker compose yaml to pull those images:

    for i in $(cat "$VERSIONS_LOC"); do
    	image_name=$(echo "$i" | awk -F, '{print $2}')
    	repo_digest=$(echo "$i" | awk -F, '{print $3}')
    	sed -i "s#image: ${image_name}#image: ${repo_digest}#g" "$COMPOSE_LOC"
    done

Now that we have restored the last working app data and specified the last working image tags, we can create our containers to restore our last working state:

    docker-compose -f "$COMPOSE_LOC" pull
    docker-compose -f "$COMPOSE_LOC" up -d

### Resume function

Once we are ready to go back to the `latest` tags and resume updates, we can run the following function that reads the original image names and tags and put into our compose yaml:

    for i in $(cat "$VERSIONS_LOC"); do
    	image_name="$(echo $i | awk -F, '{print $2}')"
    	repo_digest="$(echo $i | awk -F, '{print $3}')"
    	sed -i "s#image: ${repo_digest}#image: ${image_name}#g" "$COMPOSE_LOC"
    done

Then we pull the images and recreate the containers:

    docker-compose -f "$COMPOSE_LOC" pull
    docker-compose -f "$COMPOSE_LOC" up -d

After this point, the `update` function will continue pulling the `latest` images.

## Full Script

Below is the full script. You only need to modify the first two variables to tell the script where the app data folder and the compose yaml reside. Then you can run the functions by appending to the script name. I named my script `manage` so I can issue `./manage update`, `./manage restore` or `./manage resume` (don't forget to `chmod +x manage` prior to executing).

    #!/bin/bash
    
    # Change variables here:
    APPDATA_LOC="/home/user/docker"
    COMPOSE_LOC="/home/user/docker-compose.yml"
    
    # Don't change variables below unless you want to customize the script
    VERSIONS_LOC="${APPDATA_LOC}/versions.txt"
    
    function update {
        echo "Searching for yq"
        if which yq; then
            echo "yq found, continuing"
        else
            echo "Please install yq first"
            exit 1
        fi
        if [ ! -f "$VERSIONS_LOC" ];then
            for i in $(docker-compose -f "$COMPOSE_LOC" config --services); do
                container_name=$(yq r "$COMPOSE_LOC" services."${i}".container_name)
                image_name=$(docker inspect --format='{{ index .Config.Image }}' "$container_name")
                repo_digest=$(docker inspect --format='{{ index .RepoDigests 0 }}' $(docker inspect --format='{{ .Image }}' "$container_name"))
                echo "$container_name,$image_name,$repo_digest" >> "$VERSIONS_LOC"
            done
        else
            mv "$VERSIONS_LOC" "${VERSIONS_LOC}.bak"
            for i in $(cat "${VERSIONS_LOC}.bak"); do
                container_name=$(echo "$i" | awk -F, '{print $1}')
                image_name=$(echo "$i" | awk -F, '{print $2}')
                repo_digest=$(docker inspect --format='{{ index .RepoDigests 0 }}' $(docker inspect --format='{{ .Image }}' "$container_name"))
                echo "$container_name,$image_name,$repo_digest" >> "$VERSIONS_LOC"
            done
            rm "${VERSIONS_LOC}.bak"
        fi
    
        # Alternative method that doesn't require yq. Comment out lines 11-34 if you're enabling this method.
        #CONTAINERS=( \
        #    letsencrypt,linuxserver/letsencrypt \
        #    mariadb,linuxserver/mariadb \
        #    phpmyadmin,phpmyadmin/phpmyadmin \
        #    )
        #for i in "${CONTAINERS[@]}"; do
        #    container_name=$(echo "$i" | awk -F, '{print $1}')
        #    image_name=$(echo "$i" | awk -F, '{print $2}')
        #    repo_digest=$(docker inspect --format='{{ index .RepoDigests 0 }}' $(docker inspect --format='{{ .Image }}' "$container_name"))
        #    echo "$container_name,$image_name,$repo_digest" >> "$VERSIONS_LOC"
        #done
    
        sudo docker-compose -f "$COMPOSE_LOC" pull
        docker-compose -f "$COMPOSE_LOC" down
    
        APPDATA_NAME=$(echo "$APPDATA_LOC" | awk -F/ '{print $NF}')
        cp -a "$COMPOSE_LOC" "$APPDATA_LOC"/docker-compose.yml.bak
        sudo tar -C "$APPDATA_LOC"/.. -cvzf "$APPDATA_LOC"/../appdatabackup.tar.gz "$APPDATA_NAME"
    
        docker-compose -f "$COMPOSE_LOC" up -d
        sudo chown "${USER}":"${USER}" "$APPDATA_LOC"/../appdatabackup.tar.gz
    
        docker image prune -f
    }
    
    function restore {
        sudo docker-compose -f "$COMPOSE_LOC" down
        randstr=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-8};echo;)
        mv "$APPDATA_LOC" "${APPDATA_LOC}.$randstr"
        cp -a "$COMPOSE_LOC" "${COMPOSE_LOC}.$randstr"
        mkdir -p "$APPDATA_LOC"
        sudo tar xvf "$APPDATA_LOC"/../appdatabackup.tar.gz -C "$APPDATA_LOC"/../
        for i in $(cat "$VERSIONS_LOC"); do
            image_name=$(echo "$i" | awk -F, '{print $2}')
            repo_digest=$(echo "$i" | awk -F, '{print $3}')
            sed -i "s#image: ${image_name}#image: ${repo_digest}#g" "$COMPOSE_LOC"
        done
        docker-compose -f "$COMPOSE_LOC" pull
        docker-compose -f "$COMPOSE_LOC" up -d
    }
    
    function resume {
        for i in $(cat "$VERSIONS_LOC"); do
            image_name="$(echo $i | awk -F, '{print $2}')"
            repo_digest="$(echo $i | awk -F, '{print $3}')"
            sed -i "s#image: ${repo_digest}#image: ${image_name}#g" "$COMPOSE_LOC"
        done
        docker-compose -f "$COMPOSE_LOC" pull
        docker-compose -f "$COMPOSE_LOC" up -d
    }
    
    # Check if the function exists
    if declare -f "$1" > /dev/null; then
      "$@"
    else
      echo "The only valid arguments are update, restore, and resume"
      exit 1
    fi
