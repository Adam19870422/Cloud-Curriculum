# Overview

## Prerequisites

### Technical Prerequisites

- [Java](prerequisites/java.md)
- [Node.js](prerequisites/nodejs.md)
- [Python](prerequisites/python.md)

### Language & Stack

- [Java](stack-basics/java.md)
- [Node.js](stack-basics/nodejs.md)
- [Python](stack-basics/python.md)

## Software Craftsmanship

Agile Software Engineering encompasses practices such as test-driven development (TDD), test isolation, refactoring, pair programming and the related tools.
These practices have many proven benefits such as increased quality on all levels, better design, more stable code lines, less integration efforts, much less maintenance efforts and even increased development speed overall.

[Learn more about the Agile Software Engineering mindset](ase-mindset/what-is-ase-java.md)

### Unit Testing

In this module you will learn how to design and write good Unit tests, how to use assertions, and how to run your tests efficiently using your tools, including coverage reports.

- [Java](unit-testing/java.md)
- [Node.js](unit-testing/nodejs.md)
- [Python](unit-testing/python.md)

### Pair Programming

Pair programming means that two developers write the code together. Having a well informed discussion partner and your bad conscience sitting next to you helps you to take better decisions than you would do alone. Constant knowledge transfer within the whole team is another benefit of practicing pair programming.

In this module you will learn how to work in pair programming mode, how to setup your tool environment to effectively pair and how to use generative AI tools as pairing partner.

- [Java](ase-mindset/pair-programming-java.md)
- [Node.js](ase-mindset/pair-programming-nodejs.md)
- [Python](ase-mindset/pair-programming-python.md)

### Test Driven Development

Test-driven development (TDD) is a software development approach that emphasizes writing tests before writing the actual code. With TDD, developers write a failing test case first, then write the code to make the test pass. This iterative process helps ensure that the code meets the desired functionality and prevents regressions. TDD promotes better code quality, improved design, and faster development cycles. By following TDD practices, developers can have more confidence in their code and create more robust and maintainable software.

In this module you will learn how to apply TDD on a given example, and drive your implementation through short iterations.

- [Java](test-driven-development/java.md)
- [Node.js](test-driven-development/nodejs.md)
- [Python](test-driven-development/python.md)

### Clean Code & Refactoring

The time spent for reading code is easily 10 times higher than the time spent for writing code. Poor code can slow down development significantly. Refactoring is a discipline for restructuring an existing body of code, altering its internal structure without changing its external behavior. In essence when you refactor you are improving the design of the code after it has been written.

In this module you will learn how to perform many small refactorings while keeping the code functional, identify issues with Clean Code principles and practice using the shortcuts of your IDE to make your refactoring work more efficient.

- [Java](refactoring/java.md)
- [Node.js](refactoring/nodejs.md)
- [Python](refactoring/python.md)

### Decoupling & Test Isolation

By decoupling your code, you can achieve better modularity, flexibility, and maintainability. This involves using principles like the Dependency Inversion Principle (DIP) and Dependency Injection (DI) to reduce dependencies between components.

Test isolation, on the other hand, focuses on ensuring that each test case is independent and does not rely on the state or behavior of other tests. This allows for more reliable and predictable test results. Techniques like mocking can be used to simulate dependencies and isolate the code under test.

In this module you will learn how to decouple your code using DIP and DI, how to isolate your tests effectively, and how to use tools for basic mocking.

- [Java](decoupling/java.md)
- [Node.js](decoupling/nodejs.md)
- [Python](decoupling/python.md)

### Legacy Code

In this module you will learn how to make existing code that might not adhere to clean code practices and has grown organically over time testable and extensible.

- [Java](legacy-code/java.md)
- [Node.js](legacy-code/nodejs.md)

### Dependency Injection Frameworks

In this module, you will learn about Dependency Injection (DI) frameworks and how they can enhance the development process. DI frameworks provide a way to manage dependencies between different components of an application, making it easier to maintain and test code.

- [Java](decoupling/di-frameworks-java.md)

### Testing Strategy

Unit tests are usually not sufficient to ensure high quality of your software product.

In this module you will learn more about different kinds of tests.

- [Java](ase-mindset/testing-overview-java.md)
- [Node.js](ase-mindset/testing-overview-nodejs.md)
- [Python](ase-mindset/testing-overview-python.md)

## Cloud Engineering

Being successful in the Cloud requires overcoming the friction between development and operations in order to foster business agility: you build it, and you run it. It's about high automation, short innovation cycles, transparency on application health and feature usage, and collaboration.

Cloud engineering is a multidisciplinary field that focuses on the design, development and operation of applications based on cloud computing models. It encompasses practices such as software architecture, containerization and virtualization, cloud platforms, continuous delivery, and many concepts in DevOps.

Cloud Engineering aims to improve efficiency and reduce cost for organizations of all sizes. By applying its practices, development teams can build applications with high scalability and availability, but low business overhead.

### HTTP REST

HTTP (Hypertext Transfer Protocol) is a protocol used for transmitting information over the Internet. It defines how messages are formatted and transmitted, and how web servers and browsers should respond to various commands.

REST (Representational State Transfer) is an architectural style for designing networked applications. It uses HTTP to make calls between machines and is often used in web services development for its simplicity and scalability. RESTful services enable clients to access and manipulate web resources by using a uniform and predefined set of operations.

In this module you will learn how to create a simple REST endpoint and how to do integration testing.

- [Java](http-rest/java.md)
- [Node.js](http-rest/nodejs.md)
- [Python](http-rest/python.md)

### Logging

Logging is a key aspect of software development, enabling developers to track their application's behavior, diagnose issues, and monitor systems. 

In this module you will learn how to use different logging levels and formats and how to log context specific information that makes logs easier to analyze.

- [Java](logging/java.md)
- [Node.js](logging/nodejs.md)
- [Python](logging/python.md)

### Persistence

In computer science, persistence refers to the characteristic of state that outlives the process that created it.

In this module you will learn how to connect your application to a database, how to read from and write to the database, and how to to integration tests.

- [Java](persistence/java.md)
- [Node.js](persistence/nodejs.md)
- [Python](persistence/python.md)

### Authentication & Authorization

When building web applications, one common set of concerns are: How do we prevent unauthenticated users from gaining the access? How can we implement a seamless single sign on experience? And how do we control who can access what information within the web application?

In this module you will learn about the basics of authentication (who are you?) and authorization (what are you allowed to do?).

- [Java](auth/java.md)
- [Node.js](auth/nodejs.md)
- [Python](auth/python.md)

### Microservices

The microservice architectural style is an approach to developing a single application as a suite of small services, each running in its own process and communicating with lightweight mechanisms, often an HTTP resource API. These services are built around business capabilities and independently deployable by fully automated deployment machinery.

This theory module gives you an overview of microservices: What are Microservices and what problems are we trying to solve, and are Microservices always a good Idea - what tradeoffs are we making?

- [Java](cloud-microservices/intro-java.md)
- [Node.js](cloud-microservices/intro-nodejs.md)
- [Python](cloud-microservices/intro-python.md)

### Decoupling Services

If microservices are tightly coupled, this negatively impacts them in multiple ways. In our scenario we will focus on the aspect of uptime, as both services will be broken if one goes down.

In this exercise you will learn how to decouple two microservices by leveraging eventual consistency and asynchronous communication.

- [Java](decoupling-services/java.md)

### Containers

Containers are a standardized unit of software that allows developers to isolate their app from its environment, solving the _“But it works on my machine!”_ headache.

In this module you will learn the basics of containers using Docker.

- [Java](containers/java.md)
- [Node.js](containers/nodejs.md)
- [Python](containers/python.md)

### Cloud Platforms

Platform as a service (PaaS) or application platform as a service (aPaaS) or platform-based service is a category of cloud computing services that provides a platform allowing customers to develop, run, and manage applications without the complexity of building and maintaining the infrastructure typically associated with developing and launching an app.

In this module you will learn how to deploy an application on BTP, binding it to a backing service (database), and how to expose it to the internet.

- [Java & Cloud Foundry](cloud-platforms/cloud-foundry-java.md)
- [Java & Kubernetes](cloud-platforms/kubernetes-java.md)
- [Node.js & Cloud Foundry](cloud-platforms/cloud-foundry-nodejs.md)
- [Node.js & Kubernetes](cloud-platforms/kubernetes-nodejs.md)
- [Python & Cloud Foundry](cloud-platforms/cloud-foundry-python.md)
- [Python & Kubernetes](cloud-platforms/kubernetes-python.md)

### Continuous Delivery

Continuous Delivery is a software development discipline where you build software in such a way that the software can be released to production at any time.

In this module you will learn what Continuous Delivery is, and how to setup a minimal CI/CD pipeline that builds, tests and deploys your service.

- [Java & Cloud Foundry & Github Actions](continuous-delivery/cloud-foundry-java.md)
- [Java & Kubernetes & Github Actions](continuous-delivery/kubernetes-java.md)
- [Node.js & Cloud Foundry & Github Actions](continuous-delivery/cloud-foundry-nodejs.md)
- [Node.js & Kubernetes & Github Actions](continuous-delivery/kubernetes-nodejs.md)
- [Python & Cloud Foundry & Github Actions](continuous-delivery/cloud-foundry-python.md)
- [Python & Kubernetes & Github Actions](continuous-delivery/kubernetes-python.md)

### Release Toggles

Imagine you deploy to production every week, or even daily, but the current feature you're working on requires longer than this to complete. How can you share your code with your colleagues, and integrate it early and continuously into the main code line, in order to avoid accumulating risk and running into late integration issues? Additionally, how do you avoid revealing a half-implemented feature to the users and customers?

In this module you will learn about the problem that _release_ toggles help you to address, what kinds of toggles exist, what the tradeoffs are, how to use toggles in development, including testing considerations, and operational aspects such as configuration, monitoring and release criteria (corporate requirements).

- [Java & Cloud Foundry](release-toggles/cloud-foundry-java.md)
- [Java & Kubernetes](release-toggles/kubernetes-java.md)

### Zero-Downtime Deployment

Imagine you deploy a new version of your application to cloud platform, how can you switch the old version to the new one? Assume "somebody is always awake in the internet" and service interruption is generally unacceptable.

In this module you will learn about the problem that _zero downtime deployment_ helps you to address, the reasoning behind _zero downtime deployment_ and its implementation on cloud platforms.

- [Java & Cloud Foundry](zero-downtime-deployment/cloud-foundry-java.md)
- [Java & Kubernetes](zero-downtime-deployment/kubernetes-java.md)

### Zero-Downtime Database Migration

From time to time, you may find that the database schema you have come up with in the past, does not feel right any more and needs to be adjusted. Having learned Zero Downtime Deployment, you want to migrate the database together with your application upgrade without any outage. But what if your database schema needs to change in an incompatible way, for example, dropping a table or renaming a column?

In this module you will learn the problems mitigated by _zero downtime database migration_, the reasoning behind _zero downtime database migration_ and its implementation on cloud platforms.

- [Java & Cloud Foundry](zero-downtime-db-migration/cloud-foundry-java.md)
- [Java & Kubernetes](zero-downtime-db-migration/kubernetes-java.md)

### Resilience

The microservices architecture allows us to design an application as a collection of small and independent services, each of which is developed and deployed separately. Despite of its agility and flexibility, microservices architecture comes with new challenges. Since each service has to interact with others, there is an ever-present risk of partial failure. For instance, a single VM or container may crash or fail to respond for a short time, or the network connection between services is not reliable.

In this module, you will learn essential resilience patterns that help to mitigate such issues.

- [Java](resilience/java.md)

### Service-to-Service Communication

Microservices each run in their own process and therefore need to implement inter-process-communication in order to exchange data or notify one another. A number of options exist to implement this communication, each with its own set of tradeoffs.

In this module you will learn how to implement inter-process-communication using a RESTful HTTP resource API.

- [Java](service2service/java.md)
- [Node.js](service2service/nodejs.md)

### Distributed Logging

One of the arguments against a distributed system is that it is harder to debug. However, with a good logging infrastructure in place, compiling a full trace of your complete system's behavior is no more difficult than in a monolith system.

In this module you will learn how to use a backing service to collect logs and make APIs use a correlation id to trace a request.

- [Java & Cloud Foundry](distributed-logging/cloud-foundry-java.md)
- [Java & Kubernetes](distributed-logging/kubernetes-java.md)
- [Node.js & Cloud Foundry](distributed-logging/cloud-foundry-nodejs.md)
- [Node.js & Kubernetes](distributed-logging/kubernetes-nodejs.md)
- [Python & Cloud Foundry](distributed-logging/cloud-foundry-python.md)
- [Python & Kubernetes](distributed-logging/kubernetes-python.md)

### Monitoring

In this module you will learn how to create Dynatrace service on BTP and use it to monitor application performance.

- [Java & Cloud Foundry](monitoring/cloud-foundry-java.md)
- [Java & Kubernetes](monitoring/kubernetes-java.md)

### Alerting

When something goes wrong on your application, you may want to get notified in _real-time_. Alerting on cloud platforms allows DevOps teams to respond to any service degradation quickly and automatically. More important, teams can detect failures in early stage in development and avoid broken changes in production.

In this module you will learn how to use alerting service on SAP BTP and send alert notifications based on errors in your application.

- [Java & Cloud Foundry](alerting/cloud-foundry-java.md)
- [Java & Kubernetes](alerting/kubernetes-java.md)
