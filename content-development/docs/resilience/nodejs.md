# Resilience Patterns

<!-- TrackingCookie-->
{% with pagename="resilience-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise you will learn

- How to make your overall service more resilient using Circuit Breaker, a Retry Pattern, and a Rate Limiter.

## 🤔 Wait, but why?

The microservices architecture allows us to design an application as a collection of small and independent services, each of which is developed and deployed separately. Despite of its agility and flexibility, microservices architecture comes with new challenges.

Since each service has to interact with others, there is an ever-present risk of partial failure. For instance, a single VM or container may crash or fail to respond for a short time, or the network connection between services is not reliable.

Therefore, the resiliency of a microservices-based application — i.e., the ability to recover from certain types of failure and remain functional — heavily depends on how well the app handles inter-service communication. Numerous resiliency patterns have emerged to address this challenge. These include timeout, retry, circuit breaker, fail-fast, etc.

## Exercise

In this exercise, you will try out some patterns to make given services more resilient.

<!-- Prerequisites-->
{% with
  beneficial=[
     '[Express](https://expressjs.com)'
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="resilience+decoupling", folder_name="resilience-patterns-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

### 🔍 Introduction

We provide a `bulletin board` application consisting of two services: `bulletinboard-ads` and `bulletinboard-reviews` in the starting point. User can post new ads or review existing ones by accessing the url of the `bulletinboard-ads` service. When an ads is posted, it will be marked green, orange or red based on rating for that user from the `bulletinboard-reviews` service.

The issue we're facing is that there is a hard dependency from ads to reviews, so if there is an issue with `bulletinboard-reviews`, it will also impact `bulletinboard-ads`.

![](./images/scenario.gif)

We are going to mitigate this using resilience patterns.

### 1 - Let's get started

We will now fire up the applications and showcase the issue.

#### 1.1 - Start the Applications

First, we need to start the two service and their databases.

1. For the `bulletinboard-ads` application

    1. Go to the `bulletinboard-ads-nodejs` sub directory.

    1. Then, start the service's database first: `./start-db.sh` (keep the window open!)

    1. After this (in a new window), install the dependencies

    ```shell
    npm install
    ```

    1. Stop and restart the app with the following command (if not running `npm run watch` already)

    ```shell
    npm start
    ```

1. For the `bulletinboard-reviews` application

    1. Go to the `bulletinboard-reviews-nodejs` sub directory.

    1. Then, start the service's database first: `./start-db.sh` (keep the window open!)

    1. After this (in a new window), install the dependencies
    
    ```shell
    npm install
    ```

    1. Stop and restart the app with the following command (if not running `npm run watch` already)

    ```shell
    npm start
    ```

1. When both applications have started, check the logs. They should look similar to the sample code below (the one is for `bulletinboard-ads`, you should see a similar one for `bulletinboard-reviews`):

    ```sh
    [INFO] Done
    {"level":"info","message":"Server is listening on http://localhost:8080","module":"server","timestamp":"2024-10-08T12:12:09.608Z"}
    ```


#### 1.2 - Create an advertisement

Let's have a first look at the application, and create our first advertisement.

1. Go to the [overview page](http://localhost:8080){target=_blank} and to look at the start page.

1. Use the `+` button to add a new advertisement. This should be successful.

1. Check that the ad shows up on the [overview page](http://localhost:8080){target=_blank} afterwards.

#### 1.3 - Let's break things 😈

As mentioned, the ads service has a hard dependency on the reviews service, so let's break it.

1. Stop the `bulletinboard-reviews` service that you started earlier.

1. Now try to open (or reload) the [overview page](http://localhost:8080){target=_blank}.

1. The page should be empty, your advertisement will not appear.

1. Try to create another advertisement, this will fail, too.

In both cases the issue is caused by the dependency between the services.

### 2 - Circuit Breaker

A circuit breaker will help improve the situation. It is similar to a circuit breaker in an electric circuit, that protects your devices. When something is wrong, the circuit breaker opens the circuit, so that no more current flows.

In software, this means that no subsequent calls will be sent to the other service, so that it is given time to recover.

You can fall back to a meaningful "default" value so that your own logic can somehow proceed, a so-called "meaningful degradation of service".

![](./images/circuit_breaker.png)

You are going to implement this now in the `bulletinboard-ads` service - so all the steps below relate to files in `bulletinboard-ads`.

#### 2.1 - Implement the Circuit Breaker

We will be using the [`opossum`](https://www.npmjs.com/package/opossum){target=_blank} library, so make sure to familiarize yourself with the basic API.

1. Install the `opossum` library, including `types`:

    ```sh
    npm install opossum
    npm install -D @types/opossum
    ```

1. Inside `src/lib/client/reviews-client.ts`, copy the method `getAverageRating`, make it `private`, and rename it to `getAverageRatingInternal`
1. Import `CircuitBreaker` from `opossum`
1. Create a new `breaker` class variable of type `CircuitBreaker`
1. Instantiate the `breaker` class variable within the constructor. It should wrap the `getAverageRatingInternal` method.

    !!! hint "Hint"
        You cannot directly pass the method reference, since the class is not instantiated, but there is a trick 😉). Also, use the default options as mentioned in the [documentation](https://www.npmjs.com/package/opossum){target=_blank}.

    ??? example "Need Help?"
        ```typescript
        const options = {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        }
        this.breaker = new CircuitBreaker((contact: string) => this.getAverageRatingInternal(contact), options)
        ```

    !!! example "One CircuitBreaker per function"
        The app is instantiating only one `ReviewsClient` on app startup, therefore the `CircuitBreaker` is also instantiated only once. If you would use several `CircuitBreaker`s per function, e.g. for each function call, there would be no effect, since every individual `CircuitBreaker` would have it's own state.

1. Modify the `getAverageRating`. It should simply call the `breaker.fire` method, passing the `contact`.

    ??? example "Need Help?"
        ```typescript
        return this.breaker.fire(contact).catch((error) => {this.logger.error(error)})
        ```
    
#### 2.2 - Test your solution

1. Start the `bulletinboard-ads` service, but don't start the `bulletinboard-reviews` service (simulating the service is down). 

1. Open the [overview page](http://localhost:8080){target=_blank} in your browser and reload `bulletinboard-ads` page several times quickly.

    In the UI, you should see the color of the contact change to green. The `bulletinboard-reviews` service is now "protected" from subsequent calls, so it has time to recover. The circuit is "open". Looking into the terminal, an error with a message like this should be logged:

    ```log
    Error: Breaker is open
    ```

1. Consider playing with the options in `src/lib/client/review-client.ts`, and start/stop the `bulletinboard-reviews` service in between the process, to understand the configuration better.

#### 2.3 - Add fallback to rating service

**Not bad, but...**

Allowing the service time to recover in case of issues is nice. However, from an end-user's perspective, the situation hasn't improved much. If our circuit breaker is open, it prevents the slow service from further slowing down the dependent service. But, as mentioned, this isn't a substantial improvement. If you visit the details of an ad, you can see the average rating is displayed as `NaN`. This is because the average rating returned from the backend is currently `undefined`.

Let's make it a bit better by adding a fallback to our circuit breaker.

1. Implement the fallback accordingly, you can make it return a default value like 1.0 or 5.0.

    ```typescript
    breaker.fallback(() => <DEFAULT VALUE>);
    ```

    ??? example "Need Help?"
        ```typescript
         this.breaker.fallback(() => 1.0)
        ```

#### 2.4 - Test your solution

1. Stop the `bulletinboard-reviews` service, and open the [overview page](http://localhost:8080){target=_blank}. 

    You will see that the `bulletinboard-ads` page is live, and fallback value is presented immediately (The contact is written in red for a bad rating, the value is present in the detail view). 

1. Play around with different fallback and configuration values, and re-start the `bulletinboard-reviews` during the process, to understand the behavior a bit better.

### 3 - Retry

The retry pattern provides resiliency to a system by allowing recovery from transient issues, such as temporary service outages. This particularly makes sense for asynchronous communication, but not only.

In our concrete scenario, our service to service request might fail. Depending on our requirements, it may be better to simply retry x times instead of using a circuit breaker.

![](./images/retry.png)

#### 3.1 - Implement retry

You are going to implement this now in the `bulletinboard-ads` service - so all the steps below relate to files in `bulletinboard-ads`.

**Make sure** to comment out the changes you did before, i.e. deactivate the already implemented circuit breaker pattern.

We will be using the [`async-retry`](https://www.npmjs.com/package/async-retry){target=_blank} library.

1. Install the `async-retry` library, including `types`:

    ```sh
    npm install async-retry
    npm install -D @types/async-retry
    ```

1. Import `retry` from `async-retry`

1. Similar to the circuit breaker pattern, copy the `getAverageRating` method, make it `private`, and rename it to `getAverageRatingInternal`.

1. Let's modify the `getAverageRating` method again.

    - This time, make it use the `retry` function.
    - Make sure the `getAverageRatingInternal` is `await`ed within the body of the passed callback, so the error handling works properly.

    ??? example "Need Help?"
        ```typescript
        return retry(async () => {
            const averageRating = await this.getAverageRatingInternal(contact)
            return averageRating
        }, { retries: 5 })
        ```

1. Implement the fallback method accordingly, you can make it return something like 1.0 or 5.0.

    !!! hint "Hint"
        The callback function here passed to `retry` accepts 2 parameters. The first one is the `bail` (a function you can invoke to abort the retrying), which we do not need here. The second one, however, is the number of retries. We can utilize this value to implement the fallback mechanism e.g. simply using `if` conditions. Note that the number of retries starts from 1.

    ??? example "Need Help?"
        ```typescript
        return retry(async (bail, numberOfRetries) => {
            if (numberOfRetries > <YOUR_NUMBER>) return <FALLBACK_VALUE>
            // ...
        }, { retries: 5 })
        ```
  
#### 3.2 - Test your solution

1. Start the `bulletinboard-ads` service, but don't start the `bulletinboard-reviews` service (simulating the service is down).

1. Open the [overview page](http://localhost:8080){target=_blank} and reload `bulletinboard-ads` page. It does not fail immediately but try again a bit later.

1. To test the retry mechanism, stop the reviews service and restart it before reaching the max attempts. Adjust the wait duration and the max attempts to give enough time for you to stop and start the reviews service in between retries.

### 4 - Rate Limiter

Rate Limiting is a technique to help your services survive the heavy network traffic and remain high availability and reliability. For examples:

- The `ads` service may get scaled up due to an increasing user base. This increased load, combined with its synchronous communication with the `reviews` service, can overwhelm the `reviews` service.

- A DoS (Denial of Service -> Flooding service with requests) attack could be launched against the `reviews` service.

You can apply rate limiters to the services to control the types of requests you want to limit. Additionally, you can decide how to handle limit surplus, e.g. by building a queue to process them later or by rejecting them with an appropriate response.

![](./images/rate_limiter.png)

#### 4.1 - Implement rate limiter

You are going to implement this now in the `bulletinboard-reviews` service - so all the steps below relate to files in `bulletinboard-reviews`.

**Make sure** to comment out the changes you did before, i.e. deactivate the already implemented circuit breaker and retry pattern.

Use the [`express-rate-limit`](https://www.npmjs.com/package/express-rate-limit){target=_blank} library.

1. Install the `express-rate-limit` library:

    ```sh
    npm install express-rate-limit
    ```

1.  In `src/lib/router/average-rating-router.ts`, import `{ rateLimit }` from `express-rate-limit`.

1. Inside the router function, define a new rate limiter with configuration that one IP can do a maximum 10 requests per 1 minute before returning a 429 (Too Many Requests) status code.

    ??? example "Need Help?"
        ```typescript
        const limiter = rateLimit({
            windowMs: 60 * 1000, // 1 minute
            limit: 10, // Limit each IP to 10 requests per `window` (here, per 1 minute).
        })
        ```

1. Use the limiter as middleware for the GET `/:revieweeEmail` route handler.

    ??? example "Need Help?"
        ```typescript
        router.get('/:revieweeEmail', limiter, async (req, res, next) => { /* ... */ }
        ```


#### 4.2 - Test your solution

1. Start both `bulletinboard-ads` and `bulletinboard-reviews` services. 

1. Open the [overview page](http://localhost:8080){target=_blank} and reload quickly a few times.

    The `bulletinboard-reviews` service has a strict limit on the number of calls it allows. If this limit is exceeded, the `reviews` service will return a `429` error code ("Too many request"). 
    
    If you a fallback is still active in the ads service, the fallback value should be shown for all ads. If you remove the fallback, the `ads` service will show an error when trying to access the `reviews` service:

    ```log
    {"level":"error","message":"Error GET /api/v1/ads - Unexpected token 'T', \"Too many r\"... is not valid JSON","module":"application","timestamp":"2024-10-22T13:28:50.526Z"}
    ```

1. You can test by setting other rate limiter configuration.

### 5 - Stretch Goal

1. Combine Rate Limiter together with the Circuit Breaker and Retry pattern in the `bulletinboard-ads` service.

1. So far we did not add test cases for those new functions. Consider how to test resilience on the unit test level.

### 6 - Reflection

Now, here are a few questions that may help you reflect a bit.

??? info "What's the relation between a circuit breaker and a rate limiter, how are they similar and how are they different?"

    - They are similar in that they can protect services from DoS attacks or other unexpected load peaks.
    - The difference is that the circuit breaker guards the outbound call to another service, while the rate limiter guards the inbound call to the own service.
  
??? info "In what situations are the patterns useful - e.g. only for service-to-service related communication?"

    - The pattern can also be useful for calls to backing services, e.g. some database drivers even have a built-in retry mechanism
    - You could even consider the pattern for the communication between client/browser and server, although in practice that is typically not done, simply for the reason that if there is a general network issue on the user side or even on the entire platform, then having still an acceptable user experience is not feasible. However if you're considering [offline capabilities](https://www.sencha.com/blog/create-web-apps-with-the-capabilities-of-native-apps/){target=blank}, you even get resilience - and scaling like hell - on that end.

??? info "How is resilience impacted by coupling of services?"
    Resilience is highly impacted by coupling of services.

    - If services are more loosely coupled, self-sustained, and communicate asynchronously with one another, they are naturally more resilient.
    - Since services are more self-sustained they need to communicate less.
    - Since they communicate asynchronously, the caller typically is not even interested in the result on the callee side, so a failure on the callee side does not impact the caller.
    - Always aim for decoupling your services as much as you can, cause this gives you not only resilience, but even many more benefits. Have a look at [eventual consistency and async](../decoupling-services/nodejs.md){target=blank} to learn more about it.

??? info "How far should you take the resilience implementation?"

    - Don't implement resilience features everywhere just for the sake of having them. You may end up with "resilience for the resilience" - don't go that far!
    - Sometimes it is possible to mitigate the need for resilience by using simpler techniques, e.g. using batch/bulk instead of single requests, thus lowering the request frequency. Could be a better fit than rate limitation unless there are other reasons for rate limitation.
    - Investments should have a clear business benefit - build resilience where you either already experience problems that cost time and money, or where experiencing them will be so critical even if it happens rarely.
    - Criteria can be: number of failures / error logs from service calls, customer incidents that can be tracked down to failing service calls, or user load and business criticality of a particular service call.

??? info "There are different approaches for the solution - what are the pros and cons?"
    Resilience can be implemented on code or network infrastructure level. For example, some modules in infrastructure can delegate the network calls from your code through a proxy, and the proxy is configured to retry if the call to the target fails. Consider the following aspects when you want to try either solution.

    - If you need dynamic and or business-specific logic for your resilience, e.g. to compose meaningful fallback values, then building that in infrastructure is sometimes not feasible or doesn't make sense from a maintenance perspective - business logic should not leak into infrastructure, especially if the infrastructure is central/shared.
    - On the other hand, business logic and resilience are often separate concerns, so resilience should not obfuscate the business logic - if implementing resilience through infrastructure, this cannot happen as easily as when implementing resilience through code.
    - A compromise can be to put the generic resilience in dedicated packages/modules, even if they are still in code, to encourage re-use and support a clear separation of concerns.

??? info "How to test for resilience?"  

    - In some situations you might consider explicit unit, component or integration tests, however this is often not practical - implementing resilience typically means to enable a service to "deal with unexpected" situations, and in unit, component or integration tests we rather describe expected situations.
    - If you already have load tests, this is a natural fit, check if you can slightly adjust/extend them.
    - Another approach is to leverage approaches like _chaos monkey,_ where you randomly shut down services, databases etc., and verify that the application is still healthy.


<!--
### Further Concepts

Not part of the exercise, we just point people to it...e.g. retry, observability, cache, bulkhead, ...

### Reflection


### Nodejs

## Infrastructure

### Kubernetes

#### How K8s deals with pod/container resilience

#### Istio

### Cloud Foundry
-->

<!-- ## 🙌 Congratulations! Submit your solution.

{% with path_name="nodejs/resilience-patterns", language="Node.js", language_independent = false, branch_name="resilience+decoupling" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %} -->

## 🏁 Summary

Good job!

In this module, you have learned how to make highly dependent services resilient with Circuit Breaker, Retry and Rate Limiter. You also understood the trade-offs and considerations before you implement the concept in your own project.

## 📚 Recommended Reading

- [Martin Fowler: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html){target=blank}
- [InfoWorld: How to build resilient microservices](https://www.infoworld.com/article/3310946/how-to-build-resilient-microservices.html){target=blank}
- [Istio resilience patterns for K8s](https://docs.tetrate.io/istio-distro){target=blank}

## 🔗 Related Topics

- [DevOps & Cloud Native: Concepts 101](https://performancemanager5.successfactors.eu/sf/learning?destUrl=https%3A%2F%2Fsap%2eplateau%2ecom%2Flearning%2Fuser%2Fdeeplink%5fredirect%2ejsp%3FlinkId%3DITEM%5fDETAILS%26componentID%3DDEV%5f00002183%5fWBT%26componentTypeID%3DCOURSE%26revisionDate%3D1669283981000%26fromSF%3DY&company=SAP){target=_blank}
- [Decoupling Services](https://pages.github.tools.sap/cloud-curriculum/materials/all/decoupling-services/nodejs/){target=_blank}

