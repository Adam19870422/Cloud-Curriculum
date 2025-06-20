# Distributed Logging (Cloud Foundry)

<!-- TrackingCookie-->
{% with pagename="distributed-logging-cf-python" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}


## 🎯 Learning Objectives

In this module you will learn

- how to use a backing service to collect logs
- how to make APIs use a correlation id
- how to trace a request

## 🧠 Theory

One of the arguments against a distributed system is that it is harder to debug.
However, with a good logging infrastructure in place, compiling a full trace of your complete system's behavior is no more difficult than in a monolith system.

  - General concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ewlr7qdc){target=_blank}


## 💻 Exercise
The microservices are almost ready to be deployed, so that you can focus on the distributed logging.

<!-- Prerequisites-->
{% with
  tools=[
      ('A [Cloud Foundry Space](../../cf-spaces/spaces-python/){target=blank}'),
      ('[**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}')
  ],
  required=[
    ('[Logging Basics](../../logging/python){target=blank}'),
    ('[Cloud Foundry Basics](../../cloud-platforms/cloud-foundry-python){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}


### 🚀 Getting Started

{% with branch_name="distributed-logging-python", folder_name="distributed-logging-cf-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}


### 🔍 Code Introduction

We provide two microservices: `greetings` and `users`.
Both expose a simple REST interface.
The `greetings` service calls the `users` service to retrieve the necessary information.


### 1 - Deploy the Services

1. Make sure your Cloud Foundry CLI client is logged in and targeting the correct space.
1. In the root directory open the file `vars.yaml` and replace the `<YOUR C/D/I-NUMBER>` placeholder with your actual C/D/I-number in with the letter being lowercase.

    If you are not using a Cloud Foundry trial account you will also need to adapt the value for `domain` in the `vars.yaml`.

1. Run the following command to deploy both applications
    ```shell
    cf push --vars-file vars.yaml
    ```


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
        ```yaml
        applications:
          - name: users
            memory: 80MB
            command: python3 src/server.py
            buildpacks:
              - https://github.com/cloudfoundry/python-buildpack
            path: users
            routes:
              - route: users-((identifier)).((domain))
            services:
              - app-logs
          - name: greetings
            memory: 80MB
            command: python3 src/server.py
            buildpacks:
              - https://github.com/cloudfoundry/python-buildpack
            path: greetings
            routes:
              - route: greetings-((identifier)).((domain))
            env:
              USERS_URL: https://users-((identifier)).((domain))/api/v1/users
            services:
              - app-logs
        ```


1. Run `cf push --vars-file vars.yaml` again to bind the logging service.

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

#### 3.2 Discovery

1. Click on the menu icon in the top left menu and then on Discover to open the "Discover" page.
1. Expand the time range and click refresh until you see logs.

    It seems the service already captured many logs, just from pushing the apps.
    You may see logs from other applications, unrelated to the training, running on the landscape (even from other orgs and spaces).

1. Add fields of interest

    On the left side in Kibanas Discovery page you'll see the **Available Fields**.
    There you can find the `component_name` which contains the name of the microservice and `msg` which is the log message itself.
    You can hover over those fields and click **Add** to have them included in the table-view on the right.
    To filter the logs by a specific field value, click on the field and select the value with the magnifier symbol.

### 4 - Generate Some Traffic

1. Determine the route of the `greetings` app with `cf apps`.
1. Open it in a browser with the following path appended: `/api/v1/greetings/1`
    You should see a nice greeting for **Jane**.

1. Back in the Kibana tab, refresh to see the newly generated logs.
    It may take a few seconds for the logs to appear.
    Just keep refreshing until you see them and make sure that you have selected an appropriate timeframe.

1. In the greetings tab, navigate to the following path: `/api/v1/greetings/99`.
    You should see a greeting for **User**.

1. Find the warning log with the message:

    `Response from users service was not ok: https://users-((identifier)).((domain))/api/v1/users/99 - {\"status\":404,\"statusText\":\"Not Found\"}`

    (with `((identifier))` and `((domain))` matching your actual vars).

    If you look at the code that emits that log message you will see that it's supposed to contain more information, such as the response's status.
    Some configuration is needed, for it to be included.

### 5 - Add Metadata

The log messages can be further enhanced with metadata which can be extracted from HTTP headers.

The logging library `sap-cf-logging` supports request instrumentation which does exactly that (see the [documentation](https://github.com/SAP/cf-python-logging-support){target=_blank}).

1. Remove the default Python logging configuration, and initialize the library to the `application.py` files in **both** the `users` and the `greetings` service:

    ```python
    app = Flask(__name__)
    flask_logging.init(app, logger_level)
    logger = logging.getLogger('logger_name')
    ```

    In the request logging context there will be additional fields (e.g. correlation_id, request_id, etc.) attached to the log message.

1. Push the updated applications by running the following command:
    ```shell
    cf push --vars-file vars.yaml
    ```

1. Hit the `greetings` endpoint again to generate some new logs.

1. Search the logs for new fields and check the values of the field named `correlation_id`.

1. Add Correlation-ID to the table

    Amongst the **Available Fields** you should be able to find the `correlation_id`.
    Add it to your table-view to make it easier to correlate each log using the correlation-ID.
    You can also filter by a specific correlation-ID to trace down the logs of a specific request.

You probably noticed that the logs from the two services have different correlation-IDs even though one gets called from the other.
A little more work is needed to make that correlation visible in the logs...

??? info "What is the Correlation-ID?"

    The `correlation-id` uniquely identifies each user-request.
    When a user-request is delegated from one microservice to another, the `correlation-id` is written as an HTTP-header.
    The next microservice then picks up the `correlation-id` from the HTTP-header and includes it in every log message that is written in the context of this user-request.
    When a microservice receives a request without `correlation-id` (e.g. initial user interaction) it creates a new one.

### 6 - Transmit the Correlation-ID

1. Add http headers to the request from `greetings` to `users` in the file `greetings/src/service/user_service.py`:

    ```python
    headers = {'X-CorrelationID': f"{cf_logging.FRAMEWORK.context.get_correlation_id()}"}
    response = requests.get(url, headers=headers, timeout=5)
    ```

    It ensures that all outgoing requests have the Correlation-ID header set.

1. Push the updated applications by running the following command:
    ```shell
    cf push --vars-file vars.yaml
    ```

1. Hit the `greetings` endpoint again to generate some new logs.
1. Check whether both services now have the same correlation-ID for the same "request" in their logs.

### 7 - Reflection

Recollect what you learned and learn about potential issues with the [reflection points](../slides/reflection){target=_blank}

{% include 'snippets/cf-cleanup.md' %}

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/cf/distributed-logging", language="Python", branch_name="distributed-logging-python" %}
{% include 'snippets/self-learner/commit-push-exercise.md' %}
{% endwith %}


## 🏁 Summary

Good job!
In this exercise you

- [x] set up distributed logging infrastructure
- [x] added metadata to your logs
- [x] set up the handling of correlation IDs

## 📚 Recommended Reading
- [Distributed Logging Architecture in the Container Era](https://blog.treasuredata.com/blog/2016/08/03/distributed-logging-architecture-in-the-container-era/){target=_blank}
- [Good Practices for Distributed Logging](https://www.javacodegeeks.com/2017/07/distributed-logging-architecture-microservices.html){target=_blank}

## 🔗 Related Topics
- [Python Logging Support for Cloud Foundry Library](https://github.com/SAP/cf-python-logging-support/tree/master){target=_blank}

