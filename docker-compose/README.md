![docker-compose-banner](../media/octopus_blocks_die.png?raw=true)

# docker-compose
*Note: before reading this you should read the talk on [docker-engine](../docker-engine/README.md), first.*

Now that we have the ability to make images and run them as containers, let's talk in more useful terms: composing an application from multiple containers (think, services).

## Our "app"
In `app.py` we have code for a simple web server in python that uses [reddis](http://redis.io/) to increment a counter that keeps track of the number of `GET` requests our server receives. Let's take a look at it real quickly.

```python
#app.py
from flask import Flask                 # get dependencies
from redis import Redis

app = Flask(__name__)                   # make our flask object
redis = Redis(host='redis', port=6379)  # make our redis object

@app.route('/')                         # some metaprogramming to define a url route and how to handle it
def hello():
    redis.incr('hits')                  # increment our counter key and print the result to the page
    return 'Hello World! I have been seen %s times.' % redis.get('hits')

if __name__ == "__main__":              # start our server, accepting connections from any ip
    app.run(host="0.0.0.0", debug=True)
```

This is cool, but it's only half (more like 1/3) the battle. If we only had this code, it still wouldn't be enough because we still need

1. A computing environment (with our code) to run on
1. Python and Flask installed
1. An existing redis service, correctly configured, already running to connect to

## Our Dockerfile

Ok, so 1 and 2 are easy. To do this we use a `Dockerfile` that defines what we want. Let's take a look at the one in our repo.

```dockerfile
#Dockerfile
FROM python:2.7                       # build this image on top of a Python image
ADD . /code                           # add our code
WORKDIR /code                         # establish a new working directory
RUN pip install -r requirements.txt   # relative to our working directory, install prerequisites
CMD python app.py                     # when someone runs our container, start our server
```

Now we can start our app, but it won't do much because we still don't have a service that it depends on.

*Note there are other reasons why this wouldn't work on its own too, but they're less important. Think about how in the [docker-engine talk]('../docker-engine/README.md') we used 'EXPOSE' in our Dockerfile - that's missing here.*

## Our docker-compose.yml

Ah at last we're going to have a working app. If you'll recall from above, the missing ingredient from our list of stuff we needed was this blasted redis service (that's also configured correctly, e.g. with a host name `redis` and listening on port `6379`).

So, at this point you might be thinking, "what about another Dockerfile like the one above?". That's the right way to think! But we can do a lot better than just that. Instead of having a single service, we want to make an *application* that's **composed** of different containers (i.e. processes or services) that works together like a collective whole.

Let's look at this docker-compose.yml file

```yml
web:                # we define a "web" component (i.e. our python app)
  build: .          # build from our Dockerfile (instead of a prebuilt image, for example)
  ports:            # expose these port, left being host and right being our container
   - "5000:5000"  
  volumes:          # mount our /code volume in our container to our host so we can edit it
   - .:/code
  links:            # connect to our redis component (defined just below)
   - redis
redis:              # we define a "redis" component
  image: redis      # and we just use a standard, prebuilt redis image so it's nice and easy
```

And now we're set! We're ready to start out up.

```bash
docker-compose up                     # run the whole composition
curl $(docker-machine ip dev):5000    # Issue a GET
```

We should see output similar to this:

```bash
Hello World! I have been seen 1 times.
```

And if we do it again, we'll see the counter incremented.

## Editing our app live

So you may think that because

1. we're running our app on a container,
1. which talks to another container,
1. both of which live on a host VM,
1. that lives on a hypervisor running on top of the os running on our native machine

That this would make changing anything really difficult. The cool thing is that Docker has pretty dang good APIs and abstractions, specifically in the sense of what comes out the box and the granularity of control provided.

In this case, because we added our `/code` dir (which lives in our "web" container) as a volume, we can actually just edit the code right there and it works. So let's try it!

```bash
perl -pi -e 's/Hello/Yo/g' ./app.py   # You can also use a text editor, btw :)
curl $(docker-machine ip dev):5000
```

And we should see something like this!

```bash
Yo World! I have been seen 3 times.
```

## Next

See the [docker-swarm](../docker-swarm/README.md) talk
