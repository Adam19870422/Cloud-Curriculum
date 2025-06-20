# Zero Downtime Deployment (Kubernetes + Java)

<!-- TrackingCookie-->
{% with pagename="zero-downtime-deployment-k8s-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this learning module, you will learn

- about the problem that _zero downtime deployment_ helps you to address.
- the logic behind _zero downtime deployment_ and its implementation at cloud platforms.
- which impacts you should consider when you _really_ need do it.
- how to handle _open_ connections during zero downtime deployment.

## 🤔 Wait, but why?

Imagine you deploy a new version of your application to cloud platform, how can you switch the old version to the new one?

- We have to assume "somebody is always awake in the internet" and service interruption is generally unacceptable.
- Additionally, the request to the old version of the application should be processed properly before the old version shuts down.

## 🧠 Theory

To learn about the theory, view the <a href="https://pages.github.tools.sap/cloud-curriculum/boot-restart/slides/zero-downtime-deployment.html?showNotes=true" target="_blank">Slides</a> with notes/annotations.

## 💻 Exercise

In the following exercises you are going to deploy a new version of an existing `bulletinboard-ads` application, and replace the old version without any outage. You also have to consider how to handle open connections when the old version is terminated. You will run the exercise both locally and on Cloud Platforms like SAP BTP or Kubernetes.

<!-- Prerequisites-->
{% with
  tools=[
      ('[**Docker**](../../prerequisites/java/#docker){target=_blank}'),
  ],
  beneficial=[
    ('[Persistence](../../persistence/java/){target=blank}')
  ],
  required=[
    ('[HTTP REST](../../http-rest/java/){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

#### 🚇 Infrastructure

- Access to a Kubernetes Cluster

    If you don't have a cluster already, see the first step of the [Kubernetes topic](../../cloud-platforms/kubernetes-java/#1-kubernetes-cluster-access){target=_blank} to find out how to get a cluster and configure `kubectl`.

### 🚀 Getting Started

{% with branch_name="zero-downtime-deployment", folder_name="zero-downtime-deployment-cf-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

### 🔍 Code Introduction

The domain is a simple bulletinboard application. You can post something there that you want to advertise, such as a used laptop, and others can look at all the offerings and contact you if they are interested.

- `com.sap.bulletinboard.ads.models.Advertisement` holds all information related to an entity.
- `com.sap.bulletinboard.ads.models.AdvertisementRepository` is the persistence of the advertisements.
- `com.sap.bulletinboard.ads.controllers.AdvertisementController` is the HTTP API endpoint.

### 1 - Try it locally

To understand how Zero Downtime Deployment works, you will create a new version of the application and deploy it locally without breaking down the service. In order to do that, you can add Nginx as the load balancer before your application.

#### 1.1 - Start the application

1. Start database locally: `./start-db.sh`
1. Build the artifact: `mvn package`
1. Rename the artifact as `v1`: 

    `mv target/bulletinboard-ads.jar target/bulletinboard-ads-v1.jar`

1. Start the `v1` version on port 8080:

    `java -jar target/bulletinboard-ads-v1.jar --server.port=8080`

#### 1.2 - Add Nginx as Load Balancer

1. Go to `nginx` directory of your cloned repository: `cd <your_repo>/nginx`
1. Build the docker image: `docker build -t mynginx .`
1. Run the Nginx container: 

    `docker run -it --rm -d -p 80:80 --name web mynginx`

Navigate to [http://localhost](http://localhost){target=_blank} in your web browser. You will see the user interface of Bulletin Board. Create some advertisements and see how it works.

??? info "How to setup Nginx load balancer?"
    In the file `<your_repo>/nginx/nginx.conf`, we implemented a simple load balancer. Nginx will listen on port `80` and route the traffic to two local servers - `8080` and `8090`. You can find more examples on [Nginx Docs](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/){target=_blank}.
    ```conf
    upstream bulletinboard {
        server host.docker.internal:8080;
        server host.docker.internal:8090;
    }
    location / {
        proxy_pass http://bulletinboard;
    }
    ```

#### 1.3 - Deploy the new version without downtime

1. Navigate to the file `src/main/resources/static/index.html`, and append `V2` to the title.

    ```html
      <title>Bulletin Board v2</title>
    ```

1. Build the new version with `mvn package`
1. Rename the artifact as `v2`: 

    `mv target/bulletinboard-ads.jar target/bulletinboard-ads-v2.jar`

1. Start the `v2` version on port 8090: 

    `java -jar target/bulletinboard-ads-v1.jar --server.port=8090`

You will notice there are two applications up and running. One serves as the old version, and another as the new version. When you access the application by [http://localhost](http://localhost){target=_blank}, your request will hit one of them based on how Nginx routes the request.

At the same time, you can test the new version by [http://localhost:8090](http://localhost:8090){target=_blank}, and check if it works as expected.

#### 1.4 - Shut down the old version

1. Go to the terminal in which you run the old version (on port 8080)
1. Press `Ctrl + C`

The old version will be stopped. Nginx routes all traffic to the new version. Verify it by accessing [http://localhost](http://localhost){target=_blank}.

#### 1.5 - Clean up

Do some clean-ups before the next exercise.

1. Go to the terminal in which you run the new version (on port 8090)
1. Press `Ctrl + C`
1. Stop the Nginx load balancer: `docker stop web`

### 2 - Graceful shutdown

Now you should get some experiences on zero downtime deployment. The idea is to start up two versions of the application and switch route between them.

But when you update the application and shut down the old version, the old version may be in the process of performing some unfinished tasks like making database connections, consuming resources, etc. You have to avoid any unwanted consequences caused by a simple **hard stop**.

Spring Boot supports [graceful shutdown](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes#graceful-shutdown){target=blank} by the property `server.shutdown=graceful`.

If the application does not depend on Spring Boot, you can consider [JVM shutdown hooks](https://docs.oracle.com/javase/8/docs/api/java/lang/Runtime.html#addShutdownHook-java.lang.Thread-){target=blank} and implement your own code to handle open connections.

You can verify the behavior on your local machine.

#### 2.1 - Without graceful shutdown

1. Try to simulate a time consuming task in the application.

    ??? example "Need help?"
        For example, you can add `Thread.sleep()` when users visit the homepage and evoke the API endpoint `api/v1/ads`. 
        
        Navigate to the method `public ResponseEntity<List<AdvertisementDto>> advertisements()` in the file `src/main/java/com/sap/bulletinboard/ads/controllers/AdvertisementController.java`. Add code samples before `return`.

        ```java
        System.out.println("A time consuming task started");
        try {
            Thread.sleep(30000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("A time consuming task completed");
        ```

1. Start the database and application on your local machine.

    ??? info "Run application on Windows"
        In order to demonstrate the application shutdown process by [Signals](https://faculty.cs.niu.edu/~hutchins/csci480/signals.htm){target=_blank} on Windows platform, you can start the application by the command `java -jar <your_app>.jar`. Of course, you have to build the artifact at first by `mvn package -DskipTests`.

        If you are working on MacOS or Linux, you can start application by `mvn spring-boot:run`.

1. Go to `http://localhost:8080/` in your browser. Then press `Ctrl + C` in the terminal.

You will observe the application stopped almost immediately but an exception was thrown.

```log
A time consuming task started
^CA time consuming task completed
2023-12-19T07:58:19.181Z  WARN 12648 --- [nio-8080-exec-7] .m.m.a.ExceptionHandlerExceptionResolver : Failure in @ExceptionHandler com.sap.bulletinboard.ads.controllers.CustomExceptionMapper#handleAll(Exception, WebRequest)

org.apache.catalina.connector.ClientAbortException: java.nio.channels.ClosedChannelException
	at org.apache.catalina.connector.OutputBuffer.realWriteBytes(OutputBuffer.java:347)
    ...

2023-12-19T07:58:19.193Z  INFO 12648 --- [ionShutdownHook] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2023-12-19T07:58:19.195Z  INFO 12648 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-12-19T07:58:19.205Z  INFO 12648 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

This is because the application was forced to close the channel before the message was written.

#### 2.2 - With graceful shutdown

1. Navigate to the file `application-dev.properties`, and add the property `server.shutdown=graceful`.

1. Restart the application on your local machine.

1. Go to `http://localhost:8080/` in your browser. Then press `Ctrl + C` in the terminal.

You will observe the logs like these.

```log
A time consuming task started
^C2023-12-19T08:30:28.426Z  INFO 13778 --- [ionShutdownHook] o.s.b.w.e.tomcat.GracefulShutdown        : Commencing graceful shutdown. Waiting for active requests to complete
A time consuming task completed
2023-12-19T08:30:56.204Z  INFO 13778 --- [tomcat-shutdown] o.s.b.w.e.tomcat.GracefulShutdown        : Graceful shutdown complete
2023-12-19T08:30:56.244Z  INFO 13778 --- [ionShutdownHook] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2023-12-19T08:30:56.248Z  INFO 13778 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-12-19T08:30:56.275Z  INFO 13778 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

The logs show that the shutdown signal was received directly after the API endpoint was called. However, Spring Boot allowed the request to finish before quitting the application.

#### 2.3 - Clean up

Remove the code sample for the time consuming task, as it will affect the performance of the application and unit tests.

### 3 - Deploy to cloud platform

In practice, popular cloud platforms usually have some handy tools out of box for you to implement zero downtime deployment. For example, Kubernetes has a feature [rolling updates](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/){target=_blank} which incrementally replaces the current Pods with new ones.

#### 3.1 - Build and push the docker image

We provide a docker image registry at `cc-ms-k8s-training.common.repositories.cloud.sap`, which you can use to store your docker images for this exercise. A registry is needed, because the Kubernetes cluster cannot (and should not) pull images from your machine. To prevent overriding images pushed by other participants, we ask you to put your D/C/I number into the image name in the following instructions.

1. Notice the `Dockerfile` in the root directory of the project. Build the docker image with the following command:

    ```shell
    docker build --platform linux/amd64 -t cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1 .
    ```

    !!! warning "Insert your D/C/I number, Apple Silicon, and the build path"
        1. Replace `<your D/C/I number>` with your real D/C/I number in the above command.
        All letters in a tag must be lowercase!
        1. Don't forget the `.` at the end of the command - this tells docker to build the image based on the `Dockerfile` in the current folder. You can also specify a `Dockerfile` with a different name or in other directories [using the `-f` option](https://docs.docker.com/engine/reference/commandline/build/#file){target=_blank}
        1. The option `--platform linux/amd64` is required on Macs with Apple Silicon to make sure the image works on the remote `linux/amd64`-based Kubernetes nodes. The option is redundant for regular, `amd64` based architectures.

1. Log in to the Docker repository with following command:

    ```shell
    docker login -u "claude" -p "cmVmdGtuOjAxOjE3NzgyMjI4ODU6c2d5bGhzak9oNGRZQzRyN1JZVUx0UExwVTBO" cc-ms-k8s-training.common.repositories.cloud.sap
    ```

1. Push the built image to the registry with the following command (with your D/C/I number inserted):

    ```shell
    docker push cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1
    ```

#### 3.2 - Deploy the application

We provide Kubernetes deployment YAML files for both database and application. You can find them in the `.k8s` directory.

1. Deploy the Database to Kubernetes with the following command:

    ```shell
    kubectl apply -f .k8s/1_bulletinboard-ads-db.yaml
    ```

1. Modify the file `2_bulletinboard-ads.yaml` and replace `image` with the one you pushed in the previous step, for example: `cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1`. Also replace `<SUBDOMAIN>` with the value from the [Infrastructure](#infrastructure) step.

1. Deploy the application to kubernetes with the following command:

    ```shell
    kubectl apply -f .k8s/2_bulletinboard-ads.yaml
    ```

1. Check the deployment status by `kubectl get pod,deployment,service,ingress`

Navigate to `https://bulletinboard-ads.<SUBDOMAIN>.kyma.ondemand.com` (replace `<SUBDOMAIN>`) and you will see the application is running.

#### 3.3 - Deploy the new version with Rolling Update

1. Modify the source code. For example, you can change the page title again.

1. Build the docker image `v2` with the following command:

    ```shell
    docker build --platform linux/amd64 -t cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v2 .
    ```

1. Push the built image to the registry with the following command (with your D/C/I number inserted):

    ```shell
    docker push cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v2
    ```

1. Update the image in Kubernetes with the following command:

    ```shell
    kubectl set image deployments/bulletinboard-ads cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v2
    ```

1. Run command `kubectl get pods` and check the rolling status

Navigate to `https://bulletinboard-ads.<SUBDOMAIN>.kyma.ondemand.com` (replace `<SUBDOMAIN>`) and verify the new version is up and running.

??? info "How to define rolling update deployment in Kubernetes?"
    Here is an example in the file `<your_repo>/.k8s/2_bulletinboard-ads.yaml`.
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: bulletinboard-ads
    spec:
      ...
      strategy: 
        type: RollingUpdate
        rollingUpdate:
          maxSurge: 1
          maxUnavailable: 0
    ```
    Actually `RollingUpdate` is the default deployment strategy in Kubernetes. It lets you update a set of pods by incrementally replacing pod instances with new instances that run a new version of the application. You can set two optional parameters that define how the rolling update takes place:

    - `maxSurge` specifies the maximum number of Pods that can be created over the desired number of Pods. The value can be an absolute number (for example, 5) or a percentage of desired Pods (for example, 10%)
    - `maxUnavailable` specifies the maximum number of Pods that can be unavailable during the update process. The value can be an absolute number (for example, 5) or a percentage of desired Pods (for example, 10%)

    To find out details and other deployment strategy, please refer to [Kubernetes Docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy){target=_blank}.

#### 3.4 - Liveness Probe

Now you have learned how to deploy the application without downtime in Kubernetes, but how does Kubernetes know your application is up and running?

Kubernetes has the capability to perform a diagnostic on a container. When your application is deployed and started, Kubernetes will use **Probes** to check the health status, and make sure your application is live and ready to accept traffic.

??? info "Types of Kubernetes Probes"
    Kubernetes can optionally perform three kinds of probes on running containers:

    - `livenessProbe` indicates whether the container is running. If the liveness probe fails, Kubernetes kills the container and restart it.
    - `readinessProbe` indicates whether the container is ready to respond to requests. it can be used to control which Pods are used as backends for Services. When a Pod is not ready, it is removed from Service load balancers.
    - `startupProbe` indicates whether the application within the container is started. All other probes are disabled if a startup probe is provided, until it succeeds.

    To find out more details and examples, please refer to [Kubernetes Docs](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/){target=_blank}.

You are going to implement a liveness probe to check if the Bulletin Board application is running. You can do it by performing an HTTP GET request against the application on a specified port and path.

1. Modify the file `<your_repo>/.k8s/2_bulletinboard-ads.yaml` and add a liveness probe. 

    ??? example "Need help?"
        You can send an HTTP request on port 8080 and root path `/`. Any code greater than or equal to 200 and less than 400 indicates success. Any other code indicates failure.

        ```yaml
        apiVersion: apps/v1
        kind: Deployment
        ...
        spec:
          template:
            spec:
              containers:
                - name: app
                  ...
                  livenessProbe:
                    httpGet:
                      path: /
                      port: 8080
                    initialDelaySeconds: 10
                    periodSeconds: 30
        ```
        The `initialDelaySeconds` field tells Kubernetes that it should wait 10 seconds before performing the first probe. The `periodSeconds` field specifies that Kubernetes should perform a liveness probe every 30 seconds.

1. Apply the changes to Kubernetes with the following command:

    ```shell
    kubectl apply -f .k8s/2_bulletinboard-ads.yaml
    ```

1. Check the pod status with `kubectl get pods`

Verify your Pods are running and the Bulletin Board application is working as expected.

### 4 - Reflection 🪞

You've come that far - good job. Probably noticed a few caveats that we haven't talked about. Let's reflect about it to become an even better cloud engineer!

??? question "If micro services depend on each other, can I upgrade all of them at the same time with zero downtime deployment?"
    In real world applications, a new feature might be implemented in different micro services. You want to upgrade all the services to the new version ***at the exact same time***. But zero downtime deployment can not achieve it or mitigate upgrade workloads for you.

    - Zero downtime deployment can not orchestrate among different micro services. When service A completes upgrade, there is no guarantee that service B completes at the same time because they are deployed to different runtime environments.
    - Each micro service may have two versions up and running at a certain time, you have to consider different test combinations (A1-B1, A1-B2, A2-B1, A2-B2) to ensure compatibility. Imagine the number of tests you have to do if you want to coordinate the upgrade of even more micro services!
    - A good (loosely coupled) micro-services design is fundamental to deploy and upgrade independently.

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/k8s/zero-downtime-deployment", language="Java", language_independent = false, branch_name="zero-downtime-deployment" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %}

## 🏁 Summary

Good job!

In this module, you have learned how to apply the concept of Zero Downtime Deployment in a real world scenario. You wrote the scripts and deployed the application to BTP. You also understood the trade-offs and considerations before you implement the concept in your own project.

## 📚 Recommended Reading

- [Martin Fowler - Blue Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html){target=blank}
- [Cloud Foundry - Blue/Green Deployment](https://docs.cloudfoundry.org/devguide/deploy-apps/blue-green.html){target=blank}
- [Graceful shutdown in Spring Boot](https://www.amitph.com/spring-boot-graceful-shutdown/){target=blank}

## 🔗 Related Topics

- Zero Downtime Database Migration: [Cloud Foundry](https://pages.github.tools.sap/cloud-curriculum/materials/all/zero-downtime-db-migration/cloud-foundry-java/){target=_blank} | [Kubernetes](https://pages.github.tools.sap/cloud-curriculum/materials/all/zero-downtime-db-migration/kubernetes-java/){target=_blank}