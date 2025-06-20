
## 🎯 Learning Objectives

In this module you will learn the basics of containers using [**Docker**](https://www.docker.com/){target=_blank}.

## 🧠 Theory 

[**Containers**](https://www.docker.com/resources/what-container){target=_blank} are a standardized unit of software that allows developers to isolate their app from its environment, solving the *“But it works on my machine!”* headache.

[**Docker**](https://www.docker.com/){target=_blank} is a software platform that allows you to build, test, and deploy applications quickly. Docker packages software into standardized containers that have everything the software needs to run including libraries, system tools, code, and runtime. Using Docker, you can quickly deploy and scale applications into any environment and know your code will run.

## 💻 Exercise

### 🧰 Prerequisites

For this tutorial you will require

{% include 'snippets/docker.md' %}

- **Docker Compose** (install on your platform following [these instructions](https://docs.docker.com/compose/install/){target=_blank})

- an IDE (e.g. [Visual Studio Code](https://code.visualstudio.com/){target=_blank} or [IntelliJ IDEA](https://www.jetbrains.com/idea/){target=_blank})

### 🚀 Getting Started

{% with branch_name="docker", folder_name="docker" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

### 1 - Running a Basic Web Server

Let’s jump right into it and run a basic web server using the [official NGINX image](https://hub.docker.com/_/nginx){target=_blank}.

!!! tip "nginx"

    [nginx](https://nginx.org/en/){target=_blank} is a HTTP and reverse proxy server, a mail proxy server, and a generic TCP/UDP proxy server.

1. Run the following command to start the container:

    ```shell
    docker run -it --rm -d -p 8080:80 --name web nginx:alpine
    ```

    Give it a few seconds to pull the docker image and to start up.

1. Open your favorite browser and navigate to [http://localhost:8080](http://localhost:8080){target=_blank}

    You should see the NGINX welcome page.

That was easy! But what have we actually done here?

- We have used the [Docker command line](https://docs.docker.com/engine/reference/commandline/cli/){target=_blank} to run a container:

    `docker run`

- We passed some additional parameters to the container:

  - `-i` (or `--interactive`) interactive mode, keep STDIN open even if not attached

  - `-t` (or `--tty`) allocates a pseudo-TTY (terminal) for the container

    !!! tip "`-it`"

        `-it` is a shortcut for `-i -t` as both are typically used together

  - `--rm` automatically removes the container when it exits

  - `-d` (or `--detach`) runs the container in detached mode (vs. foreground mode)

  - `-p 8080:80` (or `--publish 8080:80`) defines the port mapping from the host to the container.

      Here we are mapping port `8080` from the host to port `80` in the container.

  - `--name web` defines the name `web` for the container.

  - `nginx:alpine` defines to use the docker image `nginx` with tag `alpine` (`<name>:<tag>`)

    !!! tip "tags"

        Tags are defined versions of a docker images. The default tag is `latest`.

        So by default the latest version of a docker image will be pulled and used.

        Other tags could be specific versions, like `1.2.3`, or other variants of the image using different base images.

        Have a look at the [available tags of the nginx image](https://hub.docker.com/_/nginx?tab=tags){target=_blank}.

    !!! tip "alpine"

        [Alpine Linux](https://www.alpinelinux.org){target=_blank} is a super lightweight Linux distribution that is based on Debian.

        Because of its small size Alpine is often used as docker base image to ensure a small image size.

### 2 - Adding Custom Content

What would our web server be good for if we could not serve custom content?

So let’s add some custom HTML.

By default, Nginx looks in the `/usr/share/nginx/html` directory inside of the container for files to serve. We need to get our html files into this directory.

A fairly simple way to do this is use a _mounted volume_. With mounted volumes, we are able to link a directory on our local machine and map that directory into our running container.

1. First stop the running container with the following command:

    ```shell
    docker stop web
    ```

1. Let's start the container again, but this time provide the `-v` flag (`--volume`) to mount a directory.

    ```shell
    docker run -it --rm -d -p 8080:80 --name web -v "$(pwd)/html:/usr/share/nginx/html" nginx:alpine
    ```

    This will mount the `./html` directory from the host to the `/usr/share/nginx/html` directory inside the container.

    !!! tip "$(pwd)"

        The `$(pwd)` sub-command expands to the current working directory on Linux or macOS hosts.

        If you are using [GitBash](https://gitforwindows.org){target=_blank} on Windows you need to add an extra `/` before the `$(pwd)` command.

        ```shell
         docker run -it --rm -d -p 8080:80 --name web -v /$(pwd)/html:/usr/share/nginx/html nginx:alpine
        ```

        For details please see [Path conversions on Windows](https://docs.docker.com/desktop/windows/troubleshoot/#path-conversion-on-windows){target=_blank}.

1. Again navigate to [http://localhost:8080](http://localhost:8080){target=_blank}

    You should get a `Hello from Nginx container` message.

1. Change the message in `html/index.html` and refresh the page.

    You should see the new message.

1. Stop the container again with the following command:

    ```shell
    docker stop web
    ```

### 3 - Declarative Configuration

As of now we have used the [Docker command line](https://docs.docker.com/engine/reference/commandline/cli/){target=_blank} to run a container and passed our configuration via options.

With [Docker Compose](https://docs.docker.com/compose/){target=_blank} we can use a declarative configuration to define the container.

1. Create a new file `docker-compose.yml` with the following content

    ```yaml
    version: "3"

    services:
      web:
        image: nginx:alpine
        ports:
          - 8080:80
        volumes:
          - ./html:/usr/share/nginx/html
    ```

    The configuration should really be self-explanatory if you compare it to the previous example using the [Docker command line](https://docs.docker.com/engine/reference/commandline/cli/){target=_blank}.

    We defined a `service` which

      - is named `web`

      - uses the `nginx:alpine` image

      - maps port `8080` from the host to port `80` in the container

      - mounts the `./html` directory from the host to the `/usr/share/nginx/html` directory inside the container.

1. Use the [docker-compose](https://docs.docker.com/compose/reference/up/){target=_blank} command to start the container

    ```shell
    docker-compose up -d
    ```

    - The `up` option reads the nearest `docker-compose.yml` file and starts the `services` defined in it.

    - The `-d` (or `--detach`) option will start the container in detached mode.

1. Again navigate to [http://localhost:8080](http://localhost:8080){target=_blank}

    You should get a `Hello from Nginx container` message.

1. Stop the container again with the following command:

    ```shell
    docker-compose down
    ```

### 4 - Build a Custom Image

Bind mounts are a great option for running locally and sharing files into a running container. But what if we want to move this image around and have our html files moved with it?

There are a couple of options available but one of the most portable and simplest ways to do this is to copy our html files into the image by building a custom image.

To build a custom image, we’ll need to create a Dockerfile and add our commands to it.

1. Create a file named `Dockerfile` with the following content:

    ```dockerfile
    FROM nginx:alpine

    COPY html /usr/share/nginx/html/
    ```

    We start building our custom image by using`nginx:alpine` as our docker base image using the `FROM` command.

    Next, we `COPY` our `html` folder to the `/usr/share/nginx/html/` directory inside the container overwriting the default directory provided by `nginx:alpine` image.

1. Let's build our custom image using the [docker build](https://docs.docker.com/engine/reference/commandline/build/) command

    ```shell
    docker build -t custom-nginx .
    ```

    - We are using the `-t` (or `--tag`) flag to name our image `custom-nginx`. We could also give it an optional tag in the `name:tag` format (e.g. `custom-nginx:latest`, `custom-nginx:alpine`, `custom-nginx:1.2.3`, etc.)

    - `.` points to the current directory where our `Dockerfile` is located

    !!! warning "Mac with Apple Silicon"
        The new generation of Mac, "Mac M1", is using a different cpu architecture/different platform. If you want to build images that will run on a different platform compared to your host machine you can pass this via the `--platform` option like so

        ```shell
        docker build --platform linux/amd64 .
        ```

1. Once we have built our custom image, we can use it to run our container.

    ```shell
    docker run -it --rm -d -p 8080:80 --name web custom-nginx
    ```

    !!! tip "custom-nginx"

        - We are using the `custom-nginx` image we just built.

        - We are **not** mounting the `html` directory from the host to the `/usr/share/nginx/html` directory inside the container, because the **content has been copied into the image itself**!

1. Again navigate to [http://localhost:8080](http://localhost:8080){target=_blank}

    You should get a `Hello from Nginx container` message.

1. Stop the container again with the following command:

    ```shell
    docker stop web
    ```

1. To achieve the same, but with [Docker Compose](https://docs.docker.com/compose/){target=_blank} we can also adjust our `docker-compose.yml` file to use the `custom-nginx` image.

    ```yaml
    version: "3"

    services:
      web:
        image: custom-nginx
        ports:
          - 8080:80
    ```

    And then running `docker-compose up -d` to start the container using the `custom-nginx` image.

    We could also **omit** the previous `docker build -t custom-nginx .` command, by referencing the path to our `Dockerfile` in the `docker-compose.yml` file under `services.web.build.context`.

    ```yaml
    version: "3"

    services:
      web:
        build:
          context: .
        ports:
          - 8080:80
    ```

    And then building the image **and** starting the container by running:

    ```shell
    docker-compose up -d --build
    ```

### 🏁 Summary

Congratulations you have successfully completed the Docker Quickstart tutorial!

You should have gotten a _glimpse_ of how to use Docker and Docker Compose to build, run, and manage your Docker images and containers.

If you want to learn more you can register for the [Docker and Kubernetes Fundamentals](https://github.tools.sap/kubernetes/docker-k8s-training/blob/master/README.md){target=_blank} training.

## 📚 Recommended Readings

- [Docker - Get Started](https://docs.docker.com/get-started/){target=_blank}

- [Docker - Reference Documentation](https://docs.docker.com/reference/){target=_blank}
