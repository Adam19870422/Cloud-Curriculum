# Logging Basics

<!-- TrackingCookie-->
{% with pagename="logging-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise you will learn

- how to use different logging levels and formats
- how to configure logging using spring boot
- how to log thread specific information using the MDC (Mapped Diagnostic Context)

## 🧠 Theory

- General Concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_1alas8vj){target=_blank}
- Java Specific: [slides](../slides/java){target=_blank} ([with speaker notes](../slides/java/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ykho3uf5){target=_blank}

## 💻 Exercise

During this exercise you will replace System.out/System.err usage with proper parameterized logging that are flexible and more convenient to configure.

<!-- Prerequisites-->
{% with
  beneficial=[
    '[Spring](https://spring.io/){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="logging", folder_name="logging-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

1. Run the application:

    {% with main_class="SpringBootGreetingApplication" %}
    {% filter indent(4) %}
    {% include 'snippets/run-application/run-java.md' %}
    {% endfilter %}
    {% endwith %}

    When the Application has started you should be able to see following logs in the console

    ```logtalk
    2020-06-17 10:48:13.461  INFO 31472 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
    2020-06-17 10:48:13.474  INFO 31472 --- [           main] .l.SpringBootGreetingApplication : Started SpringBootGreetingApplication in 2.031 seconds (JVM running for 2.415)
    ```

1. You can now use following URLs to consume the endpoints.

    [http://localhost:8080/hello](http://localhost:8080/hello){target=_blank}

1. You can also try to hand a parameter to the call as follows:

    [http://localhost:8080/hello?name=Mars](http://localhost:8080/hello?name=Mars){target=_blank}

### 🔍 Code Introduction

We have set up a simple Spring Boot project with basic functionality. The application provides two REST-endpoints that will produce a greeting with the passed `name` parameter. The created greeting will be delivered to the client.

You can see the implementation of the endpoints in the class `GreetingController.java`. You will see that each of the endpoints calls the `getGreeting` private method with the arguments "Hello" and "Howdy" respectively. However the developers of this app decided that the "Howdy"-greeting is deprecated and decided to point it out by doing a `System.err.println()`.

The class `GreetingService.java` is responsible for creating the greeting message. It evaluates whether the provided `name` contains any number. If the name value is valid, it creates the greeting and returns it. Otherwise it will throw an IllegalArgumentException.

--8<-- "snippets/spring-dev-tools.md"

The following exercises will let you engage in the task of setting up useful logs and the respective configuration for it.

### 1 - Logging Basics

Go to [localhost:8080/hello](http://localhost:8080/hello){target=_blank} and then check the console of the spring application to see that the `created greeting.` message was written.

Using `System.out.println` in a server application is considered a bad practice for various reasons:

- It is a blocking IO operation, affecting performance.
- It cannot easily be configured, turned off, customized, etc.
- In most scenarios these are not traceable in prod environments unless you redirected the standard output manually

That is why it is recommended to use a logging framework.
Those usually use a message queue for writing logs and provide a lot of configuration options.

#### 1.1 Acquire a Logger and Replace System.out/System.err Calls

1. Create a logger instance as private field for each class, `GreetingService` and `GreetingController`, using `getClass()` to avoid copy-paste errors (in non-static contexts).

    ??? example "Need help?"
        ```Java
        import org.slf4j.Logger;
        import org.slf4j.LoggerFactory;
        // ...
        private Logger logger = LoggerFactory.getLogger(getClass());
        ```

1. Remove the `System.out.println` call and use the logger with log-level INFO instead. 

1. Remove the `System.err.println` call and use the logger with log-level WARN instead.

1. Start the application and navigate again to [localhost:8080/hello](http://localhost:8080/hello){target=_blank}.
    Can you see the logs in the console window? Can you provoke a warning?

#### 1.2 Make Use of Parameterized Log Messages

Change the log message `created greeting.` to include the name of the person that is supposed to be greeted using the `{}`-placeholder.

??? example "Need help?"
    ```Java
    logger.info("created greeting for {}", arg);
    ```

??? info "Avoid using string concatenation in log messages"
    It might seem more intuitive to create the log message by concatenating strings, like so:
    ```Java
    logger.info("created greeting for " + arg);
    ```
    But there is an important difference:
    The string concatenation happens regardless of whether the message will be logged or not. Think of debug logs in a prod environment: we might have configured that debug logs should not be written but still the parameter of that log statements is evaluated and may negatively affect application performance. If we opt for using the placeholder instead, the string construction only happens if the message is actually logged.

### 2 - Logging Levels

Let's lower the logging level of our messages so that we don't clutter up the console.

#### 2.1 Lower the Level of Your Logs

1. Replace the calls to `logger.info(...)` with `logger.debug(...)`.

1. Hit an endpoint to provoke said logs.
    Can you still see them?

#### 2.2 Adjust the Root Logging Level

Spring Boot configures the root logging level to INFO by default.

1. Configure the root logging level to DEBUG so that we can see the logs again, while we are working on them.

    ??? example "Need help?"
        Add the following line to the file `src/main/resources/application.properties`:
        ```properties
        logging.level.root=DEBUG
        ```

1. Hit an endpoint to provoke the debug logs.
Can you see them again?

#### 2.3 Specify Logging Level for a Package

It seems like there is a lot going on, which makes it hard to spot the logs we are interested in.

1. Change the root logging level back to INFO.

    ??? example "Need help?"
        Change the content of `src/main/resources/application.properties` to this:
        ```properties
        logging.level.root=INFO
        ```

1. Additionally set the logging level specifically for the greeting package.

    ??? example "Need help?"
        Add the following line to `src/main/resources/application.properties`:
        ```properties
        logging.level.com.sap.cc.greeting=DEBUG
        ```

1. Hit an endpoint to provoke the debug logs.
Is it easier to spot them now?

### 3 - Mapped Diagnostic Context

Let's enhance our existing logs by ensuring they contain the request path.

#### 3.1 Add some Meta Information to the Logs

Add the path (e.g. `/howdy`) to the log message in the class `GreetingController` by using the `{}`-placeholder!

#### 3.2 Make Use of the MDC

Wouldn't it be great if every log message contained the path?
>But that would require changing every log-statement!
>Also we would have to pass the path on to the `GreetingService`.
>How tedious!

Luckily we can enrich the log messages without changing the log statements by using the mapped diagnostic context (MDC).

1. Use `MDC.put(key, value)` to store the path for both endpoints. When you use `%X{key}` in your log pattern, it will automatically include 'value' in your logs.
1. Make sure to call `MDC.clear()` before returning the request to prevent leaks. It's best to use `MDC.clear()` in a `finally` block. This way it gets called even if an exception is thrown.

1. Ensure the inclusion of the path in the log message by changing the pattern for console logs.

    ??? example "Need help?"
        Add the following line to `src/main/resources/application.properties`:
        ```properties
        logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} path:%X{path} - %msg%n
        ```
        Note the usage of the `%X` specifier.

1. Hit an endpoint to provoke some logs.
Do all of the log messages include the path, now?

1. Remove the path that was inserted through a placeholder, so that it is not included twice.

    !!! warning "Use a Servlet Filter"
        Inserting the path manually into the MDC like this is not advisable.
        This was done to keep the exercise comprehensible.
        Using something like a [(Servlet-)`Filter`](https://javadoc.io/static/jakarta.servlet/jakarta.servlet-api/5.0.0/jakarta/servlet/Filter.html){target=_blank} would be more sensible.

You can read more about the MDC in the [logback manual](http://logback.qos.ch/manual/mdc.html){target=_blank}.

#### 3.3 How to Mess Up the MDC

Always remember to clear the MDC with `MDC.clear()` once your contextual process is finished.
Let's explore what could happen when you don't follow that guideline.

1. Remove the `MDC.put` in one of the endpoints and remove all calls to `MDC.clear()`.

    *Take into consideration that the contextual information is stored in the active thread. 
    And also consider that some threads in the thread pool might be reused for upcoming tasks.*

1. Hit the endpoint, that still has `MDC.put` and remember the thread in the corresponding log.
1. Then keep hitting the other endpoint until that thread is "recycled" and reappears in the log messages.

    ??? question "What do you notice?"
        The log message contains the wrong path.
        The previous process that was run in the thread did not clear the MDC. 
        Finally when the thread was reused the contextual information was still present, producing misleading logs in the current context.

        While trying to comprehend a bug through logs, misleading logs like this can cause confusion and hinder progress.
  
The MDC uses the [Java ThreadLocal](https://docs.oracle.com/javase/7/docs/api/java/lang/ThreadLocal.html){target=_blank} to store the values and separate them between threads.
This is something to keep in mind, when working with reactive or multithreaded code.

Undo the changes you did to mess up the MDC before committing your solution.

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/logging", language="Java", branch_name="logging" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}



<!-- TODO: This header has to be ### -->
## 🏁 Summary

Good job!
In the prior exercises you learned how to use spring boot's logging functionality.
You improved the application's logs and configured their format.
Lastly, you added context information to the logs.

## 📚 Recommended Reading

- [Structured Logging](https://www.innoq.com/en/blog/structured-logging/){target=_blank}

## 🔗 Related Topics

- [List of Spring Boot Application Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-application-properties.html){target=_blank}
