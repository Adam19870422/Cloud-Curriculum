# Distributed Logging with Java

---

## What has to be Done?

- distributed logging system like EFK or ELK is up and running
- make it easy to **ingest, process and search** the logs

- structure the logs -> JSON
- append contextual information to logs -> Correlation ID

Notes:
- EFK = Elasticsearch, Fluentd, Kibana
- ELK = Elasticsearch, Logstash, Kibana

- when having a distributed logging system up and running already
  - how do I have to adapt my application in terms of logging?
  - goal: make it easier to ingest, process and search the logs in the log analysis stack

- this slides will focus on how to structure your logs with JSON and how to make use of the correlation-ID

---

## Pick a JSON-Encoder

```XML
<dependency>
  <groupId>com.sap.hcp.cf.logging</groupId>
  <artifactId>cf-java-logging-support-logback</artifactId>
  <version>${cf-logging-version}</version>
</dependency>
```

Notes:
- encoder: responsible for preparing the log events for outputting
- include the dependency that will bring the JSON encoder
- in this exercise we will be using the SAP's Java Logging Support libraries JSON-encoder
- there are also other JSON-encoders in the web e.g. [Logstash Logback Encoder](https://github.com/logstash/logstash-logback-encoder)

---

## Configure the JSON-Encoder in logback.xml

```XML
<configuration debug="false" scan="false">
  <appender name="STDOUT-JSON" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="com.sap.hcp.cf.logback.encoder.JsonEncoder"/>;
  </appender>
  <root level="INFO">
    <appender-ref ref="STDOUT-JSON" />
  </root>
</configuration>
```

Notes:
- this is the minimal setup that you will need to include in your `logback.xml` or `logback-spring.xml`

- appender: the component which is delegated the task to write logs
  - examples: ConsoleAppender, FileAppender
- root: configuration option to set the defaults

---

## Add Correlation-ID

- insert/extract **correlation-ID** within the HTTP-Requests as a header
- make use of logging library
  - [Instrumenting Servlets](https://github.com/SAP/cf-java-logging-support/wiki/Instrumenting-Servlets)
  - ```XML
    <dependency>
      <groupId>com.sap.hcp.cf.logging</groupId>
      <artifactId>cf-java-logging-support-servlet-jakarta</artifactId>
      <version>${cf-logging-version}</version>
    </dependency>
    ```

Notes:
- Servlet instrumentation is part of SAP's [CF Java Logging Support](https://github.com/SAP/cf-java-logging-support) libraries
- it enables developers to enhance log messages with metadata extracted from HTTP headers
- for this it uses the standard java servlet filters as specified in Java Servlet Specification, Version 3.7
- (primarily for apps running on cf but works also for apps running on k8s as long as the logs get picked up by filebeat, logstash or similar log collectors)

---

## Register the Servlet Filter

Add to `@Configuration` file
```JAVA

  import com.sap.hcp.cf.logging.servlet.filter.RequestLoggingFilter;
  import org.springframework.boot.web.servlet.FilterRegistrationBean;

  //...

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

Notes:
- use FilterRegistrationBean to enable the servlet filter in Spring Boot
- this will read the metadata from the http-headers and add them to the MDC (Mapped Diagnostic Context)

---

## Set the Correlation-ID for Outgoing Requests


```Java
import com.sap.hcp.cf.logging.common.LogContext;
import com.sap.hcp.cf.logging.common.request.HttpHeaders;

//...

@Bean
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

Notes:
- so far we have ensured, that the incoming requests are assigned a correlation-id (if it is not set already)
- we have to make sure, that this correlation-id is set in the http-headers of outgoing requests
- therefore the http-request is intercepted to include the correlation-id as http-header before finally executing the http-request
- the correlation-id is retrieved from the LogContext (MDC)

---

## Further Reading

- [Java Logging Support for Cloud Foundry](https://github.com/SAP/cf-java-logging-support)
  - [Instrumenting Servlets](https://github.com/SAP/cf-java-logging-support/wiki/Instrumenting-Servlets)
- [Essentials of Filters](https://www.oracle.com/java/technologies/filters.html)

---


# Questions?
