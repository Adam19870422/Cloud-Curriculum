# Distributed Logging (Kubernetes)

{% with pagename="distributed-logging-k8s-python" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🎯 Learning Objectives

In this module you will learn

- how to set up distributed logging infrastructure
- how to make APIs use a correlation id
- how to trace a request through the logs

## 🧠 Theory

One of the arguments against a distributed system is that it is harder to debug.
However, with a good logging infrastructure in place, compiling a full trace of your complete system's behavior is no more difficult than in a monolith system.

  - General concepts: [slides](../slides/fundamentals){target=_blank} ([with speaker notes](../slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_ewlr7qdc){target=_blank}

## 💻 Exercise
The microservices are almost ready to be deployed, so that you can focus on the distributed logging.

<!-- Prerequisites-->
{% with
  required=[
    ('[Logging Basics](../../logging/python){target=blank}'),
    ('[Kubernetes Basics](../../cloud-platforms/kubernetes-python){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/python.md' %}
{% endwith %}


#### 🚇 Infrastructure
- Access to a Kubernetes Cluster.
  If you don't have a cluster already, see the first steps of the [Kubernetes topic](../../cloud-platforms/kubernetes-java/#0-get-a-cluster){target=_blank} to find out how to get a cluster and configure `kubectl`.


### 🚀 Getting Started

{% with branch_name="distributed-logging-python", folder_name="distributed-logging-k8s-python" %}
{% include 'snippets/clone-import/python.md' %}
{% endwith %}


### 🔍 Code Introduction

We provide two microservices: `greetings` and `users`.
Both expose a simple REST interface.
The `greetings` service calls the `users` service to retrieve the necessary information and then creates a pretty greeting text.

### 0 - Kubernetes Cluster Access
{% include 'snippets/k8s-cluster-access.md' %}

### 1 - Deploy the Services
To get you started quickly we provide the necessary `.yaml`-files in the directory `deployment/apps`.


1. To retrieve Cluster and Project Name run the following command:
    ```shell
    kubectl cluster-info
    ```
    It should print a message similar to the following, with `<SUBDOMAIN>` being replaced :
    ```
    CoreDNS is running at https://api.<SUBDOMAIN>.kyma.ondemand.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
    ```

    ??? error "Getting an error from kubectl?"
        If kubectl is not connected, please see the first exercise of the [Kubernetes topic](../../cloud-platforms/kubernetes-java/#1-accessing-the-cluster){target=_blank} to find out how to get a cluster and configure `kubectl`.

1. Run the shell script `fill_placeholders.sh` with the arguments:
    1. Your c/d/i-number (with the letter being lowercase)
    1. The name of your Subdomain

    Your terminal command should look similar to the following:
    ```shell
    ./fill_placeholders.sh i012345 my-subdomain
    ```

    --8<--- "snippets/shell-script-on-windows.md"

1. Use the provided shell script with your (lowercase) c/d/i-number to create and push docker images for the applications:
    ```shell
    ./push_images.sh <your c/d/i-number>
    ```

1. Run the following command to deploy the apps to your cluster:
    ```shell
    kubectl apply -f deployment/apps
    ```

### 2 - Deploy the Infrastructure for Distributed Logging

We provide a set of yaml-files in the `deployment/efk-stack` folder containing the Kubernetes resources needed for the logging infrastructure.
Deploying those resources will set up EFK (Elasticsearch + Fluentd + Kibana, EFK-Stack) to implement Distributed Logging.
<!-- TODO: insert link for further reading on efk or the distributed logging architecture? -->

!!! warning "Don't try this at home!"
    We are deploying our own EFK stack in this exercise in order to focus on the core topics we want to teach in this module. **Never do this in production**, as this approach has many issues with regard to availability and compliance.
    Use the [BTP Observability Services](https://pages.github.tools.sap/observability/coreservices/){target=_blank} instead.


1. Deploy the EFK-Stack by running:

    ```shell
    kubectl apply -f deployment/efk-stack
    ```

    This will deploy the infrastructure as needed for this exercise.
    All resources will be bound to the namespace `kube-logging`.
    You can view and monitor the deployed resources with:

    ```shell
    kubectl get all --namespace kube-logging
    ```

The pods of the EFK components should be all up and running (it might take a minute or two for them to init and start up).

### 3 - Take a Look at the Logs

Once the pods are ready you can view the Kibana user-interface with your web-browser.
Kibana needs a little configuration before you can explore the logs.
You'll have to create an index pattern to differentiate sources of log events.
This can be done through the graphical interface but we also provide a shell script, which uses Kibana's REST API.

??? info "Index patterns are renamed to data views"
    Index pattern is deprecated from Kibana 8 onwards and has been renamed to Data view. Refer to [this guide](https://www.elastic.co/guide/en/kibana/current/data-views.html){target=_blank} to create a data view through the graphical interface.


1. Open a tunnel from your computer to the Kibana Dashboard running in your cluster by executing
    ```shell
    kubectl port-forward service/kibana 5601 --namespace kube-logging
    ```

    !!! warning "Make sure the tunnel remains open"
        The tunnel you opened above will only remain open as long as you keep the command running, this means the window in which the command was run must remain open. Occasionally the tunnel may be closed by the kubernetes cluster, so if you can no longer reach the Kibana Dashboard in your browser, make sure to check that the tunnel is still open and reopen it if not.

    ??? info "Why open a tunnel if we could create an ingress?"
        Kibana is, by default, unsecured in the version we use, so we don't want to expose it to the internet. Thus we just tunnel into the dashboard for this exercise. In the "real world" this of course would not be necessary.

1. Run the provided shell script to create an index pattern:
    ```shell
    ./create_index_pattern.sh
    ```

1. Open [http://localhost:5601](http://localhost:5601){target=_blank} in your web-browser, you should see the Kibana Dashboard

1. Click on the compass icon in the left menu bar (it is the topmost entry) to open the "Discover" page.

1. Expand the time range and click refresh until you see logs.

1. Add Fields of Interest

    On the left side in Kibanas Discovery page you'll see the **Available Fields**.
    There you can find the `kubernetes.labels.app` which contains the name of the microservice and `log` which is the log message itself.
    Hover over those fields and click **Add** to have them included in the table-view on the right.
    To filter the logs by a specific field value, click on the field and select the value with the magnifier symbol.

### 4 - Generate Some Traffic

1. Run
    ```shell
    kubectl get ingress
    ```

1. Copy the link (`HOSTS` column) and enter it in your web-browser with the following path appended: `/api/v1/greetings/1`
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

1. Build and push the docker images by re-running the provided `push_images.sh` script.

1. Also make sure to delete the affected pods (running the old docker images) using `kubectl delete pod`

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

1. Build and push the docker images by re-running the provided `push_images.sh` script.
1. Also make sure to delete the affected pod (running the old docker image) using `kubectl delete pod`
1. Hit the `greetings` endpoint again to generate some new logs.
1. Check whether both services now have the same correlation-ID for the same "request" in their logs.

### 7 - Reflection

Recollect what you learned and learn about potential issues with the [reflection points](../slides/reflection){target=_blank}


{% include 'snippets/k8s-cleanup.md' %}

## 🙌 Congratulations! Submit your solution.

{% with path_name="python/k8s/distributed-logging", language="Python", branch_name="distributed-logging-python" %}
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
- [BTP Observability Services](https://pages.github.tools.sap/observability/coreservices/){target=_blank}
