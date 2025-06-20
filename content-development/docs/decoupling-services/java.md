# Decoupling Services

<!-- TrackingCookie-->
{% with pagename="decoupling-services-java" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise you will learn how to decouple two microservices by leveraging eventual consistency and asynchronous communication.

## 🤔 Wait, but why?
If microservices are tightly coupled, this negatively impacts them in multiple ways. In our scenario we will focus on the aspect of uptime, as both services will be broken if one goes down.

## 💻 Exercise

<!-- Prerequisites-->
{% with
  beneficial=[
    '[Spring](https://spring.io/){target=_blank}'
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="resilience+decoupling", folder_name="decoupling-services-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

    !!!hint "Monorepo"
        The git repository you are cloning contains two projects ads and reviews. Import/Open them in your IDE separately, especially when using IntelliJ.

### 🔍 Introduction

We provide a `bulletin board` application consisting of 2 services: `bulletinboard-ads` and `bulletinboard-reviews` in the starting point.

The issue we're facing is that there is a hard dependency from ads to reviews, so if there is an issue with `bulletinboard-reviews`, it will also impact `bulletinboard-ads`.

We are going to decouple the services using eventual consistency and asynchronous communication.

- If you want to get to know more about the scenario, [take a look at this page](https://pages.github.tools.sap/cloud-curriculum/boot-restart/scenario/){target=_blank}
- If you want to get to know more about the problem & solution, [take a look at this page](https://pages.github.tools.sap/cloud-curriculum/boot-restart/challenges/decouple-services/){target=_blank}

### 1 - Let's get started

We will now fire up the applications and showcase the issue.

#### 1.1 - Start the Applications

First, we need to start the two service and their databases.

1. For the `bulletinboard-ads` Application

    1. Go to the `bulletinboard-ads-java` sub directory.

    1. Then, start the service's database first: `./start-db.sh` (keep the window open!)

    1. After this, run the application

        {% with main_class="BulletinboardAdsApplication" %}
        {% filter indent(4) %}
        {% include 'snippets/run-application/run-java.md' %}
        {% endfilter %}
        {% endwith %}

1. For the `bulletinboard-reviews` Application

    1. Go to the `bulletinboard-reviews-java` sub directory.

    1. Then, start the service's database first: `./start-db.sh` (keep the window open!)

    1. After this, run the application

        {% with main_class="BulletinboardReviewsApplication" %}
        {% filter indent(4) %}
        {% include 'snippets/run-application/run-java.md' %}
        {% endfilter %}
        {% endwith %}

1. When both applications have started, check the logs. They should look similar to the lines below (below is for `bulletinboard-ads`, you should see a similar one for `bulletinboard-reviews`):

    ```logtalk
    2020-06-17 10:48:13.461 INFO 31472 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
    2020-06-17 10:48:13.474 INFO 31472 --- [main] .l.BulletinboardAdsApplication : Started BulletinboardAdsApplication in 2.031 seconds (JVM running for 2.415)
    ```

#### 1.2 - Create an advertisement
Let's have a first look at the application, and create our first advertisement.

1. Go to [http://localhost:8080](http://localhost:8080){target=_blank} and to look at the start page.

1. Use the `+` button to add a new advertisement. This should be successful.

1. Check that the ad shows up on the [overview page](http://localhost:8080){target=_blank} afterwards.

#### 1.3 - Let's break things 😈
As mentioned, the ads service has a hard dependency on the reviews service, so let's break it.

1. Stop the `bulletinboard-reviews` service that you started earlier

1. Now try to open (or reload) the [overview page](http://localhost:8080){target=_blank}.

1. The page should be empty, your advertisement will not appear.

1. Try to create another advertisement, this will fail, too.

In both cases the issue is caused by the dependency between the services.

### 2 - Eventual Consistency

In this first iteration, we will extend our data structure to include the average ratings from the `bulletinboard-reviews` service in our `bulletinboard-ads` service. This acts like a cache, but the cache will not always be in sync with the data in the `bulletinboard-reviews` service. We will build a very simplistic update mechanism for now, which we will improve later.

#### 2.1 - Persist Average Ratings in ads service

1. In the class `com.sap.bulletinboard.ads.models.Advertisement`, add a new field called `contactRating` of type `#!java Double` and create a getter and a setter for it.

1. In the method `AdvertisementController.entityToDto`, use the value from the `ad` to set the `averageContactRating` of the `dto`.

    Keep the block that reads from the remote service for now, we'll move it elsewhere in the next step.

1. Extract the block that reads from the other service using the `reviewsServiceClient`, to a new method called `updateRating`, which takes an `#!java Advertisement` as a parameter.

1. Extend the `updateRating` method, so it will set the received `averageRating` to the `contactRating` field of the `#!java Advertisement`, that was passed as method parameter. Make sure you persist this updated advertisement at the end of the method!

1. Call the `updateRating` method to update the rating in the background whenever we read it.

    This should be a "fire and forget" operation, so use `java.util.concurrent.Executors` to achieve this.

    ??? example "Need Help?"
        
        Add the following line at the end of the `entityToDto` function.

        ```java
            Executors.newSingleThreadExecutor().submit(() -> updateRating(ad));
        ```

#### 2.2 - Test your solution:

Let's check if our changes works.

1. Restart your `bulletinboard-ads` service if it did not auto update itself.

1. Stop the `bulletinboard-reviews` service again.

1. Try viewing and creating ads, the `bulletinboard-ads` service should still work.
    
#### 2.3 - Not bad, but...

When the `bulletinboard-reviews` is available, the rating data will be updated in the background, however it will always "lag by 1 request":

- If you create a new review, and then refresh/reload the [overview page](http://localhost:8080){target=_blank} once, this will trigger your `updateAverageContactRating` method in the background
- However, you will see the rating change on the next refresh/reload

This update mechanism is probably a bit too poor, so let's try to make it better.

### 3 - Asynchronous Communication

Updating when `ads` service reads from the `reviews` service will always make it "lag by 1 request".

We will try to create an asynchronous solution that handles updates like a grownup:

- Let the `reviews` service notify `ads` whenever there's a change in the reviews data.
- In the `ads` service, then we'll always update all the records of the contact.

#### 3.1 - Adjust ads service

Let's create a repository method and an endpoint that will update the ratings for all advertisements with a given contact. This is the endpoint that the review service will be calling to notify ads about updates

1. Add a new interface method called `updateRatings` to the `AdvertisementRepository` using the snippet below

    ```java
    @Modifying
    @Transactional
    @Query("UPDATE Advertisement a SET a.contactRating = ?2 WHERE a.contact = ?1")
    void updateRatings(String contact, Double averageRating);
    ```

1. Create a new `POST` endpoint method called `updateRatings` in the `AdvertisementController` which
    1. Listens on the path `/updateRatings/{contact}`
    1. Uses `#!java @PathVariable` to assign the path variable to a `contact` parameter of type `#!java String`
    1. Calls `reviewsServiceClient.getAverageRating(contact)`
    1. Uses the `updateRatings` repository method you created above to update all advertisements with the given `contact`

    !!!hint "You have something similar already"
        Use the `updateRating` method you created in the "Eventual Consistency" part as a rough template w.r.t calling the reviewsServiceClient, default values etc.

#### 3.2 - Adjust reviews service

Whenever a new review comes in, the `reviews` service should call the new HTTP API of the `ads` service to notify it to update related rating information.

Adjust the `appendReview` method of the `BulletinboardReviewController.` of the **bulletinboard-reviews** service to

1. Construct the target URL
1. Call the ads services `updateRatings` endpoint

    Make sure it's a "fire and forget" operation from a `bulletinboard-reviews` perspective, as its users are only trying to submit a review. This is a background / async operation!

    ??? example "Need Help?"
        You could insert this code block right after the invocation of `repository.save(review)`.

        ```java
            String url = "http://localhost:8080/api/v1/ads/updateRatings/" + review.getId().getRevieweeEmail();
            Executors.newSingleThreadExecutor().submit(() -> new RestTemplate().postForLocation(url, null));
        ```

        !!! note "RestTemplate vs WebClient"
            <!-- TODO Below note would not be needed if we already added the dependency to reactive / WebClient to the pom.xml -->
            We're using `RestTemplate` here, which is typically done for sync/blocking calls, and just wrap it in an Executor to move it to the background. For async/non-blocking HTTP calls, actually `WebClient` is the cleaner / more suitable solution, however this would require another Maven dependency and we want to keep the number of steps small.

        !!! warning "Hard coded target URL"
            We have hard coded the target URL to the `bulletinboard-ads` service above, that's not a clean solution of course. You could fix this by getting the target URL from the environment/configuration if you like.

#### 3.3 - Test your solution:

Now let's test your updated solution.

1. Try to browse [the ads overview page](http://localhost:8080){target=_blank} while the `bulletinboard-reviews` service is down - everything should be fine.
1. Start the `reviews` service and make a new review, the rating information should already change on the next page reload and no longer "lag 1 behind".


<!--
<Don't get it>
The call to "update on read" in the `entityToDto` function is now not necessary any longer. But you may ask yourself: is it still worth keeping - maybe for some sort of "auto healing" function?

Furthermore, if you still kept the old `updateRating` method which only updated a single entry, this should now also be obsolete and can be removed.
<Don't get it>
-->
### 🦄 Stretch Goals

1. Try using a message queue instead of the point-to-point communication between the services. This will help to decouple even a bit more.
    We won't give you the exact solution, but recommend you to use RabbitMQ. You can run it locally with ease using a [Docker image](https://www.rabbitmq.com/download.html), and you can check [this tutorial](https://www.rabbitmq.com/tutorials/tutorial-one-java.html) for sending and consuming messages in Java.

1. Think about, or even try variations
    1. what if you stored the individual rating records, rather than the average rating, on the ads side? What are pros and cons?
    1. could you already send all information along in your message queue notification, so that the `bulletinboard-ads` service doesn't need to still query the `bulletinboard-reviews` service for the "details"? What are pros and cons?

<!--
### Reflection
-->

## 🙌 Congratulations! Submit your solution.

{% with path_name="java/decoupling-services", language="Java", language_independent = false, branch_name="resilience+decoupling" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %}

## 🏁 Summary

Good job!

In this module, you have learned how to decouple highly dependent services with asynchronous communication and eventual consistency. You also understood the trade-offs and considerations before you implement the concept in your own project.

## 📚 Recommended Reading

- [Martin Fowler: Downsides of microservices](https://martinfowler.com/articles/microservice-trade-offs.html){target=blank}
- [Martin Fowler: Bounded Context](https://martinfowler.com/bliki/BoundedContext.html){target=blank}
- [Eventual consistency and async](https://en.wikipedia.org/wiki/Eventual_consistency){target=blank}

## 🔗 Related Topics

- [DevOps & Cloud Native: Concepts 101](https://performancemanager5.successfactors.eu/sf/learning?destUrl=https%3A%2F%2Fsap%2eplateau%2ecom%2Flearning%2Fuser%2Fdeeplink%5fredirect%2ejsp%3FlinkId%3DITEM%5fDETAILS%26componentID%3DDEV%5f00002183%5fWBT%26componentTypeID%3DCOURSE%26revisionDate%3D1669283981000%26fromSF%3DY&company=SAP){target=_blank}
- [Resilience](https://pages.github.tools.sap/cloud-curriculum/materials/all/resilience/java/){target=_blank}

