![banner](http://collabnix.com/wp-content/uploads/2015/07/DockerEco.jpg)
# docker-demo
Containers, composing applications out of them, and managing clusters of applications.

## Intro
This is meant to be a short demo to try to give a breadth-first overview of the container approach. The intention is to provide an introduction to the concepts involved. Please note, depth may suffer.

This presentation is for people using OS X. It can easily be converted to another platform, if you'd like.

### Prerequisites
* OS X
* [Homebrew](http://brew.sh) - this demo uses brew as a package manager, though it's not a hard requirement
* You MUST be off Cisco AnyConnect VPN, and reboot your computer if you were on it

### Installation

```bash
brew update && brew doctor  # you might have to fix some neglected stuff
brew install docker \
  docker-compose    \
  docker-machine    \
  docker-swarm              # install dependencies
```

## Concepts

One thing that's important is to explain sort of the "inception-ness" that happens with docker. When you start dealing with VMs, docker containers/images, composition of containers, docker hosts/clients, swarms of hosts, etc... it can get really confusing but it's simple. So let's just explain it now.

### Docker architecture
There are a few basic elements that Docker needs to work.

1. The docker runtime (i.e. docker-engine)
1. A docker daemon
1. A Docker client
1. A docker host

We'll talk about briefly about what each of these do, but first let's try to get the idea just visually.

#### Docker hosted bare-metal (Linux)

![docker on bare metal](https://docs.docker.com/installation/images/linux_docker_host.svg)

#### Docker hosted on a VM (Linux), hosted on bare-metal (OS X)

![docker on OS X](https://docs.docker.com/installation/images/mac_docker_host.svg)

#### The docker runtime (i.e. docker-engine)
This is what actually allows you to run on containers, which you can think of as "processes".

#### The docker daemon
This is like the "process manager" of all of the containers.

#### The docker client
This is what lets you interface with the docker daemon.

#### The docker host
This is what "hosts" the docker daemon, but the client doesn't have to live on the same host (or even on the same physical machine for that matter).

![docker-machine-banner](https://www.docker.com/sites/default/files/products/docker_machine.png)

## docker-machine
People have been using docker for a while, and there's a general consensus that hosting docker on physical hardware is NOT a good idea. This is mostly because you lose security, flexibility, ease of development, and the ability to reason about the environment that's hosting docker. The only benefit is performance. So it's going to depend on what your application is, but I'm going say that about 95% of the time you're going to want to use a VM to host your docker daemon. This has become such an overwhelming opinion that Docker has canonized their own way of hosting docker containers, and it's GREAT. It's called docker-machine.

### setup

Using docker-machine is ridiculously easy.

```bash
docker-machine create -d virtualbox dev
```

Boom, done. Let's breakdown what's going on here.
* `create` this is the command to created a new "docker-machine"
* `-d virtualbox` this is short for "driver". Here we're using `virtualbox` as our driver but you can use pretty much any driver (it supports almost all of them, including the cloud stuff).
* `dev` this is the name of our docker-machine

Now we have to tell our docker client which host to connect through.

```bash
eval $(docker-machine env dev)
```

That basically sets all the environment variables to configure our client by evaluating the result of the subshell. If we didn't run `$(docker-machine env dev)` in a subshell it'd look like this

```
export DOCKER_TLS_VERIFY="1"
export DOCKER_HOST="tcp://192.168.99.105:2376"
export DOCKER_CERT_PATH="/Users/spencer.scorcelletti/.docker/machine/machines/dev"
export DOCKER_MACHINE_NAME="dev"
# Run this command to configure your shell:
# eval "$(docker-machine env dev)"
```

Pretty straight forward.

### Using docker-machine

For a list of commands try

```bash
docker-machine
```


To demonstrate that our client is correctly configured, let's try starting our first container!

```bash
docker run hello-world
```

We should see output similar to This

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from hello-world

535020c3e8ad: Pull complete
af340544ed62: Pull complete
Digest: sha256:a68868bfe696c00866942e8f5ca39e3e31b79c1e50feaee4ce5e28df2f051d5c
Status: Downloaded newer image for hello-world:latest

Hello from Docker.
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker Hub account:
 https://hub.docker.com

For more examples and ideas, visit:
 https://docs.docker.com/userguide/
 ```

This shows us that our client is correctly configured, and is communicating with docker daemon, which is hosting on our docker-machine, which is hosted bon our native mac hardware!

P.S: you can ssh into the machine too

```bash
docker-machine ssh dev
```

And now we have a prompt to our docker-machine!

**Note:** You shouldn't really need to do this. If you do, be read-only. Immutable infrastructure is a good idea.

## Next

See the [docker-engine](./docker-engine/README.md) talk
