# Zero Downtime Deployment (Cloud Foundry + Java)

<!-- TrackingCookie-->
{% with pagename="zero-downtime-deployment-cf-java" %}
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

In the following exercises we are going to deploy a new version of an existing `bulletinboard-ads` application, and replace the old version in BTP Cloud Foundry. Some scripts will be designed to understand how zero downtime deployment works under the hood. We also have to consider how to handle open connections when the old version is terminated.

<!-- Prerequisites-->
{% with
  tools=[
  ],
  beneficial=[
    ('[Cloud Foundry Basics](../../cloud-platforms/cloud-foundry-java/){target=blank}'),
    ('[Persistence](../../persistence/java/){target=blank}')
  ],
  required=[
    ('[HTTP REST](../../http-rest/java/){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

#### 🚇 Infrastructure

- A [Cloud Foundry Space](../../cf-spaces/spaces-java/){target=blank}
- [**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}

### 🚀 Getting Started

{% with branch_name="zero-downtime-deployment", folder_name="zero-downtime-deployment-cf-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

1. Start the service's database first: `./start-db.sh` (keep the window open!)

1. Then, start the application:

    {% with main_class="BulletinboardAdsApplication" %}
    {% filter indent(4) %}
    {% include 'snippets/run-application/run-java.md' %}
    {% endfilter %}
    {% endwith %}

    You should be able to access the UI at [http://localhost:8080](http://localhost:8080){target=blank}

### 🔍 Code Introduction

The domain is a simple bulletinboard application. You can post something there that you want to advertise, such as a used laptop, and others can look at all the offerings and contact you if they are interested.

- `com.sap.bulletinboard.ads.models.Advertisement` holds all information related to an entity.
- `com.sap.bulletinboard.ads.models.AdvertisementRepository` is the persistence of the advertisements.
- `com.sap.bulletinboard.ads.controllers.AdvertisementController` is the HTTP API endpoint.

### 1 - Deploy to BTP

In this step, you can deploy the current version of the application to BTP.

1. Open the the `manifest.yml`, and replace `<YOUR c/d/i-number>` with your actual c/d/i-number (with the letter in lowercase) for the route.

1. Create database service in Cloud Foundry (database creation may take some time, you can use `cf services` to check the status).

    ```shell
    cf create-service postgresql-db development postgres-bulletinboard-ads
    ```

1. Build and Push the application.

    ```shell
    mvn package
    cf push
    ```

Navigate to the route you specified in manifest.yml (`bulletinboard-ads-<YOUR c/d/i-number>.cfapps.eu12.hana.ondemand.com`) in your web browser, for example `https://bulletinboard-ads-d123456.cfapps.eu12.hana.ondemand.com`.

You will see the user interface of the application. Create some advertisements and see how it works.

### 2 - Create a new application version

Prepare a new version for the next deployment. For simplicity, you can just change the title of the application.

1. Navigate to the file `src/main/resources/static/index.html`, and append `V2` to the title.

    ```html
      <title>Bulletin Board v2</title>
    ```

1. Build the new version with `mvn package`

### 3 - Deploy with zero downtime

Now you have a new version of the application, how to deploy it without interrupting user's access to the application?

??? question "Why don't use `cf push` directly?"
    By default, the `cf push` command will restart the application after uploading the artifact. Although the start-up period is quite short, there is a moment that you can not access it. Try to access the application from your browser during `cf push`, you will notice the downtime.

1. Deploy the new version in Cloud Foundry as a new application, for example `bulletinboard-ads-new`. And map a temporary route to it, for example `bulletinboard-ads-temp-<YOUR c/d/i-number>.cfapps.eu12.hana.ondemand.com`.

    ??? example "Need help?"
        You can push the new version with a different name and no-route, then map a route to it.
        ```shell
        cf push bulletinboard-ads-new --no-route
        cf map-route bulletinboard-ads-new cfapps.eu12.hana.ondemand.com -n bulletinboard-ads-temp-<YOUR c/d/i-number>
        ```

    You will notice there are two independent applications up and running. One serves as the old version, and another as the new version. The old version still functions as usual for customers. At the same time, you can test the new version by yourself with the temporary route. When the new version works as expected, go ahead with the following steps.

1. The original route `bulletinboard-ads-<YOUR c/d/i-number>.cfapps.eu12.hana.ondemand.com` is the official one for customers. You should map the new application to it.

    ??? example "Need help?"
        To map the new application to the original route:
        ```shell
        cf map-route bulletinboard-ads-new cfapps.eu12.hana.ondemand.com -n bulletinboard-ads-<YOUR c/d/i-number>
        ```

    Check the routes by `cf routes`. 
    
    You will notice the original route was mapped to both applications. When you access the original route, the requests will be sent to either of them randomly by Cloud Foundry. Test it in your browser.

1. Since you have verified the new application works as expected, stop sending requests to the old one.

    ??? example "Need help?"
        To unmap the old application to the original route:
        ```shell
        cf unmap-route bulletinboard-ads cfapps.eu12.hana.ondemand.com -n bulletinboard-ads-<YOUR c/d/i-number>
        ```

    All the requests will be sent to the new application.

1. Check the status by `cf apps`. Notice that the new application is mapped to two routes, and the old one is running without any route. Consider doing some clean-ups.

    ??? example "Need help?"
        You can unmap temporary route and stop the old application:
        ```shell
        cf unmap-route bulletinboard-ads-new cfapps.eu12.hana.ondemand.com -n bulletinboard-ads-temp-<YOUR c/d/i-number>
        cf stop bulletinboard-ads
        ```

    ??? question "Should you delete the temporary route and the old application?"
        You can always delete them and maintain a clean environment. But keeping them aside has some extra benefits. For example, the temporary route can always serve as an internal testing url when you plan the next deployment. The old application will be needed in case you want to roll back your changes.

    Now the application has been upgraded to the new version successfully without downtime.

### 4 - Rolling update

Now you should get some experiences on zero downtime deployment. The idea is to start up two versions of the application and switch route between them.

In practice, popular cloud platforms usually have some handy tools out of box for you to implement the same function. For example, if you are using Cloud Foundry command line interface (cf CLI) later than v7, you can consider the [rolling deployment](https://docs.cloudfoundry.org/devguide/deploy-apps/rolling-deploy.html){target=blank}.

1. Modify the code of the application and build a new artifact.

1. Deploy the application to Cloud Foundry with the parameter `--strategy rolling`.

### 5 - Graceful shutdown

As you can see from previous steps, after the old version of the application has been detached from the route, there will be no incoming requests to it any more. But the old version may perform unfinished tasks like making database connections, consuming resources, etc. You have to avoid any unwanted consequences before shutting it down.

Spring Boot supports [graceful shutdown](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes#graceful-shutdown){target=blank} by the property `server.shutdown=graceful`.

If the application does not depend on Spring Boot, you can consider [JVM shutdown hooks](https://docs.oracle.com/javase/8/docs/api/java/lang/Runtime.html#addShutdownHook-java.lang.Thread-){target=blank} and implement your own code to handle open connections.

Because it is not very convenient to verify the behavior on cloud platforms, you can just run the following steps on your local machine.

#### 5.1 - Without graceful shutdown

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

#### 5.2 - With graceful shutdown

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

Remove the code sample for the time consuming task, as it will affect the performance of the application and unit tests.

### 6 - Reflection 🪞

You've come that far - good job. Probably noticed a few caveats that we haven't talked about. Let's reflect about it to become an even better cloud engineer!

??? question "If micro services depend on each other, can I upgrade all of them at the same time with zero downtime deployment?"
    In real world applications, a new feature might be implemented in different micro services. You want to upgrade all the services to the new version ***at the exact same time***. But zero downtime deployment can not achieve it or mitigate upgrade workloads for you.

    - Zero downtime deployment can not orchestrate among different micro services. When service A completes upgrade, there is no guarantee that service B completes at the same time because they are deployed to different runtime environments.
    - Each micro service may have two versions up and running at a certain time, you have to consider different test combinations (A1-B1, A1-B2, A2-B1, A2-B2) to ensure compatibility. Imagine the number of tests you have to do if you want to coordinate the upgrade of even more micro services!
    - A good (loosely coupled) micro-services design is fundamental to deploy and upgrade independently.

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/cf/zero-downtime-deployment", language="Java", language_independent = false, branch_name="zero-downtime-deployment" %}
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