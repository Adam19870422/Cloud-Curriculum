# Distributed Logging (Cloud Foundry)

<!-- TrackingCookie-->
{% if language == "Java" %}
    {% with pagename="distributed-logging-cf-java" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}
{% elif language == "Node.js"%}
{% with pagename="distributed-logging-cf-nodejs" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}
{% include 'snippets/node22-disclaimer.md' %}
{% endif %}

## 🎯 Learning Objectives

In this module you will learn

- how to use a backing service to collect logs
- how to make APIs use a correlation id
- how to trace a request

## 🧠 Theory

One of the arguments against a distributed system is that it is harder to debug.
However, with a good logging infrastructure in place, compiling a full trace of your complete system's behavior is no more difficult than in a monolith system.

  - General concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ewlr7qdc){target=_blank}
  {% if language == "Java" %}
  - Java specific: [slides](../slides/java){target=_blank} ([with speaker notes](../slides/java/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_5cwpyb3j){target=_blank}
  {% elif language == "Node.js" %}
  - Node.js specific: [slides](../slides/nodejs?tags=typescript){target=_blank} ([with speaker notes](../slides/nodejs/?tags=typescript&showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_appagvs8){target=_blank}
  {% endif %}


## 💻 Exercise
The microservices are almost ready to be deployed, so that you can focus on the distributed logging.

<!-- Prerequisites-->
{% if language == "Java" %}
{% with
  tools=[
      ('A [Cloud Foundry Space](../../cf-spaces/spaces-java/){target=blank}'),
      ('[**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}')
  ],
  required=[
    ('[Logging Basics](../../logging/java){target=blank}'),
    ('[Cloud Foundry Basics](../../cloud-platforms/cloud-foundry-java){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}
{% elif language == "Node.js" %}
{% with
  tools=[
      ('A [Cloud Foundry Space](../../cf-spaces/spaces-nodejs/){target=blank}'),
      ('[**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide)')
  ],
  required=[
    ('[Logging Basics](../../logging/nodesjs){target=blank}'),
    ('[Cloud Foundry Basics](../../cloud-platforms/cloud-foundry-nodejs){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}
{% endif %}


### 🚀 Getting Started

{% if language == "Java" %}

{% with branch_name="distributed-logging", folder_name="distributed-logging-cf-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

    You should now have three maven projects in the IDE:

    - parent-distributed-logging
    - greetings
    - users
{% elif language == "Node.js" %}

{% with branch_name="distributed-logging-ts", folder_name="distributed-logging-cf-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

1. Finally, install the required dependencies by running the following command within the `greetings` **and** `users` directories:

    ```sh
    npm install
    ```

{% endif %}

### 🔍 Code Introduction

We provide two microservices: `greetings` and `users`.
Both expose a simple REST interface.
The `greetings` service calls the `users` service to retrieve the necessary information.


### 1 - Deploy the Services

{% if language == "Java" %}
1. In the root directory of the cloned project build the apps by running the following command:
    ```shell
    mvn package
    ```
{% endif %}
1. Make sure your Cloud Foundry CLI client is logged in and targeting the correct space.
1. In the root directory open the file `vars.yaml` and replace the `<YOUR C/D/I-NUMBER>` placeholder with your actual C/D/I-number in with the letter being lowercase.

    If you are not using a Cloud Foundry trial account you will also need to adapt the value for `domain` in the `vars.yaml`.

{% if language == "Node.js" %}
1. Run the shell script `cf_push_apps.sh` to build and push the apps
    
    --8<--- "snippets/shell-script-on-windows.md"

    ??? info "Command Walkthrough"
        The shell script runs the npm build script to compile both app's typescript to their dist folders. Afterwards a cf push with a variable substitutions file (vars-file) is executed.

        The values given in the file `vars.yaml` will be used to replace the placeholders (denoted by doubled parentheses) in the file `manifest.yaml`. For more details, see the [Cloud Foundry Documentation](https://docs.cloudfoundry.org/devguide/deploy-apps/manifest-attributes.html#variable-substitution){target=_blank}.

{% elif language == "Java" %}
1. Run the following command to deploy both applications
    ```shell
    cf push --vars-file vars.yaml
    ```
{% endif %}

### 2 - Use the Logging Service

The Cloud Foundry Marketplace provides the [application-logs service](https://help.sap.com/viewer/product/APPLICATION_LOGGING/Cloud/en-US){target=_blank} which lets us stream our logs to a central application logging stack.
The service uses the ELK-Stack to process, store and visualize the logs of the bound applications.

1. Create an instance of the `application-logs` service with the name `app-logs`.
    Use the `lite` or `free` plan if available. (You can use `cf marketplace` to see the available plans).

    ??? example "Need help?"
        Use the `create-service` command:
        ```shell
        cf create-service application-logs lite app-logs
        ```

   1. Add a `services:` mapping to each service in `manifest.yaml` with `app-logs` being an entry.

    ??? example "Need help?"
        Your `manifest.yaml` should be similar to the following:
{% if language == "Java" %}
        ```yaml
        applications:
        - name: users
          memory: 800MB
          buildpacks:
          - https://github.com/cloudfoundry/java-buildpack.git
          services:
          - app-logs
          path: users/target/users.jar
          routes:
          - route: users-((identifier)).((domain))
          env:
            JBP_CONFIG_OPEN_JDK_JRE: '{ memory_calculator: { stack_threads: 200 },
                jre: { version: 17.+ } }'
            JBP_CONFIG_SPRING_AUTO_RECONFIGURATION: '{enabled: false}'
        - name: greetings
          memory: 800MB
          buildpacks:
          - https://github.com/cloudfoundry/java-buildpack.git
          services:
          - app-logs
          path: greetings/target/greetings.jar
          routes:
          - route: greetings-((identifier)).((domain))
          env:
            JBP_CONFIG_OPEN_JDK_JRE: '{ memory_calculator: { stack_threads: 200 },
                jre: { version: 17.+ } }'
            JBP_CONFIG_SPRING_AUTO_RECONFIGURATION: '{enabled: false}'
            USERS_URL: https://users-((identifier)).((domain))/api/v1/users
        ```
{% elif language == "Node.js" %}
        ```yaml
        applications:
          - name: users
            memory: 80MB
            command: npm start
            buildpacks:
              - https://github.com/cloudfoundry/nodejs-buildpack
            path: users
            routes:
              - route: users-((identifier)).((domain))
            services:
              - app-logs
          - name: greetings
            memory: 80MB
            command: npm start
            buildpacks:
              - https://github.com/cloudfoundry/nodejs-buildpack
            path: greetings
            routes:
              - route: greetings-((identifier)).((domain))
            env:
              USERS_URL: https://users-((identifier)).((domain))/api/v1/users
            services:
              - app-logs
        ```
{% endif %}

{% if language == "Java" %}
1. Run `cf push --vars-file vars.yaml` again to bind the logging service.
{% elif language == "Node.js" %}
1. Save the file and execute the shell script `cf_push_apps.sh` again to push the changes.
{% endif %}

!!! warning "Dropped logs"
    The `application-logs` service has a quota limit on memory per hour.
    If the message volume exceeds the plan limit, all incoming messages are rejected until the next interval begins.
    Although it is unlikely that you will run into this limit during the exercise, it is something you should keep in mind if you are planning to take this into production.
    Read more about the quota limits and enforcement in the [service's documentation](https://help.sap.com/viewer/ee8e8a203e024bbb8c8c2d03fce527dc/Cloud/en-US/cd1fb12a31844fcaa5834dff798dba4c.html){target=_blank}.

### 3 - Take a Look at the Logs

The service provides a nice web interface for us to query the logs coming from our applications.

#### 3.1 Access the Logs

Run `cf target` and copy the **API endpoint**. Replace `api` with `logs` and open the resulting address in a browser.
    For example, if `cf target` returns `https://api.cf.eu12.hana.ondemand.com`, open `https://logs.cf.eu12.hana.ondemand.com` in your browser.

You may need to sign in, but afterwards you should be seeing a Kibana dashboard.

#### 3.2 Kibana Dashboard

1. Click on the menu icon in the top left menu and then on Dashboards - Requests and Logs page.
1. Expand the time range and click refresh until you see logs in the Application Logs table.

    It seems the service already captured many logs, just from pushing the apps.
    You may see logs from other applications, unrelated to the training, running on the landscape (even from other orgs and spaces).

1. To view the complete log details, click on the magnifier symbol (Inspect document details)

### 4 - Generate Some Traffic

1. Determine the route of the `greetings` app with `cf apps`.
1. Open it in a browser with the following path appended: `/api/v1/greetings/1`
    You should see a nice greeting for **Jane**.

1. Back in the Kibana tab, refresh to see the newly generated logs.
    It may take a few seconds for the logs to appear.
    Just keep refreshing until you see them and make sure that you have selected an appropriate timeframe.

1. In the greetings tab, navigate to the following path: `/api/v1/greetings/99`.
    You should see a greeting for **User**.

{% if language == "Java" %}
1. Find the error stacktrace emitted by the greetings service in Kibana.

The lines of the stacktrace are shown as separate log messages.
It clutters up the view and is bad for searchability.
Time to change the log format for more cohesive log messages.
{% elif language == "Node.js" %}
1. Find the warning log with the message:

    `Response from users service was not ok: https://users-((identifier)).((domain))/api/v1/users/99 - {\"status\":404,\"statusText\":\"Not Found\"}`

    (with `((identifier))` and `((domain))` matching your actual vars).

    If you look at the code that emits that log message you will see that it's supposed to contain more information, such as the response's status.
    Some configuration is needed, for it to be included.
{% endif %}

{% if language == "Java" %}
### 5 - Configure JSON Format

1. Create a file named `logback-spring.xml` in the `src/main/resources` directory for **both services** with the following content:
    ```xml
    <configuration debug="false" scan="false">
        <appender name="STDOUT-JSON" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="com.sap.hcp.cf.logback.encoder.JsonEncoder"/>
        </appender>
        <!-- for local development, you may want to switch to a more human-readable layout -->
        <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%date %-5level [%thread] - [%logger] [%mdc] - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="${LOG_ROOT_LEVEL:-INFO}">
            <!-- Use 'STDOUT' instead for human-readable output -->
            <appender-ref ref="STDOUT-JSON" />
        </root>
        <!-- request metrics are reported using INFO level, so make sure the instrumentation loggers are set to that level -->
        <logger name="com.sap.hcp.cf" level="INFO" />
    </configuration>
    ```
    With this configuration we are telling logback to write the logs in JSON format.

1. Rebuild the `.jar` files by running the following command:
    ```shell
    mvn package
    ```

1. Push the updated applications by running the following command:
    ```shell
    cf push --vars-file vars.yaml
    ```

1. Refresh the page with the path `/api/v1/greetings/99` on the greetings app to provoke the error again.

1. Search the logs in Kibana for the log message including the complete stacktrace.
{% endif %}

{% if language == "Java" %}
### 6 - Add Metadata
{% elif language == "Node.js" %}
### 5 - Add Metadata
{% endif %}
The log messages can be further enhanced with metadata which can be extracted from HTTP headers.
{% if language == "Java" %}
The used logging library provides a servlet filter which does exactly that (see the [documentation](https://github.com/SAP/cf-java-logging-support/wiki/Instrumenting-Servlets){target=_blank}).

1. Add the following dependency to the `pom.xml` files of **both services**:
    ```xml
    <!-- We're using the Servlet Filter instrumentation -->
    <dependency>
        <groupId>com.sap.hcp.cf.logging</groupId>
        <artifactId>cf-java-logging-support-servlet-jakarta</artifactId>
        <version>${cf-logging-version}</version>
    </dependency>
    ```

1. Load/Sync the maven changes.

1. Add the following snippet to the files `SpringBootGreetingApplication.java` and `SpringBootUserApplication.java` to register the ServletFilter (RequestLoggingFilter):
    ```java
    @Bean
    public FilterRegistrationBean<RequestLoggingFilter> loggingFilter() {
        FilterRegistrationBean<RequestLoggingFilter> filterRegistrationBean = new FilterRegistrationBean<>();
        filterRegistrationBean.setFilter(new RequestLoggingFilter());
        filterRegistrationBean.setName("request-logging");
        filterRegistrationBean.addUrlPatterns("/*");
        filterRegistrationBean.setDispatcherTypes(DispatcherType.REQUEST);
        return filterRegistrationBean;
    }
    ```
    and add the missing imports with the help of your IDE (for the class `DispatcherType` use `jakarta.servlet.DispatcherType`)

1. Rebuild the `.jar` files by running the following command:
    ```shell
    mvn package
    ```

{% elif language == "Node.js" %}
The used logging library provides a middleware which does exactly that (see the [documentation](https://sap.github.io/cf-nodejs-logging-support/general-usage/request-logs){target=_blank}).

1. Add the following line as the very first middleware to the `application.ts` files in **both** the `users` and the `greetings` service:
    ```typescript
    app.use(log.logNetwork)
    ```

    The library let's you choose between the global and request logging context.
    In the request logging context there will be additional fields (e.g. correlation_id, request_id, etc.) attached to the log message.
    See the [documentation](https://sap.github.io/cf-nodejs-logging-support/general-usage/logging-contexts){target=_blank}.

1. Make use of the request context in your HTTP endpoints in each service by substituting the `log` objects by `req.logger` (don't forget the ones passed on as parameters to called methods).
{% endif %}
{% if language == "Node.js" %}
1. Push the updated application by running the shell script `cf_push_apps.sh` again
{% else %}
1. Push the updated applications by running the following command:
    ```shell
    cf push --vars-file vars.yaml
    ```
{% endif %}
1. Hit the `greetings` endpoint again to generate some new logs.

1. Refresh the logs and check the values in the column named `correlation_id`.

    You can also filter by a specific correlation-ID to trace down the logs of a specific request.

You probably noticed that the logs from the two services have different correlation-IDs even though one gets called from the other.
A little more work is needed to make that correlation visible in the logs...

??? info "What is the Correlation-ID?"

    The `correlation-id` uniquely identifies each user-request.
    When a user-request is delegated from one microservice to another, the `correlation-id` is written as an HTTP-header.
    The next microservice then picks up the `correlation-id` from the HTTP-header and includes it in every log message that is written in the context of this user-request.
    When a microservice receives a request without `correlation-id` (e.g. initial user interaction) it creates a new one.

{% if language == "Java" %}
### 7 - Transmit the Correlation-ID
{% elif language == "Node.js" %}
### 6 - Transmit the Correlation-ID
{% endif %}
{% if language == "Java" %}
1. Replace the `webClient` method in the class `SpringBootGreetingApplication` using the following code:
    ```java
    public WebClient webClient() {
        return WebClient.builder().filter((request, next) -> {
                    ClientRequest filtered = ClientRequest.from(request)
                            .header(HttpHeaders.CORRELATION_ID.getName(), LogContext.getCorrelationId())
                            .build();
                    return next.exchange(filtered);
                }
        ).build();
    }
    ```
    and add the missing imports with the help of your IDE (for the `HttpHeaders` use `com.sap.hcp.cf.logging.common.request.HttpHeaders`)

    It ensures that all outgoing requests using the `webClient` have the Correlation-ID header set.

1. Rebuild the `.jar` files by running the following command:
    ```shell
    mvn package
    ```
{% elif language == "Node.js" %}
1. Add the following object as the second argument to the `fetch` call in the file `greetings/src/lib/service/users-service.ts`:

    ```typescripts
    const response = await fetch(url, {
      headers: {
        // forwards the correlation id from the logging context to the users service
        'X-CorrelationID': (log.getCorrelationId() as string)
      }
    })
    ```

    `fetch` has two [parameters](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters){target=_blank}, with the second being an object containing custom settings that you want to apply to the request.
    By setting the `headers` property with an object literal, you can add any headers to the request.
{% endif %}

{% if language == "Node.js" %}
1. Push the updated applications by running `cf_push_apps.sh` again
{% else %}
1. Push the updated applications by running the following command:
    ```shell
    cf push --vars-file vars.yaml
    ```
{% endif %}
1. Hit the greetings endpoint again to generate some new logs.
1. Check whether both services now have the same correlation-ID for the same "request" in their logs.

{% if language == "Java" %}
### 8 - Find the Bug

A user noticed a discrepancy between the greeting ids shown at `/api/v1/greetings` and the actual greetings returned for those ids.
The user wanted to generate a greeting for **Erika**, which supposedly had the id `2`, but `/api/v1/greetings/2` returned a greeting for **Juan**.
Can you use the logs to find out where this discrepancy may be coming from?
{% endif %}

{% if language == "Java" %}
### 9 - Reflection
{% elif language == "Node.js" %}
### 7 - Reflection
{% endif %}
Recollect what you learned and learn about potential issues with the [reflection points](../slides/reflection){target=_blank}

{% include 'snippets/cf-cleanup.md' %}

## 🙌 Congratulations! Submit your solution.

{% if language == "Node.js" %}
{% with path_name="node/cf/distributed-logging", language="Node.js", branch_name="distributed-logging-ts" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}

{% if language == "Java" %}
{% with path_name="java/cf/distributed-logging", language="Java", branch_name="distributed-logging" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}
{% endif %}

## 🏁 Summary

Good job!
In this exercise you

- [x] set up distributed logging infrastructure
{% if language == "Java" %}
- [x] configured a JSON log format
{% endif %}
- [x] added metadata to your logs
- [x] set up the handling of correlation IDs
{% if language == "Java" %}
- [x] traced a bug through the Kibana interface
{% endif %}

{% if language == "Java" %}
## 🦄 Stretch Goals

{% include 'snippets/stretch-goal-disclaimer.md' %}

You should already have a good idea of all common parts by now, you could stop here... oooor you can fix that pesky bug.
{% endif %}
## 📚 Recommended Reading
- [Distributed Logging Architecture in the Container Era](https://blog.treasuredata.com/blog/2016/08/03/distributed-logging-architecture-in-the-container-era/){target=_blank}
- [Good Practices for Distributed Logging](https://www.javacodegeeks.com/2017/07/distributed-logging-architecture-microservices.html){target=_blank}

## 🔗 Related Topics
{% if language == "Java" %}
- [Java Logging Support for Cloud Foundry Library](https://github.com/SAP/cf-java-logging-support#java-logging-support-for-cloud-foundry){target=_blank}
{% elif language == "Node.js" %}
- [Node.js Logging Support for Cloud Foundry Library](https://github.com/SAP/cf-nodejs-logging-support#nodejs-logging-support-for-cloud-foundry){target=_blank}
{% endif %}
