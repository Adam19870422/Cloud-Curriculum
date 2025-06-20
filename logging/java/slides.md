# Logging Java

---

## SLF4J

- Simple Logging Façade for Java
- decouples your application from underlying logger framework
- interface for various logging frameworks (e.g. logback, java.util.logging, log4j)
- is pre-packaged with Spring Boot (+logback)

Notes:

- throughout this course we will be using SLF4J so lets have a look what it is and why we use it
- By using SLF4J we have the flexibility to not be tied to a specific logging framework. And this is the main purpose of SLF4J. Since we are not coupled to the logging framework, it is possible to change it easily.
- the main reason to use SLF4J is flexibility. it allows you to plugin the main logging frameworks easily without changing your logging code
- besides flexibility, it is easy to use and is widely used, thus you can find most corner cases and specific scenarios on StackOverflow
- further reading: [docs](http://www.slf4j.org/docs.html), [manual](http://www.slf4j.org/manual.html), [faq](http://www.slf4j.org/faq.html)

---

### Simple logging

```Java
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
// ...
private Logger logger = LoggerFactory.getLogger(MyApp.class);
// MyApp starts...
logger.info("The application has started successfully");
```
- error, warn, info, debug and trace

Notes:
- in order to write logs you need to get a logger instance first. This is possible with the LoggerFactory
- notice the `MyApp.class` parameter, SLF4J uses it to name the logger instance according to the hosting class
- with the logger instance you can write logs in different levels: error, warn, info, debug, trace
- http://slf4j.org/faq.html#declared_static

---

### Error logging

```Java
try {			
	result = service.calculateResult(input1, input2);
} catch (IllegalArgumentException ex) {
	logger.error("Could not calculate result", ex);
}
```

Notes:

- to log errors use the respective log level
- log errors on the highest possible call stack to prevent duplicate logging of exceptions

---

### Generic logger instantiation

- to avoid copy-paste errors while introducing logs to a new class use `getClass()` instead of `MyApp.class`

```Java
private Logger logger = LoggerFactory.getLogger(getClass());
```

Notes:

- note that this will only work with the logger as an instance variable, when using static you have to provide the host class as parameter
- Read [this](http://slf4j.org/faq.html#declared_static) for guidance on whether to declare logger member static or not.

---

## Parameterized logging

---

### Don't do string concatenation

- What's wrong with String concatenation in log statements?
```Java
logger.debug("User no. : " + i + " sent request " + String.valueOf(requestId));
```

- regardless of whether the message is logged or not, the whole String is constructed
- this puts up performance costs
- better yet -> parameterized logs

---

### Convenient way of parameterizing

- provide placeholders with `{}` and append your values as arguments like:
```Java
User userA = new User();
User userB = new User();
logger.debug("User: {}.", userA);
logger.debug("User {} pairs off with {}.", userA, userB);
```

- the message will be formated only when the log shall be written

Notes:

- after evaluating whether or not to log, and only if the decision is affirmative, the message will get formatted and the so called "formatting anchors" will be substituted by the provided values. This form of parameterizing does not incur the cost of parameter construction when the log is not written.
- the convenient way of parameterizing will outperform the concatenation by a factor of at least 30

---

### Conditional logging

- use `isXXXEnabled` for expensive constructs

```Java
if (logger.isDebugEnabled()) {
  Object argument = thisIsExpensive();
  logger.debug("msg:{}", argument);
}
```

Notes:
- whenever your logging statement requires a parameter whose construction is costly in the matter of performance, consider logging it conditionally

---

### Spring Boot default logging output

<!-- Move this slide into configuration section? -->

```logtalk
2014-03-05 10:57:51.112  INFO 45469 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/7.0.52
2014-03-05 10:57:51.253  INFO 45469 --- [ost-startStop-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2014-03-05 10:57:51.253  INFO 45469 --- [ost-startStop-1] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1358 ms
2014-03-05 10:57:51.698  INFO 45469 --- [ost-startStop-1] o.s.b.c.e.ServletRegistrationBean        : Mapping servlet: 'dispatcherServlet' to [/]
2014-03-05 10:57:51.702  INFO 45469 --- [ost-startStop-1] o.s.b.c.embedded.FilterRegistrationBean  : Mapping filter: 'hiddenHttpMethodFilter' to: [/*]
```

Notes:

- By default Spring boot has following log output configured
  - Date and Time: Millisecond precision and easily sortable
  - Log level
  - Process ID
  - a --- separator to distinguish the start of actual log messages
  - Thread name
  - Logger name
  - The log message
  - A platform dependent line separator

---

# Configuration

Notes:

- spring and logback are very customizable and extendable frameworks

---

## logging properties

- Can be set in `application.properties`
- `logging.level.*`
    - `logging.level.root=DEBUG`
    - `logging.level.org.springframework=INFO`
- `logging.pattern.console`
- See [core properties](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-application-properties.html)

Notes:

- there are many ways to provide properties to spring boot, e.g. via cli arguments or environment variables. See [here](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config) for the full list.
- spring exposes some properties, that are useful to configure logging
- we can set the logging level for root or per package/class
- we can specify a pattern for the console and another one for files

---

## Patterns

- Use C language `printf()`-style patterns to customize log messages
- *conversion patterns* are composed of literal text and *conversion specifiers*
```
time: %-8d{HH:mm:ss.SSS} --- %msg
```
```
%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```
- Consult [the docs](http://logback.qos.ch/manual/layouts.html#conversionWord) for a full list of conversion words

Notes:

Conversion specifiers always start with a %-sign, optionally followed by format specifiers, which control field width, padding and left or right justification. Examples are `-8` and `-5`.
Then comes the conversion word, which controls the data field, e.g. `d` for date, `msg`, `thread`, etc.
Some conversion words accept parameters.
These reside inside the curly braces (e.g. date accepts a pattern).

---

## Problem: missing context information

- can you identify any correlation between log and served user?

```
17:25:16,371 http-8080-3 INFO Service1.execute(77) | Handling request for service 1
17:25:16,372 http-8080-6 INFO Service1.execute(77) | Handling request for service 1
17:25:16,425 http-8080-6 INFO Service1.execute(112) | Requesting data from database
17:25:16,430 http-8080-3 INFO Service1.execute(112) | Requesting data from database
17:25:16,443 http-8080-3 INFO Service1.execute(120) | Completed request
17:25:16,479 http-8080-6 INFO Service1.execute(120) | Completed request
```

```Java
LOGGER.info(" Session Id:"+sessionId+" Requestid:"+requestId+ "Handling request for service 1")
// solution?
```

Notes:

- you can identify that service 1 is being called two times, one thread each
- can you tell which log is written for which user's process?
- there is no information about the particular context, in which the log gets written
- it could be useful to have your logs including that info: e.g. userId, sessionId etc.
- the proposed solution is not very elegant, since we have to adjust every log statement and have to pass the contextual information along with the subroutines that are being called during the whole process
- Here MDC comes in handy...

---

## Mapped Diagnostic Context (MDC)
- "The MDC manages contextual information on a per-thread basis [...]"
- a simple key/value mechanism to capture and use diagnostic data in logs
- supported by SLF4J/logback, log4j, log4j2
- implicitly inserts request context information into logs
- log statements can be very specific

Notes:

- Context information can be useful when tracing logs while analyzing a bug

---

### Usage
- in order to put information into the MDC use:
```Java
MDC.put("requestId", request.getHeader("RequestId"));
service.doFurtherProcessing();
MDC.remove("requestId");
// or
MDC.clear();
```

- Access the requestId in the pattern through the *%X* specifier e.g.:
```properties
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} requestId:%X{requestId} - %msg%n
```

Notes:

- MDC.put() adds a key and a corresponding value in the MDC. In this case we use a RequestId from the HTTP-Header
- MDC.remove() removes the entry identified by the key parameter
- MDC.clear() is used to empty the information in the MDC
- Perform MDC.remove() or MDC.clear() operations within finally blocks to ensure invocation, regardless of code execution path.

---

### Final output

```logtalk
2020-06-17 17:25:16 http-8080-3 INFO Service1.execute(77) requestId:U1001 - Handling request for service 1
2020-06-17 17:25:16 http-8080-6 INFO Service1.execute(77) requestId:U1002 - Handling request for service 1
2020-06-17 17:25:16 http-8080-6 INFO Service1.execute(112) requestId:U1002 - Requesting data from database
2020-06-17 17:25:16 http-8080-3 INFO Service1.execute(112) requestId:U1001 - Requesting data from database
2020-06-17 17:25:16 http-8080-3 INFO Service1.execute(120) requestId:U1001 - Completed request
2020-06-17 17:25:16 http-8080-6 INFO Service1.execute(120) requestId:U1002 - Completed request
```

- now we are able to examine the logs in the context of the served user by checking the requestId

---

# Questions?
