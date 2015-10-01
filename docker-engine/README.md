![docker-engine-banner](http://blog.docker.com/wp-content/uploads/2013/08/KuDr42X_ITXghJhSInDZekNEF0jLt3NeVxtRye3tqco.png)

# docker-engine
*Note: before reading this talk, you should read the talk on [getting started](../README.md)*

The docker-engine (AKA "docker") let's you create and run containers, which are like "instances" (think "object" from OOP) of an image (think "class" from OOP).

So let's talk a little about images and then we can focus on containers.

## Images
Basically, an image is a tar file that's tracked by the docker registry, which is local on your machine (think, "an image is like a package and the registry is like a package manager"). However, unless you're making an image from scratch, you don't need to really think about them like this. The reason for this, is it's much more common to build images from base images. Let's try it out.

### Creating a `Dockerfile`
Really any image can be a base image, which you can think of as a super class in classical OOP. To do this, we use a `Dockerfile`, which is just a lightweight configuration file that describes the image and what instances of that image do. So let's make one!

For our app, we're going to make a web server for displaying team documentation. To do this we're going to use a tiny bit of ready-made node.js for our server, located in the `team-documentation` directory.

*NOTE: You can see the individual steps for how I did that in the team-documentation's README, although it's entirely unnecessary (really, it's just there so there's no mystery in case anyone's interested).*

So we'll use a Dockerfile for this

```Dockerfile
FROM        node                        # base image to use
MAINTAINER  Spencer Scorcelletti <spencer.scorcelletti@salesforce.com>
ADD         ./team-documentation /code  # add our source code
WORKDIR     /code                       # establish a working directory
RUN         npm install                 # install dependencies
EXPOSE      3000                        # export port 3000 to the outside world
CMD         npm start                   # i.e. "do this when someone runs you, unless they say otherwise"
```

### Building our image

And now we can build a new image from our Dockerfile

```bash
docker build -t team-documentation .
```

When the base image starts to download, you're going to probably see output that looks like this.

```bash
c49f83e0b13: Pull complete
4a5e6db8c069: Pull complete
f972ade4c9d5: Downloading [================>                                  ] 6.079 MB/18.54 MB
a0b6d62d8b49: Download complete
8f45ce3be01e: Downloading [>                                                  ] 1.062 MB/128.2 MB
92799560b5e5: Download complete
1aaebca15436: Download complete
f7dd404e4982: Download complete
9ad66df731b7: Downloading [=================>                                 ] 4.606 MB/13.51 MB
8bcf3464832e: Download complete
```

What's happening here is it's pulling the base image as a bunch of "layers". Docker's build process is very efficient, with heavy caching throughout the entire development life-cycle. What's happening here is that each hash on the left is a `sha1` of that binary, which gets applied to the image. Sometimes pulling public images can be slow, but each layer is cached and can be unwound and reapplied.

To demonstrate this, if we ran `docker images` while this was being downloaded, we'd see an entry in the registry that looks like below.

```bash
REPOSITORY          TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
<none>              <none>              a0b6d62d8b49        7 days ago          291.8 MB
```

That's the partial image, which is composed of each one of those layers applied to each other. So, in this example, since the image isn't finished downloading it hasn't been given a `REPOSITORY` or `TAG` yet, but it still has an id.

After all the layers of the base image are downloaded, each step in the Dockerfile is applied as well, with snapshotting taking place for each one for more caching.

```
Status: Downloaded newer image for node:latest
 ---> 8bcf3464832e
Step 1 : MAINTAINER Spencer Scorcelletti <spencer.scorcelletti@salesforce.com>
 ---> Running in 010b3c237efc
 ---> f5953613de35
Removing intermediate container 010b3c237efc
Step 2 : ADD ./team-documentation /code
 ---> 564e1cb0384e
Removing intermediate container f3451713d990
Step 3 : WORKDIR /code
 ---> Running in 443d94c471ba
 ---> adc6cd8d630f
Removing intermediate container 443d94c471ba
Step 4 : RUN npm install
 ---> Running in 1f5fced8e353
 ---> 12a212726f46
Removing intermediate container 1f5fced8e353
Step 5 : EXPOSE 3000
 ---> Running in 52c8dfe49816
 ---> d4baa4b29fe8
Removing intermediate container 52c8dfe49816
Step 6 : CMD npm start
 ---> Running in b05d9f0ad848
 ---> ea36e1c2addd
Removing intermediate container b05d9f0ad848
Successfully built ea36e1c2addd
```

Each one of those hashes are an additional layer applied to the image. If one step is illegal or breaks something, then when you resume the build it'll just pick up from there. Very efficient, and very quick builds (besides downloading the base image, but you can always make your own, super efficient base image!).

Now when we run `docker images` again, we see our partial image has gone away and we have a nice base node image, as well as our "team-documentation" image.

```bash
REPOSITORY           TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
node                 latest              8bcf3464832e        2 days ago          641.6 MB
team-documentation   latest              5ee862269efb        11 minutes ago      645.3 MB
```

Now we're ready to run it!

## Containers

So we talked about images, and it was mentioned that containers are *instances* of images, but in less abstract terms, what does that actually mean? In reality a container is just a process, much like any other process on your system. That's how they're able to be so lightweight when starting and stoping. They're able to share CPU/memory resources of their host.

People often think of containers as "better" VMs. This is incorrect and also bad, because they solve different problems.

The mechanisms that docker employs for containers to appear *similar* to a VM, in terms of it having it's own process space, file system, and network stack is really just smoke and mirrors called *kernel level virtualization* and this has been around for a really long time. The only difference is Docker just came along and abstracted things in a convenient way, by using namespacing and cgroups. There's a lot more to it than that, but to demonstrate what I'm saying, here's [bocker](https://github.com/p8952/bocker), a bare  implementation of a lot of what Docker has to offer in < 100 lines of bash...

### Let's run it!

Ok, here we go. Super easy.

```bash
docker run      \
  -d            \
  -p 3000:3000  \
  team-documentation
```

Let's break this down real quickly
* `-d` this means run my container as a daemon
* `-p 3000:3000`  this means map port 3000 on the docker host to port 3000 on the container
* `team-documentation` the image to run an *instance* of, i.e. *container*

And now let's test it out

```bash
URL=$(machine ip dev):3000
echo $URL | pbcopy
curl $URL
```

Or... we can open our browser by pasting from our clipboard

Ta da!

## Next

See the [docker-compose](../docker-compose/README.md) talk
