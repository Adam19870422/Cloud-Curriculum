# Kubernetes Basics
<!-- TODO: remove the {{language}} since it's given by the new navigation -->

<!-- TrackingCookie-->
{% if language == "Java" %}
  {% with pagename="kubernetes-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
  {% endwith %}
{% elif language == "Node.js" %}
  {% with pagename="kubernetes-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
  {% endwith %}
{% include 'snippets/node22-disclaimer.md' %}
{% else %}
  {% with pagename="kubernetes-python" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
  {% endwith %}
{% endif %}


## 🎯 Learning Objectives

In this module you will learn

- how to create a Docker image for your application
- how to deploy an application on a Kubernetes cluster


## 🧠 Theory

>Platform as a service (PaaS) or application platform as a service (aPaaS) or platform-based service is a category of cloud computing services that provides a platform allowing customers to develop, run, and manage applications without the complexity of building and maintaining the infrastructure typically associated with developing and launching an app. (source: [Wikipedia](https://en.wikipedia.org/wiki/Platform_as_a_service){target=_blank})

In this module, you will learn about the basics of cloud platforms:

  - General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or  [recording](https://video.sap.com/media/t/1_rfjpzboo){target=_blank}
  - Kubernetes: [slides](../slides/kubernetes){target=_blank} ([with speaker notes](../slides/kubernetes/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_3y8r6uqt){target=_blank}



## 💻 Exercise
In this exercise you will create a docker image of an existing application and deploy it to Kubernetes. This is how the final infrastructure will look like:

![image info](cluster_overview.svg)

{% if language == "Java" %}
<!-- Prerequisites-->
{% with
  tools=[
    ('**A Terminal**'),
    ('[**Docker**](../../prerequisites/java/#docker){target=_blank}'),
    ('**Kubectl** (comes bundled with Docker for Desktop, or install following [these instructions](https://kubernetes.io/docs/tasks/tools/install-kubectl/){target=_blank})')
  ],
  required=[
    ('[Basic Docker knowledge](https://app.pluralsight.com/sso/sap?returnUrl=library/courses/docker-building-running-first-app/table-of-contents){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}
{% elif language == "Node.js" %}
{% with
  tools=[
    ('[**Docker**](../../prerequisites/nodejs/#docker){target=_blank}'),
    ('[**Kubectl**](https://kubernetes.io/docs/tasks/tools/install-kubectl/){target=_blank} (comes bundled with Docker for Desktop, or install following [these instructions](https://kubernetes.io/docs/tasks/tools/install-kubectl/){target=_blank})')
  ],
  beneficial=[
    ('[Basic Docker knowledge](https://app.pluralsight.com/sso/sap?returnUrl=library/courses/docker-building-running-first-app/table-of-contents){target=_blank}'),
    ('[Mocha](https://mochajs.org){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

{% elif language == "Python" %}
{% with
  tools=[
    ('[**Docker**](../../prerequisites/python/#docker){target=_blank}'),
    ('[**Kubectl**](https://kubernetes.io/docs/tasks/tools/install-kubectl/){target=_blank} (comes bundled with Docker for Desktop, or install following [these instructions](https://kubernetes.io/docs/tasks/tools/install-kubectl/){target=_blank})')
  ],
  beneficial=[
    ('[Basic Docker knowledge](https://app.pluralsight.com/sso/sap?returnUrl=library/courses/docker-building-running-first-app/table-of-contents){target=_blank}'),
    ('[Pytest](https://docs.pytest.org/en/7.1.x/contents.html){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}


{% endif %}

### 1 - Kubernetes Cluster Access

Before we can deploy our application, we need to get access to a Kubernetes cluster.

{% include 'snippets/k8s-cluster-access.md' %}


### 2 - The Application

The application that is going to be deployed, is a simple web app that is provided in a git repository.
It retrieves a random quote from a database and displays it on the browser.

#### 2.1 Clone the Repository

{% if language == "Java" %}

{% with branch_name="cloud-platforms", folder_name="cloud-platforms-java-k8s" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

{% elif language == "Node.js" %}

{% with branch_name="cloud-platforms-ts", folder_name="cloud-platforms-nodejs-k8s" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/nodejs.md' %}

{% elif language == "Python" %}

{% with branch_name="cloud-platforms", folder_name="cloud-platforms-python-k8s" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}

{% with folder_name="cloud-platforms-python-k8s" %}
{% include 'snippets/python-create-use-virtual-env.md' %}
{% endwith %}

{% include 'snippets/install-dependencies/python.md' %}

{% endif %}

### 3 - Dockerize Your Application

Docker images are a common way to package applications for deployment in the cloud. Kubernetes requires a docker image to run your application.
Let's learn how to turn the provided application into a docker image and push it to the registry.

#### 3.1 Create a Dockerfile

Create a file named `Dockerfile`, in the root directory of the project, with the following content:
{% if language == "Java" %}

```Dockerfile
FROM sapmachine:jdk-ubuntu-17.0.8
COPY target/fortune-cookies.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

??? info "Dockerfile walkthrough"
    - `FROM sapmachine:jdk-ubuntu-17.0.8`: Base image to use for subsequent instructions
    - `COPY target/fortune-cookies.jar app.jar`: copy the `jar` file into the container
    - `ENTRYPOINT ["java","-jar","/app.jar"]`: start the application

{% elif language == "Node.js" %}

```Dockerfile
# --- First part
FROM node:22-alpine AS builder

COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./tsconfig.json
COPY src ./src/

RUN npm run build

# --- Second part
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder dist/ dist/
COPY migrations ./migrations/

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]
```

??? info "Dockerfile walkthrough"
    For Typescript it is recommended to use a [Multistage docker image](https://docs.docker.com/build/building/multi-stage/){target=_blank}. Using this approach allows us to transpile the Typescript code first and use the generated `dist` output in a new image. This results in a smaller Docker image.

    - `FROM node:22-alpine as builder`: Base image to use for subsequent instructions (we name it builder to be able to refer to it later)
    - `COPY package*.json ./`: copy both `package.json` and `package-lock.json` into the container at the path `./`
    - `RUN npm ci`: install dependencies using [npm-ci](https://docs.npmjs.com/cli/v7/commands/npm-ci){target=_blank}
    - `COPY tsconfig.json ./tsconfig.json`, `COPY src ./src/`: copy the necessary build files and folders `tsconfig.json and `src` into the container
    - `npm run build`: Build the `.js` resources
    - `FROM node:22-alpine`: We start a new docker image with the same base image as before. This will be the production image
    - `WORKDIR /app`: Set the working directory to `/app` for all following instructions
    - `ENV NODE_ENV=production`: Set the environment variable `NODE_ENV` to `production` (many modules such as [express](http://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production){target=_blank} handle this variable automatically, e.g. by reducing debug output)
    - `COPY package*.json ./`: copy both `package.json` and `package-lock.json` into the container at the path `./`
    - `RUN npm ci --omit=dev`: install dependencies using [npm-ci](https://docs.npmjs.com/cli/v7/commands/npm-ci){target=_blank}. This time we omit dev dependencies from the install (via `--omit=dev`). Note: `--only=production` is deprecated, use `--omit=dev` insted. For more information refer [npm docs](https://docs.npmjs.com/cli/v7/using-npm/config#only){target=_blank}.
    - `COPY --from=builder dist/ dist/`: copy the `dist` folder of the previous docker part directory into the container at path `./dist`
    - `COPY migrations ./migrations/`: copy the `migrations` directory into the container at path `./migrations/`
    - `EXPOSE 3000`: expose the application on port 3000
    - `CMD [ "npm", "start" ]`: start the application

{% elif language == "Python" %}

```Dockerfile
FROM python:3.12-slim-bullseye
WORKDIR /app

COPY requirements.txt ./
RUN pip3 install -r requirements.txt

COPY app ./app
COPY migrations ./migrations
COPY server.py ./server.py

EXPOSE 8080
CMD ["python3", "server.py"]
```

??? info "Dockerfile walkthrough"
    We will use a simple Dockerfile to package our Python application. In a production environment you would separate the dependencies and the dev-dependencies and use a [Multistage docker image](https://docs.docker.com/build/building/multi-stage/){target=_blank} which generally results in a smaller Docker image.

    - `FROM python:3.12-slim-bullseye`: Base image to use for subsequent instructions.
    - `WORKDIR /app`: Set the working directory to `/app` for all following instructions.
    - `COPY requirements.txt ./`: Copy `requirements.txt` into the container.
    - `RUN pip3 install -r requirements.txt`: Install dependencies based on `requirements.txt`.
    - `COPY app ./app`: Copy the application code into the container
    - `COPY migrations ./migrations`: Copy the migrations folder into the container
    - `COPY server.py ./server.py`: Copy the app starting point
    - `EXPOSE 8080`: expose the application on port 8080
    - `CMD ["python3", "server.py"]`: start the application

??? warning "WSGI Servers"
    In a production environment you would avoid invoking the `server.py` directly. Instead, you would use [WSGI Server](https://www.fullstackpython.com/wsgi-servers.html) to e.g. get a common server interface for different Python web frameworks, and thus achieve better portability. We will omit the usage of WSGI servers for the sake of simplicity.

{% endif %}

#### 3.2 Build and Push to the Registry

We provide a docker image registry at `cc-ms-k8s-training.common.repositories.cloud.sap`, which you can use to store your docker images for this exercise.
A registry is needed, because the Kubernetes cluster cannot (and should not) pull images from your machine.
To prevent overriding images pushed by other participants, we ask you to put your D/C/I number into the image name in the following instructions.

{% if language == "Java" %}

1. Build a `jar` file with the following command:

    ```shell
    mvn package
    ```

{% endif %}

1. Build the docker image with the following command:

    ```shell
    docker build --platform linux/amd64 -t cc-ms-k8s-training.common.repositories.cloud.sap/fortune-cookies-<your D/C/I number>:v1 .
    ```

    !!! warning "Insert your D/C/I number, Apple Silicon, and the build path"
        1. Replace `<your D/C/I number>` with your real D/C/I number in the above command.
        All letters in a tag must be lowercase!
        1. Don't forget the `.` at the end of the command - this tells docker to build the image based on the `Dockerfile` in the current folder. You can also specify a `Dockerfile` with a different name or in other directories [using the `-f` option](https://docs.docker.com/engine/reference/commandline/build/#file){target=_blank}
        1. The option `--platform linux/amd64` is required on Macs with Apple Silicon to make sure the image works on the remote `linux/amd64`-based Kubernetes nodes. The option is redundant for regular, `amd64` based architectures.
    
    ??? info "Command explanation"
        The dot at the end signifies that the current directory should be sent to the docker daemon as build context.
        The `-t` option specifies that the image should be tagged.
        A tag consists of an optional registry hostname (the default is docker's public registry), a name and an optional tag (`v1` in the above command, the default is `latest`).
        Images can be referenced by tag, so in order to push you only have to supply an image tag.

1. Log in to the Docker repository with following command:

    ```shell
    docker login -u "claude" -p "cmVmdGtuOjAxOjE3NzgyMjI4ODU6c2d5bGhzak9oNGRZQzRyN1JZVUx0UExwVTBO" cc-ms-k8s-training.common.repositories.cloud.sap
    ```

1. Push the built image to the registry with the following command (with your D/C/I number inserted):

    ```shell
    docker push cc-ms-k8s-training.common.repositories.cloud.sap/fortune-cookies-<your D/C/I number>:v1
    ```

### 4 - Create a Deployment for Application

Let's start with the deployment of our application.

??? info "We are here"
    We will start the pods that run our application. The pods will be created by a deployment object.
    ![image info](cluster_overview_app_deployment_only.svg)

#### 4.1 Create a YAML File

1. Create a file named `app.yaml` at the root of the project with the following content:

    ```YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: fortune-cookies
    spec:
      selector:
        matchLabels:
          app: fortune-cookies
      replicas: 1
      template:
        metadata:
          labels:
            app: fortune-cookies
        spec:
          containers:
            - name: app
              image: cc-ms-k8s-training.common.repositories.cloud.sap/fortune-cookies-<your D/C/I number>:v1
              imagePullPolicy: Always
              ports:
                - containerPort: {{ application_port }}
    ```

    ??? info "Fields walkthrough"
        - `apiVersion`: Which version of the Kubernetes API we are using to create this object
        - `kind`: What kind of object we are creating
        - `metadata.name`: Name that uniquely identifies the object
        - `spec`: The desired state of the object
            - `selector`: A label selector is a query over a set of resources. It must match the pod template's label.
            - `replicas`: Number of desired pods
            - `template`: Describes the pods that will be created
                - `metadata.labels`: Map of string keys and values that can be used to organize and categorize objects.
                - `spec`: Specification of the desired behavior of the pod
                    - `containers`: List of containers belonging to the pod
                        - `name`: Name of the container specified as a DNS_LABEL
                        - `image`: Docker image name
                        - `ports.containerPort`:  [Optional](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#ports){target=_blank}. Additional information about the network connections a  container uses.

1. Replace the placeholder: `<your D/C/I number>`

#### 4.2 Apply the File

1. Apply the file to the cluster with the following command:

  ```shell
  kubectl apply -f app.yaml
  ```

1. Run `kubectl get deployments` to see the newly created deployment.
1. Run `kubectl get pods` to list the pod(s) K8s tries to create via the deployment.

!!! warning "Expected failure"

    The pod failed to start. This is expected!

    **The pod failed to start because kubernetes is unable to pull the image.**

    We will fix this in the [next step](#4.3-configure-registry-access).

#### 4.3 Configure Registry Access

The pods are listed, but no pods are created, because Kubernetes is unable to pull the images from the registry.
Can you figure out why?

1. Use `kubectl describe pod <pod-name>` to see what causes the failure of the pull.

1. Looks like Kubernetes does not have the credentials to perform the pull from the registry.
  Run the following command to let the Kubernetes cluster authenticate to the registry:

    ```
    kubectl create secret docker-registry regcred --docker-server=cc-ms-k8s-training.common.repositories.cloud.sap --docker-username=claude --docker-password=cmVmdGtuOjAxOjE3NzgyMjI4ODU6c2d5bGhzak9oNGRZQzRyN1JZVUx0UExwVTBO
    ```

1. Add the following to the Deployment in the `app.yaml` on the same indentation level as `containers`:

    ```YAML
    imagePullSecrets:
      - name: regcred
    ```

1. Apply your changes with `kubectl apply -f app.yaml`.

1. Check the status of the pod that got created by your Deployment object with `kubectl get pods`. It should be failing to start.

1. Check the logs of the failing pod with `kubectl logs <pod name>`.

!!! warning "Expected failure"

    The app failed to start. This is expected!

    **The app failed to start because the database service is not yet available.**

    We will fix this in the [next exercise](#5-deploy-a-database).

### 5 - Deploy a Database

If you look into the source code of the application, you will see that it needs to have a database connected where it stores the quotes.
In this exercise you are going to deploy a database on your Kubernetes cluster.

??? info "We are here"
    We will deploy a database pod together with a service that makes the database accessible for other pods. Additionally, we connect our already deployed application to the database.
    ![image info](cluster_overview_with_database.svg)

#### 5.1 Create a Deployment

1. Create a file named `db.yaml`.
1. In it specify a `Deployment` to fulfill following requirements (see the yaml structure example above in the `app.yaml`):
    - It should bear the name `fortune-cookies-db`.
    - It should have one replica.
    - It should select pods, which match the label `app: fortune-cookies-db`
    - It's pods should...
        - have the label `app: fortune-cookies-db`.
        - run a container with...
            - the name `app`.
            - the image `postgres:16-alpine`.
            - (optional) `containerPort` `5432`.
    - For the sake of simplicity, let's allow connections without a password.
      Therefore add the following environment variable to your database at `deployment.spec.template.spec.containers[0].env`:

      ```YAML
      - name: POSTGRES_HOST_AUTH_METHOD
        value: trust
      ```

1. Create the deployment object with `kubectl apply -f db.yaml`.
1. Check if your database has started by using `kubectl get pods`.

#### 5.2 Make the Database Accessible

In the previous exercise you saw that there is a pod running the database image, but by default there is no way to access a pod.

You could create a new file for the service you are about to declare, but Kubernetes also supports chaining YAML-files, by using `---` as a separator.
Thereby you can keep all related objects in the same file.

1. Append a line consisting only of `---` to the file `db.yaml` and insert the following content after it:

    ```YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: fortune-cookies-db
    spec:
      selector:
        app: fortune-cookies-db
      ports:
        - name: db
          port: 5432
          targetPort: 5432
      type: ClusterIP
    ```

    ??? info "Fields walkthrough"
        - `spec.selector`: Route service traffic to pods with label keys and values matching this selector.
        - `spec.ports`: Name of the port. Must be unique within the service
            - `name`: Name of the port. Must be unique within the service
            - `port`: Port to be exposed by this service
            - `targetPort`: Port to access the pods targeted by this service

1. Create the service object with `kubectl apply -f db.yaml`

??? info "Why is a service needed?"

    A service is required to make the database accessible to the application:
    <object data="../../cloud-platforms/slides/kubernetes/images/service.svg" type="image/svg+xml" width="80%" style="padding: 1rem">
    </object>

#### 5.3 Configure the Database Connection

You will notice that the application still does not start, despite having a database running and exposed via a service.
{% if language == "Java" %}
If you look into the application code you will find out why: no database connection is specified.

1. Go to your `app.yaml` and specify three environment variables for the app container using `Deployment.spec.template.spec.containers[0].env`:
    - `SPRING_DATASOURCE_URL` should have the value `jdbc:postgresql://fortune-cookies-db/postgres`.
    - `SPRING_DATASOURCE_USERNAME` should have the value `postgres`.
    - `SPRING_JPA_DATABASE-PLATFORM_HIBERNATE_DIALECT` should have the value `PostgreSQLDialect`.
    !!! tip "Use `kubectl explain` for information on specific fields"

{% elif language == "Node.js" %}

1. In file `src/lib/config.ts` we need to read an environment variable e.g. `PG_CONNECTION_STRING` to get the `connectionString` for the database when running in a container. (You can choose any other name, but please make sure to be consistent.)

    !!! tip "Access environment variables through `process.env`"

        ```typescript
          const { PG_CONNECTION_STRING } = process.env;
        ```

    Make sure to also use a default value for the `connectionString` in case `PG_CONNECTION_STRING` is not set, e.g. when running **locally**.

    ```typescript
      const {
        PORT: port = 3000,
        PG_CONNECTION_STRING: connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres'
      } = process.env

      export default {
        app: {
          port
        },
        postgres: {
          connectionString
        }
      }
    ```

1. Go to your `app.yaml` and specify that the container should have an environment variable using `Deployment.spec.template.spec.containers[0].env`.
    - It should have the same name, e.g. `PG_CONNECTION_STRING`
    - It should have the cluster-specific value `postgres://postgres@fortune-cookies-db/postgres` (~ as defined in [Create a Deployment](#51-create-a-deployment))
    !!! tip "Use `kubectl explain` for information on specific fields"

    !!! warning "Build and push again"

        In order to make the new image accessible to the cluster don't forget to build and push it again. Using the `imagePullPolicy: Always` in `app.yaml` ensures the new image is pulled, even though the image has the same name/tag. You might need to delete the current running app pod for the image to be pulled again.
        
{% elif language == "Python" %}

1. In file `app/config.py` we read the environment variable `PG_CONNECTION_STRING` for the database connection when running in a container.

1. Go to your `app.yaml` and specify that the container should have an environment variable using `Deployment.spec.template.spec.containers[0].env`.
    - It should have the same name, e.g. `PG_CONNECTION_STRING`
    - It should have the cluster-specific value `postgresql://postgres@fortune-cookies-db/postgres` (~ as defined in [Create a Deployment](#51-create-a-deployment)) (**Hint: Make sure to use the protocol `postgresql`, the Python library `SQLAlchemy` does not work when using `postgres`**)
    !!! tip "Use `kubectl explain` for information on specific fields"

    !!! warning "Build and push again"

        In order to make the new image accessible to the cluster don't forget to build and push it again. Using the `imagePullPolicy: Always` in `app.yaml` ensures the new image is pulled, even though the image has the same name/tag. You might need to delete the current running app pod for the image to be pulled again.

{% endif %}

1. Apply the `app.yaml` with `kubectl apply -f app.yaml` to update your Deployment with the recent changes.

### 6 - Make the Controller Do Some Work

In the YAML file you described your _desired state_ in the form of a _Deployment_.
The Deployment Controller changes the actual state towards the desired state.
For example it creates a pod running the specified image, if there is none.

1. Delete a pod using the `kubectl delete pod` command.
    Use the `--help` option for usage information.
2. Run `kubectl get pods` to see how the deployment controller created a new pod in order to adhere to the desired state.

### 7 - Make the Application Accessible

In the previous exercise you saw that there is a pod running the application image, but by default there is no way to access a pod.

??? info "We are here"
    Now we will make our application accessible for other pods and services in our cluster. Therefore we will create a service for our application that handles all incoming traffic.
    ![image info](cluster_overview_app_with_service.svg)

#### 7.1 Declare a Service

1. Append `---` to `app.yaml` and specify a `Service` like you did for the database already in exercise 5.2 but with the following properties:
    - It should be of the type `ClusterIP`.
    - It should bear the name `fortune-cookies`.
    - It should expose port `{{ application_port }}` and target port `{{ application_port }}` of pods which match to the selector: `app: fortune-cookies`.

#### 7.2 Apply the File

Run the following command:

```shell
kubectl apply -f app.yaml
```

It should print, that a service has been created.
Run `kubectl get services` to see the newly created service.

### 8 - Make it Accessible From the Web

Even though we created a service for the deployment, there is still no external IP to address the pod.
The service was needed to make the application accessible from within the cluster.
By declaring an _Ingress_ you can expose applications to the web.

??? info "We are here"
    ![image info](cluster_overview_with_ingress.svg)

<!-- What is Ingress: https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress -->

#### 8.1 Create an Ingress Class

1. Create a file named `admin.yaml` at the root of the project with the following content:

    ```YAML
    apiVersion: networking.k8s.io/v1
    kind: IngressClass
    metadata:
      name: istio
    spec:
      controller: istio.io/ingress-controller
    ```
    ??? info "Fields walkthrough"
        In Kubernetes 1.18, a new resource `IngressClass` was added, replacing the `kubernetes.io/ingress.class` annotation on the `Ingress` resource.

        - `metadata.name`: The name of the IngressClass.
        - `spec.controller`: In order for the Ingress resource to work, the cluster must have an ingress controller running. In this case, we use [Istio Ingress](https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/){target=_blank}, which is an Istio based ingress controller.

1. Apply the file to the cluster with the following command:

    ```shell
    kubectl apply -f admin.yaml
    ```

    ??? info "Who maintains the 'IngressClass'?"
        The `IngressClass` is a cluster-wide resource which may apply to all namespaces, thus creating it requires cluster admin privileges. This kind of resource needs to be maintained by someone who has permissions to administer the cluster. This person or group may or may not be part of your team. It might be a different team or org, or someone in your team with a specific role. From a development perspective, you only need to consider the [namespaced resources](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/#not-all-objects-are-in-a-namespace){target=_blank} related to their applications, such as those defined in the files `app.yaml` and `db.yaml`.

        Since you own the BTP Kyma trial cluster in our exercise, you have the privilege to create the `IngressClass`. As mentioned above, this will likely not be the case in your own application.

#### 8.2 Create an Ingress

1. Create an `Ingress` with the `ingressClassName` we just defined, append `---` separator to the `app.yaml` file and insert the following content after it:
    ```YAML
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: fortune-cookies
    spec:
      ingressClassName: istio
      rules:
        - host: fortune-cookies.<SUBDOMAIN>.kyma.ondemand.com
          http:
            paths:
            - backend:
                service:
                  name: fortune-cookies
                  port:
                    number: {{ application_port }}
              path: /
              pathType: Prefix
      tls:
        - hosts:
          - fortune-cookies.<SUBDOMAIN>.kyma.ondemand.com
          secretName: kyma-gateway-certs
    ```

    ??? info "Fields walkthrough"
        - `spec.rules`: List of rules used to configure the Ingress
            - `ingressClassName: istio`: Using `istio` as the IngressClass
            - `host`: Fully qualified domain name of a network host
            - `http.paths`: A collection of paths that map requests to backends
                - `backend`: Definition of the referenced service endpoint to which the traffic will be forwarded to
                    - `service`:  References a Service as a backend
                      - `name`:  Name of the referenced service
                      - `port`:  Port of the referenced service
                        - `number`: The numerical port number on the service
                - `path`: Path to match against the path of an incoming request
                - `pathType`: Determines how the path should be matched.
                    One of: `Exact`, `Prefix`, `ImplementationSpecific`.
                    `Exact` would be sufficient for this exercise, since there is only one endpoint in the `fortune-cookies` app. However, to forward any request to an arbitrary path to the application we will use `Prefix`. [See official documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types){target=_blank}.
        - `spec.tls`: TLS configuration
            - `hosts`: List of hosts included in the TLS certificate. Values must match the names used in the tlsSecret
            - `secretName`: Name of the secret used to terminate SSL traffic on 443

1. Replace all occurrences of `<SUBDOMAIN>` with the subdomain of your cluster.

??? info "Why is an ingress needed?"

    An ingress lets us manage external access to the services in a cluster:
    <object data="../../cloud-platforms/slides/kubernetes/images/ingress.svg" type="image/svg+xml" width="80%" style="padding: 1rem">
    </object>

#### 8.3 Apply the File

1. Run the following command:

    ```shell
    kubectl apply -f app.yaml
    ```

    It should print, that an ingress has been created.

1. Run `kubectl get ingresses` to see the newly created ingress.

The application is now available at the URLs shown inside the `HOSTS` column.

#### 8.4 Access the Application

1. Access the deployed application on your web browser and find your fortune. 🥠

### 9 - Persistent Volumes

Kubernetes usually assumes applications to be stateless.
If a pod needs to be recreated, no effort is made to conserve any of its internal state.

??? info "We are here"
    ![image info](cluster_overview_with_pvc.svg)

#### 9.1 Why care?

1. Run `kubectl get pods` and find the name of the pod currently running the database.
1. To simulate a pod crashing, delete the pod using `kubectl delete pod`.
1. Navigate to `fortune-cookies.<SUBDOMAIN>.kyma.ondemand.com` (replace `<SUBDOMAIN>`) or refresh the page to see that the application is unable to serve quotes.

<!-- TODO: instruct to just refresh the page, as the participants probably won't close the page immediately -->

The container's filesystem was deleted along with the container itself.
If you want your data to survive, you need to configure accordingly.

#### 9.2 Specify a Volume

To have your data outlive any pod you can use persistent volumes.

1. Claim a persistent volume by appending the following to the `db.yaml`.
    Make sure that is separated by `---` from any preceding or following content:

    ```YAML
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: database
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 2Gi
    ```

    ??? info "Field walkthrough"
        - `spec`: Spec defines the desired characteristics of a volume requested by a pod author.
            - `accessModes`: AccessModes contains the desired access modes the volume should have.
              See [here](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes){target=blank} for possible values.
            - `resources.requests.storage`: Request a certain amount of storage for the volume.

2. Use the claimed volume on the database container.
    Add the following to the deployment at the same indentation level as `containers`:

    ```YAML
    volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: database
    ```

    ??? info "Field walkthrough"
        - `volumes`: List of volumes that can be mounted by containers belonging to the pod.
            - `name`: Volume's name. Must be unique within the pod.
            - `persistenceVolumeClaim.claimName`: A reference to a PersistentVolumeClaim in the same namespace.

1. Add the following to the `containers` block at the same indentation level as `name`, `image` and `ports`:

    ```YAML
    volumeMounts:
      - name: storage
        mountPath: /var/lib/postgresql/data
    ```

    ??? info "Field walkthrough"
        - `volumeMounts`: Pod volumes to mount into the container's filesystem.
            - `mountPath`: Path within the container at which the volume should be mounted.
            - `name`: Must match the name of a volume

1. We need to tell our PostgreSQL-DB where we want our data to be stored.
In PostgreSQL, this place/directory is referred as `PGDATA`.
Add the following environment variable:

    ```YAML
    - name: PGDATA
      value: /var/lib/postgresql/data/pgdata
    ```

1. Run `kubectl apply -f db.yaml` to apply the changes.

#### 9.3 Observe the Persistence

The database migrations are only executed at application start.

<!-- TODO: instruct to just refresh the page, as the participants probably won't close the page immediately -->
1. Delete the pod running the application to trigger the creation of a new pod.
1. Navigate to `fortune-cookies.<SUBDOMAIN>.kyma.ondemand.com` (replace `<SUBDOMAIN>`) or refresh the page to see that the quotes are back in the database.
1. Delete the pod currently running the database using `kubectl delete pod`.
1. Refresh the page to see that the application can still serve quotes from a database, despite the deletion.

{% if language == "Python" %}
!!! warn "Several refreshes"
    Python seems to reuse the old database connection to a non-existing pod, which is why there might be an error on the initial refresh. Refresh once more and you should see the quotes being served again.
{% endif %}

{% include 'snippets/k8s-cleanup.md' %}

## 🙌 Congratulations! Submit your solution.

{% if language == "Node.js" %}
{% with path_name="node/k8s/cloud-platforms", language="Node.js", branch_name="cloud-platforms-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}

{% if language == "Java" %}
{% with path_name="java/k8s/cloud-platforms", language="Java", branch_name="cloud-platforms" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}

{% if language == "Python" %}
{% with path_name="python/k8s/cloud-platforms", language="Python", branch_name="cloud-platforms" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}


## 🏁 Summary

Good job!
In the prior exercises you pushed your application as a docker container to a registry, deployed it on a Kubernetes cluster along with a database, which you made resilient by using a persistent volume.

## 🦄 Stretch Goals

{% include 'snippets/stretch-goal-disclaimer.md' %}

You should already have a good idea of all common parts by now, you could stop here... oooor you can finish what you started:

- Commands like `kubectl get pods` give us information about all the pods in the cluster, even when we likely only care about a specific subset.
  Use a [namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/){target=_blank} to separate all registry-related objects from the default namespace.
{% if language == "Java" %}
- Use a secret to protect the database with a password.
  Use the environment variable `POSTGRES_PASSWORD` on the [postgres container](https://hub.docker.com/_/postgres){target=_blank} and `SPRING_DATASOURCE_PASSWORD` on the application container.
  Remove the `POSTGRES_HOST_AUTH_METHOD` variable on the database container.
{% else %}
- Use a secret to protect the database with a password.
  Use the environment variables `POSTGRES_PASSWORD` and `POSTGRES_USER` on the [postgres container](https://hub.docker.com/_/postgres){target=_blank} and adjust the `PG_CONNECTION_STRING`.
  Remove the `POSTGRES_HOST_AUTH_METHOD` variable on the database container.
{% endif %}
-  Replace the Ingress in `app.yaml` with a Kyma-specific [`APIRule`](https://kyma-project.io/#/api-gateway/user/custom-resources/apirule/v2alpha1/04-10-apirule-custom-resource){target=_blank}. Configure the `APIRule` to only allow for `GET`-requests.

??? example "Need help?"
    ```YAML
    apiVersion: gateway.kyma-project.io/v1beta1
    kind: APIRule
    metadata:
      name: <APIRULE-NAME>
      namespace: default
    spec:
      gateway: kyma-system/kyma-gateway
      host: ads.<SUBDOMAIN>.kyma.ondemand.com
      rules:
        - path: /.*
          methods:
            - <ALLOWED-METHOD>
            - <ALLOWED-METHOD>
            - ...
          service:
            name: <APP-SERVICE-NAME>
            port: <SERVICE-PORT>
          accessStrategies:
            - handler: allow
      service:
        name: <APP-SERVICE-NAME>
        port: 80
    ```

## 📚 Recommended Reading

- [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/){target=_blank}
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/){target=_blank}
- Kubernetes Volumes & Volume Types:
    - [Official Guide](https://kubernetes.io/docs/concepts/storage/volumes/){target=_blank}
    - [K8s Volumes explained (YT)](https://www.youtube.com/watch?v=0swOh5C3OVM){target=_blank}
- [kubectl CLI Usage examples](https://github.tools.sap/cloud-curriculum/materials/blob/main/cloud-platforms/kubernetes/k8s-help.md){target=_blank}

## 🔗 Related Topics

- SAP's ["North Star Architecture"](https://jam4.sapjam.com/groups/mYaTDaPrTFfwSbtvLnKjox/documents/DSANxIsFKFCBsZUQeXwJdR/slide_viewer){target=_blank} provides guidance on when to choose which platform or setup.
- [North Star Architecture Amendment/Update](https://sap.sharepoint.com/teams/NorthStarArchitectureIntegrationKernelServices/Shared%20Documents/General/North%20Star%20Architecture%20Strategy%20Papers/2022/North_Star_Architecture_2022.pdf?cid=476bf941-53b3-4bfc-a6d0-e3455d12e0d3){target=_blank}
- SAP's [Cross Product Architecture's paper](https://jam4.sapjam.com/blogs/show/ox5i7h49WDfMZ2oMtxBiFG){target=_blank} on our go-to runtimes in [SAP BTP](https://account.int.sap.eu2.hana.ondemand.com/#/home/welcome){target=_blank}
- [Docker & K8s Training](https://github.tools.sap/kubernetes/docker-k8s-training/blob/master/README.md){target=_blank}
- [Docker - Getting Started Walk-through for Developers](https://training.play-with-docker.com/#dev){target=_blank}
- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/){target=_blank}
{% if language == "Java" %}
- [Spring Boot with Docker](https://spring.io/guides/topicals/spring-boot-docker/){target=_blank}
{% else %}
- [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/){target=_blank}
{% endif %}
- [SAP Business Technology Platform](https://help.sap.com/docs/btp/sap-business-technology-platform/sap-business-technology-platform){target=_blank}
