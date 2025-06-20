# Java Memory Allocation in Cloud Foundry

When creating a Java microservice, you need to be careful when specifying the memory settings.
If there is not enough memory available to the application, the application might be slow or crash.
The standard case is that the Java application produces too many objects (stored on the heap), and crashes with an `OutOfMemoryError`.
This is easy to detect and, by adapting the memory settings, easy to fix.

However, it can also happen that the CF application is killed by Cloud Foundry mechanisms because it consumed more memory than it was given, like in the following output of ``cf events <app-name>``:

```text
time                          event         actor         description
2015-03-06T08:40:51.00-0500   app.crash     my-app-name   index: 0, reason: CRASHED, exit_description: out of memory, exit_status: 255
```

In this document we try to explain the details of such memory issues, and possible solutions.

In any case, the command `cf app <app-name>` can be used to give more detailed information about the memory consumption of the application instances. In our observation, a value close to the maximum (less than 10 MByte difference) during load often results in an "out of memory" error later.

## Java Memory
A Java process does not only use memory to store object instances (on the heap), but in addition has
a "metaspace" for long-lived objects. Further memory is used for "native"
requirements, for example file or network buffers.

Java also allocates memory for the call stacks of the running threads.
The Java Buildpack automatically computes how much memory is reserved for each thread ([Xss](http://stackoverflow.com/questions/4967885/jvm-option-xss-what-does-it-do-exactly)), and by default allocates 10%
of the total memory for the stacks.

More information:
- https://github.com/cloudfoundry/java-buildpack/blob/master/docs/jre-open_jdk_jre.md
- https://github.com/cloudfoundry/java-buildpack/blob/master/config/open_jdk_jre.yml

As the number of live threads can vary, a new thread might cause the application to consume more memory than allocated.
If you know how many threads may run in parallel, or if you can define how much stack memory is necessary, you can specify
this in the manifest. The buildpack calculates based on 300 concurrent threads.

To configure 15% to be used for the stacks:
```
env:
    JBP_CONFIG_OPEN_JDK_JRE: '[memory_calculator: {memory_heuristics: {stack: 15}}]'
```

Alternatively, to base the memory computation on just 50 threads:
```
env:
    JBP_CONFIG_OPEN_JDK_JRE: '[memory_calculator: {stack_threads: 50}]'
```

You can also configure how much memory to reserve for each thread:

```
env:
    JBP_CONFIG_OPEN_JDK_JRE: '[memory_calculator: {memory_sizes: {stack: 228k}}]'
```

## Native Memory
Recent versions of the buildpack reserve 15% of the configured memory for native memory. As this configuration is implicit, this just means that heap/metaspace/stack are configured to share the remaining 85% (although, with more threads than configured, this can be exceeded).

In our experiments, about 100 MByte of native (i.e. spare) memory are necessary for our application just to start. With the default buildpack settings and memory configured below 670 MByte, this is an issue you need to be aware off.

Furthermore, during load (10 concurrent requests, each also triggering an external REST call) around 200 MByte of native memory were necessary in addition to heap/metaspace/stack but including the 100 MByte just mentioned.

As a recommendation, configure at least 1350 MByte of memory for your application, or tweak the buildpack settings. This can be done by increasing the percentage reserved for native memory, or decreasing the memory dedicated for the heap (our application is able to run/crawl with just 57 MByte of heap).

According to experiences from other companies (SwissCom, HP Enterprise) the demand for native memory could be high enough so that they configured heap+stack+permgen to use at most 1000-1300 MByte for a microservice deployed with 2048 MByte of RAM.
The exact numbers depend on the application, but the overall conclusion should be that lots of native memory might be necessary.

## glibc Memory Allocation

Memory allocation using glibc on Linux may cause fragmentation, meaning that more memory is reserved than what is requested/used by the Java process. When running in the cloud this additional overhead may cause the application to exceed its memory limit and crash.

The allocation strategy can be influenced using the `MALLOC_AREA_MAX` system environment variable, as explained in the following articles. However, this still can cause the Java process to reserve more memory than what is allowed.

```
env:
    MALLOC_ARENA_MAX: 4
```

- https://github.com/cloudfoundry/java-buildpack/pull/160
- https://www.ibm.com/developerworks/community/blogs/kevgrig/entry/linux_glibc_2_10_rhel_6_malloc_may_show_excessive_virtual_memory_usage?lang=en

Also see http://stackoverflow.com/questions/34180422/limit-total-memory-consumption-of-java-process-in-cloud-foundry

## HTTP Library
When using the Apache CXF Client, internally the class `HttpURLConnection` part of the JDK is used for outgoing HTTP requests. We observed that this library keeps objects in a keep-alive cache (for five seconds), causing about 50 MByte additional heap usage when issuing up to 10 concurrent outgoing requests as fast as possible. You may disable keep-alive using `System.setProperty("http.keepalive", "false")`.

## Further References
- [Java Memory Troubleshooting on SAP BTP](https://blogs.sap.com/2021/12/20/java-memory-troubleshooting-on-sap-btp-cloud-foundry/)
- [Application Performance Management (APM) Tool](https://go.sap.corp/apm)
- [Stack and Heap](http://tutorials.jenkov.com/java-concurrency/java-memory-model.html)
- [Native Memory Leaks and how to analyze](http://www.ibm.com/developerworks/linux/library/j-nativememory-linux/index.html)



