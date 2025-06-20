# Decoupling Services

<!-- TrackingCookie-->
{% with pagename="decoupling-services-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this exercise you will learn how to decouple two microservices by leveraging eventual consistency and asynchronous communication.

## 🤔 Wait, but why?
If microservices are tightly coupled, this negatively impacts them in multiple ways. In our scenario we will focus on the aspect of uptime, as both services will be broken if one goes down.

## 💻 Exercise

<!-- Prerequisites-->
<!-- TODO -->
{% with
  beneficial=[
    '[Express](https://expressjs.com)'
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="resilience+decoupling", folder_name="decoupling-services-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

    !!!hint "Monorepo"
        The git repository you are cloning contains two projects: Ads and Reviews.

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

1. For the `bulletinboard-reviews` Application

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

1. When both applications have started, check the logs. They should look similar to the lines below (below is for `bulletinboard-ads`, you should see a similar one for `bulletinboard-reviews`):

    ```sh
    [INFO] Done
    {"level":"info","message":"Server is listening on http://localhost:8080","module":"server","timestamp":"2024-10-08T12:12:09.608Z"}
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

1. The should show an internal server error, your advertisement will not appear.

1. Try to create another advertisement, this will fail, too.

In both cases the issue is caused by the dependency between the services.

### 2 - Eventual Consistency

In this first iteration, we will extend our data structure to include the average ratings from the `bulletinboard-reviews` service in our `bulletinboard-ads` service. This acts like a cache, but the cache will not always be in sync with the data in the `bulletinboard-reviews` service. We will build a very simplistic update mechanism for now, which we will improve later.

#### 2.1 - Persist Average Ratings in ads service

1. Let's add a new field `averageContactRating` to our `Ad` entity. To do so, create a new migration via `npm run db:migrate:create add-contact-rating`.

1. Find the generated file `migrations/<TIMESTAMP>-add-contact-rating.js` and replace its content with the following:

    !!! info "Note: we are defaulting the `averageContactRating` to 0."

    ```javascript
    exports.up = async function (db) {
        await db.runSql(`ALTER TABLE ads ADD COLUMN "averageContactRating" real DEFAULT 0;`);
    };

    exports.down = async function (db) {
        await db.runSql(`ALTER TABLE ads DROP COLUMN "averageContactRating";`);
    };
    ```

1. We will extend the `Ad` schema with a new field `averageContactRating`, which will be updated in the background.
    1. Go to `src/lib/validation/validate.ts`.

    1. Add the optional field `averageContactRating` of type `z.coerce.number().optional()` below the `id` field.

1. When retrieving the `Ads`, we want to read the `averageContactRating` and update it once we get a new value.
    1. Go to `src/lib/storage/postgres-ad-storage.ts`.

    1. Update the SQL statements `READ` and `READ_ALL` to also fetch the `averageContactRating` field. An example for `READ_ALL` is `'SELECT id, title, contact, price, currency, "averageContactRating" FROM ads'`.

        ??? tip "Note the double quotes."
            Surround the `averageContactRating` field name with double quotes to ensure it is treated as a single identifier by the SQL parser. Using double quotes preserves the exact casing and format of the field name as defined in the schema.

    1. Create a new SQL statement `UPDATE_AVERAGE_RATING` to update the rating for a given contact:

        ```typescript
        static UPDATE_AVERAGE_RATING = 'UPDATE ads SET "averageContactRating" = $2 WHERE contact = $1'
        ```

    1. Create a new `async` method, called `updateAverageRating` which has two arguments: `contact` and `averageContactRating` of type `string` and `number` respectively. This method should use the `UPDATE_AVERAGE_RATING` statement to update the rating for a given contact.

1. Then, let's use the new field inside our router.
    1. Go to `src/lib/router/ad-router.ts`.

    1. Change the function name `getAverageContactRating` to `updateAverageContactRating`. This function should continue to fetch the average rating from `reviewsClient`. However, instead of returning the fetched value, now it needs to persist the average rating into the database.

    1. Wrap the code inside a `try-catch` block, as it will run asynchronous. Provide a useful log message in the error case.

    1. Remove the `averageContactRating` property in the `getTransientProps` function. Based on the previous adjustments, this now already part of the `Ad` and will be defaulted by the database.

1. Call the `updateAverageContactRating` function to update the rating in the background whenever we read it. You can do so in the `getTransientProps` function.

    !!! info "This should be a "fire and forget" operation, so DO NOT `await` the function."

#### 2.2 - Test your solution:

Let's check if our changes works.

1. Restart your `bulletinboard-ads` service if it did not auto update itself.

1. Stop the `bulletinboard-reviews` service again.

1. Try viewing and creating ads, the `bulletinboard-ads` service should still work.
    
#### 2.3 - Not bad, but...

When the `bulletinboard-reviews` is available, the rating data will be updated in the background, however it will always "lag by 1 request":

- If you create a new review, and then refresh/reload the [overview page](http://localhost:8080){target=_blank} once, this will trigger your `updateAverageContactRating` function in the background
- However, you will see the rating change on the next refresh/reload

This update mechanism is probably a bit too poor, so let's try to make it better.

### 3 - Asynchronous Communication

Updating when `ads` service reads from the `reviews` service will always make it "lag by 1 request".

We will try to create an asynchronous solution that handles updates like a grownup:

- Let the `reviews` service notify `ads` whenever there's a change in the reviews data.
- In the `ads` service, then we'll always update all the records of the contact.

#### 3.1 - Adjust ads service

Let's create an endpoint that will update the ratings for all advertisements with a given contact. This will be used by the `reviews` service to notify the `ads` service about rating updates.

1. Remove the `updateAverageContactRating` call within the `getTransientProps` function.
1. In the `src/lib/router/ad-router.ts`, create a new `POST` route handler on path `/updateRatings/:contact` which
    1. extracts the `contact` from url parameter and uses it to get the average rating via `reviewsClient.getAverageRating(contact)`
    1. uses the `storage.updateAverageRating` method you created before to update all advertisements with the given `contact`
    1. wraps the code inside a `try-catch` block, as it will run asynchronous. Provide a useful log message in the error case.

    !!! hint "You have something similar already"
        Use the `updateAverageContactRating` function you created in the "Eventual Consistency" part as a rough template w.r.t calling the reviewsServiceClient, etc.

#### 3.2 - Adjust reviews service

Whenever a new review comes in, the `reviews` service should call the new HTTP API of the `ads` service to let it update related rating information.

1. Go to `src/lib/router/review-router.ts`.

1. Create a new `async` function `notifyAdService`, which
    1. accepts a review as argument
    1. constructs the target URL
    1. calls the ads services `/updateRatings/:contact` endpoint

    ??? example "Need Help?"
        ```typescript
        try {
            const url = `http://localhost:8080/api/v1/ads/updateRatings/${review.revieweeEmail}`
            await fetch(url, {
            method: 'POST'
        })
        } catch (error) {
            console.error(error)
        }
        ```

    !!! warning "Hard coded target URL and fetch function "
        We have hard coded the target URL to the `bulletinboard-ads` service above, that's not a clean solution of course. You could fix this by getting the target URL from the environment/configuration if you like. The fetch function could be passed in as dependency.

1. Call the `notifyAdService` function right after a new rating is created.

    ??? info "This should be a "fire and forget" operation, so DO NOT `await` the function."
        The users are only trying to submit a review, so it's a "fire and forget" operation from a `bulletinboard-reviews` perspective. Make it like a background / async operation.

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
    We won't give you the exact solution, but recommend you to use RabbitMQ. You can run it locally with ease using a [Docker image](https://www.rabbitmq.com/download.html), and you can check [the AMQP library](https://www.npmjs.com/package/amqplib) (Scroll to the `Promises` section) for sending and consuming messages in Node.js/Typescript.

1. Think about, or even try variations
    1. what if you stored the individual rating records, rather than the average rating, on the ads side? What are pros and cons?
    1. could you already send all information along in your message queue notification, so that the `bulletinboard-ads` service doesn't need to still query the `bulletinboard-reviews` service for the "details"? What are pros and cons?

1. TDD .. What?! We did not use a `TDD` approach in this exercise, we didn't even think about tests at all! Go ahead and run `npm test`. There will be quite some failing tests. Fix them.

<!--
### Reflection
-->

<!-- ## 🙌 Congratulations! Submit your solution.

{% with path_name="nodejs/decoupling-services", language="Node.js", language_independent = false, branch_name="resilience+decoupling" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %} -->

## 🏁 Summary

Good job!

In this module, you have learned how to decouple highly dependent services with asynchronous communication and eventual consistency. You also understood the trade-offs and considerations before you implement the concept in your own project.

## 📚 Recommended Reading

- [Martin Fowler: Downsides of microservices](https://martinfowler.com/articles/microservice-trade-offs.html){target=blank}
- [Martin Fowler: Bounded Context](https://martinfowler.com/bliki/BoundedContext.html){target=blank}
- [Eventual consistency and async](https://en.wikipedia.org/wiki/Eventual_consistency){target=blank}

## 🔗 Related Topics

- [DevOps & Cloud Native: Concepts 101](https://performancemanager5.successfactors.eu/sf/learning?destUrl=https%3A%2F%2Fsap%2eplateau%2ecom%2Flearning%2Fuser%2Fdeeplink%5fredirect%2ejsp%3FlinkId%3DITEM%5fDETAILS%26componentID%3DDEV%5f00002183%5fWBT%26componentTypeID%3DCOURSE%26revisionDate%3D1669283981000%26fromSF%3DY&company=SAP){target=_blank}
- [Resilience](https://pages.github.tools.sap/cloud-curriculum/materials/all/resilience/nodejs/){target=_blank}

