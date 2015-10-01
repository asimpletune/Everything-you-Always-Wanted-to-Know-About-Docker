# team-documentation
A simple static file server meant to demonstrate how GitHub pages (i.e. "gh-pages") can be used for making documentation at SFDC better.

## Design Goals
Before we go off and start writing code, let's talk about what are we actually trying to accomplish?

1. **Human-first**: documentation is meant for people. This means more than a single document being easy to read. It should also include how "discoverable" is new documentation. Think, "How easy is it for my boss's boss's boss to go to a team's site in his organization and get an crystal clear picture of what *exactly* do we do and are we doing a good job?".
  * There should be a nice, clean layout. Typically team sites have the "b-tree" problem, where the breadth of the tree is very wide, but it's very shallow. This make it really difficult to read and makes it difficult to maintain (which in exasperates the readability).

1. **Simple**: it should be easy to author, setting the technical bar, let's say, to being able to use a text-editor and git.
  * This automatically excludes HTML as that should serve as the layout or "bones" of our site. We want to focus on content.

1. **Powerful/flexible**: it should be easy to take advantage of everything that makes up good documentation, but not be too opinionated, so we can avoid creating one-size-fits all syndrome.
  * Some people like to link to google docs, some people like to write their documentation in markdown so it's maintained with their project in source control. An all of the above strategy is important so everyone can participate.


### Backend
So, to accomplish all of this, we're going to want a very simple static file serve, like how GitHub's gh-pages work. That'll provide our backend.

### Front-end
HTML looks great when rendered, but for actually writing content it's not nearly as easy, intuitive, or readable as markdown or google docs. So we'll try writing a little bit of html that can be reused everywhere to serve as the layout of the site. For content we can either link to google-docs or to our markdown file, using something like [readout](https://github.com/asimpletune/readout) (I made this, btw).

## Let's code!
*Please keep in mind, this is how I made the code that's already here, fully-baked. For the full experience, you should follow these steps in a fresh directory, though it should be simple enough just to read this document.*
**Prerequisites**
1. [nodejs](https://nodejs.org) `brew install node`
1. [express-gen](npm install express-generator -g) `npm install express-generator -g`

**Optional but nice**
1. [nodemon](https://www.npmjs.com/package/nodemon) `npm install nodemon`


### Setup our server

We're going to create our server in node using the express framework, and then add our front-end code.

```bash
express --git team-documentation          # generate server
cd team-documentation && npm install      # install dependencies
echo "hello, world" >> public/index.html  # put some content in an html file (to be statically served)
nodemon bin/www                           # start our server on localhost:3000
```

We can see if this worked by curl'ing our server

```bash
curl localhost:3000
```

We should see output like `hello, world`

### Add some html for layout
For the layout we'll just use some simple [bootstrap](http://getbootstrap.com/examples/starter-template/) + HTML, using a starter-template that I found [here](http://getbootstrap.com/examples/starter-template/). That way we get a nice looking, clean site without having to do ALL of the work ourselves.

```bash
curl -L http://getbootstrap.com/examples/starter-template/ > public/index.html
curl -L http://getbootstrap.com/dist/css/bootstrap.min.css > public/stylesheets/bootstrap.min.css
curl -L http://getbootstrap.com/examples/starter-template/starter-template.css > public/stylesheets/style.css
curl -L http://getbootstrap.com/dist/js/bootstrap.min.js > public/javascripts/bootstrap.min.js
perl -pi -e 's/..\/..\/dist\/css\/bootstrap.min.css/\/stylesheets\/bootstrap.min.css/g' ./public/index.html
perl -pi -e 's/starter-template.css/\/stylesheets\/style.css/g' ./public/index.html
perl -pi -e 's/..\/..\/dist\/js\/bootstrap.min.js/\/javascripts\/bootstrap.min.js/g' ./public/index.html
```

Above, I just curl the template and use a few regexes to rewrite where stuff lives, based on where we put it.

### Front-end code for rendering documentation

So as was mentioned above, we want to use this to document itself. To do that we should put a copy of the documentation in our public folder, and then use readout.js to render it. First we'll need to create a new directory to store our docs and make readout and its dependencies available.

```bash
mkdir public/docs
curl -L https://cdnjs.cloudflare.com/ajax/libs/showdown/1.2.3/showdown.min.js > public/javascripts/showdown.min.js
curl -L https://raw.githubusercontent.com/asimpletune/readout/master/readout.js > public/javascripts/readout.js
```

Now that we have readout and showdown installed we should add the following lines to our document.

```html
<script type="text/javascript" src="/javascripts/showdown.min.js"></script>
<script type="text/javascript" src="/javascripts/readout.js"></script>
```

And let's add some documents

```bash
cp README.md ./public/docs
```

And, let's add a reference to the documentation

```html
<div data-readout-src="docs">
  <div data-readout-src="README.md"></div>
</div>
```
And. finally, make sure that readout gets called when the page is loaded. So we'll add this to the bottom of our `body`.

```html
<script type="text/javascript">
  $(function() {
    Readout();
  });
</script>
```
