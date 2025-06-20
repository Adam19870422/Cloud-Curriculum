> **NOTE:** if you are a learner and want to look at the published exercises, go back to the start page and navigate through the directory structure.

# Content development

This directory contains the exercise sources and information for content development.

## General

When you develop content for a new learning topic, use the existing content as a template. Typically there is one top-level directory for each topic. Have a look at the [start page](..).

## Style

### Slides

- Notes are often a bit more verbose, meant to inform the reader and give details - no matter if it is a trainer preparing a training or a learner who wants to do self-study
  - Trainers can and should of course adjust the notes to be less verbose, fit their presentation style / storyline, and focus on the things important for them
- Diagrams on slides are preferrably SVGs
  - You can use [Inkscape](https://inkscape.org/) for editing, it is whitelisted in the [Software Catalog](https://software-catalog.bss.net.sap/esd/Items/Details?PackageId=4237){target=_blank} and supports Mac, Win, Linux
    - We spotted issues with the performance on Mac, if it's too bad consider using a VM, or [Docker image](https://hub.docker.com/r/x11vnc/inkscape-desktop/)
  - You can use [Free SVG](https://freesvg.org/) for shapes, all shapes are licensed in [CCO 1.0](https://creativecommons.org/publicdomain/zero/1.0/) and can freely be used also in enterprise context
- If you do your own diagrams, consider the following to assure consistent proportions and look
  - Use [this diagram] as reference for the general look (arrow types, box types, ...)
  - Overall page/canvas width: ~300mm (=A4 in landscape mode)
  - Font: BentonSans
  - Font size: ~18-22 for the major blocks
  - Stroke width for boxes and arrows: ~0.5mm
  - Stroke color: 60% grey (=rgba 808080ff)
  - Use colors to convey semantics

### Exercises

are usually part of the material and written with [MkDocs](https://www.mkdocs.org/)

- The _starting points/code_ is usually contained in separate repos, it should be mentioned in the exercise description correspondingly 
- By default, testing is built-in, and test scenarios evolve together with the features
  - generally good test automation is for us a "default" that we'd like to see infused in our engineering culture
  - additionally it helps them so find errors sooner, when testing is manual, it often gets deferred to the end, and if then things are not working, analysis is much harder
  - there are exceptions, e.g. for logging fundamentals ([Java](https://pages.github.tools.sap/cloud-curriculum/materials/cndj/logging/java/) | [Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/cndj/logging/nodejs/)), testing is probably debatable and too advanced, so it's rather part of the "further reading"

## Content Delevopment

When developing a new module, make sure you create the directory structures for both the slides and the exercises as described below.
Otherwise the build may not pass successfully.

### Quickstart

In folder **`content-development`** simply run **`docker-compose up`** (_VPN connection required_) to start the development environment.

- **Slides** will be served on `http://localhost:8888/content-development/index.html`

- **Exercises** will be served on `http://localhost:8000/`

Alternatively, you can run either the **Slides** or the **Exercises** individually. Please see below for details.

### Developing Slides

The Slides are located in the root directory.
For each module/topic there is a new directory which has further directories following the structure:

- fundamentals: language-agnostic, general information on the topic
- <language name (e.g. nodejs/java)>: language-specific slide deck

#### Serve slides locally

- We use [Reveal.js](https://revealjs.com/) as technology for the slides
- We use a specific fork of the framework - more details can be found [here](https://github.tools.sap/EngineeringCulture/education/blob/master/how-to-create-slides-with-revealjs.md)

To serve the slides locally you can use the following commands from the project root directory (_VPN connection required_):

**Linux/Mac**

```shell
docker run --rm -it -v ${PWD}:/app/slides -p 3000:8080 -p 35729:35729 engineeringculture.int.repositories.cloud.sap/slides:latest
```

**Git Bash for Windows:**

```shell
docker run --rm -it -v `pwd -W`:/app/slides -p 3000:8080 -p 35729:35729 engineeringculture.int.repositories.cloud.sap/slides:latest 
```

You can then browse to: `http://localhost:3000/content-development/index.html`

*For details of the docker image used please see [slides-docker](https://github.tools.sap/EngineeringCulture/slides-docker).*

### Developing Exercises

The exercises are located in the `content-development/docs` directory.

#### Serve exercises locally

- We use [MkDocs](https://www.mkdocs.org/) as technology for the exercises
- Mkdocs is based on [Markdown](https://en.wikipedia.org/wiki/Markdown) and requires a build process

The easiest way to setup is using a Docker image. Start a container by running the below command in a terminal in the `content-development` directory. It will create a Docker container and mount the content of your current directory into it. The container will start a web server that builds your material on the fly.

**Linux/Mac:**

Run the script `./run-site [SITE]` within `content-development` directory, where `SITE` is one of the following values: `all`/`cndj`/`leaders`

**Git Bash for Windows:**

To serve `all` sites, run

```shell
docker build --tag cc-exercises . && docker run --rm -it -p 8000:8000 -v `pwd -W`:/docs cc-exercises
```

You can then browse to: `http://localhost:8000/`

### Testing the publish process locally

```sh
cd content-development
./build-site.sh
npx http-server -c-1 site
```

This will build the site and serve it locally with the same URL path schema like on Github pages,
i.e. `http://localhost:3000/cloud-curriculum/materials/...`
