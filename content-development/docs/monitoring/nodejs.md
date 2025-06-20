# Monitoring (Dynatrace on BTP)

<!-- TrackingCookie-->
<!-- {% if deployment=="CF" %}
{% with pagename="monitoring-cf-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% elif deployment=="K8S" %}
{% with pagename="monitoring-k8s-nodejs" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

{% endif %} -->

## 🎯 Learning Objectives

In this module you will learn

- how to create Dynatrace service on BTP
- how to use Dynatrace to monitor application performance

## 💻 Exercise

The microservices are almost ready to be deployed, so that you can focus on the performance issue.

<!-- Prerequisites-->
{% if deployment=="CF" %}
{% with
  tools=[
  ],
  beneficial=[
    ('[Express](https://expressjs.com)'),
    ('[HTTP REST](https://pages.github.tools.sap/cloud-curriculum/materials/all/http-rest/nodejs/){target=blank}'),
    ('[Cloud Foundry Basics](../../cloud-platforms/cloud-foundry-nodejs){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

{% elif deployment=="K8S" %}
{% with
  tools=[
    ('[CF client V8](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}')
  ],
  beneficial=[
    ('[Express](https://expressjs.com)'),
    ('[HTTP REST](https://pages.github.tools.sap/cloud-curriculum/materials/all/http-rest/nodejs/){target=blank}'),
    ('[Kubernetes Basics](../../cloud-platforms/kubernetes-nodejs/){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}
{% endif %}

#### 🚇 Infrastructure

{% if deployment=="CF" %}
- A [Cloud Foundry Space](https://pages.github.tools.sap/cloud-curriculum/materials/all/cf-spaces/spaces-nodejs/){target=blank}
- [CF client V8](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}
{% elif deployment=="K8S" %}
- Access to a Kubernetes Cluster

    If you don't have a cluster already, see the first step of the [Kubernetes topic](../../cloud-platforms/kubernetes-nodejs/#1-kubernetes-cluster-access){target=_blank} to find out how to get a cluster and configure `kubectl`.
{% endif %}

### 🚀 Getting Started

{% if deployment=="CF" %}

{% with branch_name="monitoring-ts", folder_name="monitoring-cf-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% elif deployment=="K8S" %}

{% with branch_name="monitoring-ts", folder_name="monitoring-k8s-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}

{% endif %}

### 🔍 Introduction

We provide a `bulletin board` application consisting of two services: `bulletinboard-ads` and `bulletinboard-reviews` in the starting point. User can post new ads or review existing ones by accessing the url of the `bulletinboard-ads` service. When an ads is posted, it will be marked green, orange or red based on rating for that user from the `bulletinboard-reviews` service.

You are going to monitor the performance of these two services.

### 1 - Let's get going

You will start by deploying the application to {% if deployment=="CF" %}BTP Cloud Foundry{% elif deployment=="K8S" %}Kubernetes{% endif %} and showcase the use case.

#### 1.1 - Deploy the application

{% if deployment=="CF" %}
1. For the `bulletinboard-ads` service

    1. Go to the `bulletinboard-ads-nodejs` sub directory.

    1. Make sure your Cloud Foundry CLI client is logged in and targeting the correct space.

    1. Open the the `manifest.yml`, and replace `<YOUR c/d/i-number>` with your actual c/d/i-number (with the letter in lowercase) for the route and `REVIEWS_HOST`.

    1. Create database service in Cloud Foundry (database creation may take some time, you can use `cf services` to check the status).

        ```shell
        cf create-service postgresql-db development postgres-bulletinboard-ads
        ```

    1. Build and push the application.

        ```shell
        npm run build
        cf push
        ```

1. For the `bulletinboard-reviews` service

    1. Go to the `bulletinboard-reviews-nodejs` sub directory.

    1. Open the the `manifest.yml`, and replace `<YOUR c/d/i-number>` with your actual c/d/i-number (with the letter in lowercase) for the route.

    1. Create database service in Cloud Foundry (database creation may take some time, you can use `cf services` to check the status).

        ```shell
        cf create-service postgresql-db development postgres-bulletinboard-reviews
        ```

    1. Build and push the application.

        ```shell
        npm run build
        cf push
        ```

1. Use `cf apps` to check the status of applications.

    You will see both of ads and reviews have been started.

1. Navigate to the route you specified in the ads `manifest.yml` (`bulletinboard-ads-<YOUR c/d/i-number>.cfapps.eu12.hana.ondemand.com`) in your browser, for example `https://bulletinboard-ads-d123456.cfapps.eu12.hana.ondemand.com`.

    You will see the home page of the application.

{% elif deployment=="K8S" %}
We provide a docker image registry at `cc-ms-k8s-training.common.repositories.cloud.sap`, which you can use to store your docker images for this exercise. A registry is needed, because the Kubernetes cluster cannot (and should not) pull images from your machine. To prevent overriding images pushed by other participants, we ask you to put your D/C/I number into the image name in the following instructions.

We also provide Kubernetes deployment YAML files for both databases and applications. You can find them in the `.k8s` directory in each service.

1. For the `bulletinboard-ads` service

    1. Go to the `bulletinboard-ads-nodejs` sub directory.

    1. Notice the `Dockerfile` in the root directory of the project. Build the docker image with the following command:

        ```shell
        docker build --platform linux/amd64 -t cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1 .
        ```

        !!! warning "Insert your D/C/I number, Apple Silicon, and the build path"
            1. Replace `<your D/C/I number>` with your real D/C/I number in the above command.
            All letters in a tag must be lowercase!
            1. Don't forget the `.` at the end of the command - this tells docker to build the image based on the `Dockerfile` in the current folder. You can also specify a `Dockerfile` with a different name or in other directories [using the `-f` option](https://docs.docker.com/engine/reference/commandline/build/#file){target=_blank}
            1. The option `--platform linux/amd64` is required on Macs with Apple Silicon to make sure the image works on the remote `linux/amd64`-based Kubernetes nodes. The option is redundant for regular, `amd64` based architectures.

    1. Log in to the Docker repository with following command:

        ```shell
        docker login -u "claude" -p "cmVmdGtuOjAxOjE3NzgyMjI4ODU6c2d5bGhzak9oNGRZQzRyN1JZVUx0UExwVTBO" cc-ms-k8s-training.common.repositories.cloud.sap
        ```

    1. Push the built image to the registry with the following command (with your D/C/I number inserted):

        ```shell
        docker push cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1
        ```
    
    1. Deploy the database to Kubernetes with the following commands:

        ```shell
        kubectl apply -f .k8s/1_docker-registry.yml
        kubectl apply -f .k8s/2_bulletinboard-ads-db.yml
        ```

    1. Modify the file `.k8s/3_bulletinboard-ads.yml` and replace `image` with the one you pushed in the previous step, for example: `cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v1`. Also replace `<SUBDOMAIN>` with the value from the [Infrastructure](#infrastructure) step.

    1. Deploy the application to kubernetes with the following command:

        ```shell
        kubectl apply -f .k8s/3_bulletinboard-ads.yml
        ```

    1. Check the deployment status by `kubectl get pod,deployment,service,apirule`

1. For the `bulletinboard-reviews` service

    1. Go to the `bulletinboard-reviews-nodejs` sub directory.

    1. Notice the `Dockerfile` in the root directory of the project. Build the docker image with the following command:

        ```shell
        docker build --platform linux/amd64 -t cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-reviews-<your D/C/I number>:v1 .
        ```

    1. Push the built image to the registry with the following command (with your D/C/I number inserted):

        ```shell
        docker push cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-reviews-<your D/C/I number>:v1
        ```
    
    1. Deploy the database to Kubernetes with the following commands:

        ```shell
        kubectl apply -f .k8s/1_docker-registry.yml
        kubectl apply -f .k8s/2_bulletinboard-reviews-db.yml
        ```

    1. Modify the file `.k8s/3_bulletinboard-reviews.yml` and replace `image` with the one you pushed in the previous step, for example: `cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-reviews-<your D/C/I number>:v1`. Also replace `<SUBDOMAIN>` with the value from the [Infrastructure](#infrastructure) step.

    1. Deploy the application to kubernetes with the following command:

        ```shell
        kubectl apply -f .k8s/3_bulletinboard-reviews.yml
        ```

    1. Check the deployment status by `kubectl get pod,deployment,service,apirule`

1. Navigate to the host you specified for APIRule in ads service (`ads.<SUBDOMAIN>.kyma.ondemand.com`) in your web browser, for example `https://ads.<SUBDOMAIN>.kyma.ondemand.com` (replace `<SUBDOMAIN>`).

    You will see the home page of the application.
{% endif %}

#### 1.2 - Create an advertisement

Let's have a first look at the application, and create our first advertisement.

1. Use the `+` button at the bottom right corner.

1. Input some information by yourself and click the `Save` button.

1. Verify that the advertisement shows up on the home page afterwards.

### 2 - Create Dynatrace service

SAP BTP provides the [Dynatrace service](https://pages.github.tools.sap/apm/about/){target=_blank} which supports full-stack, AI-powered monitoring for your application. With Dynatrace, you are able to see what is happening in your application, database, network or anything else that is part of your infrastructure.

#### 2.1 - Request the profile  

Dynatrace instances are connected with the `SAP Cloud Access Manager` (CAM) and Single-Sign On. You have to request some profiles designed for the exercise at first.

1. Go to the [CAM tool](https://spc.ondemand.com/sap/bc/webdynpro/a1sspc/cam_wd_central#){target=_blank}.
1. Click on the menu `Request Profile`.
1. Search for keyword "dynatrace learning".
1. Request the profiles of `Dynatrace Learning Admin` and `Dynatrace Learning User`. When asked for the reason you can specify "learning".

Your request will be approved by the owner of the profiles.

#### 2.2 - Create the service

You can use either SAP BTP [Cockpit](https://canary.cockpit.btp.int.sap/cockpit/#/globalaccount/cloudCurriculum/subaccount/5545bfd2-7df6-4a02-99a9-ecfa153f11cd/spaces){target=_blank} or Cloud Foundry CLI to create your instance. {% if deployment=="K8S" %}This is also true if you are working with Kubernetes.{% endif %}

??? info "Dynatrace Environment Configuration"
    Dynatrace service uses a JSON file to prepare its environment. Here is a template of the minimal version of the JSON:

    ```json
    {
      "environment_name": "<Your Environment Name>",
      "roles": {
        "admin": {
          "cam_profiles": [
            "<Your Admin CAM Profile>"
          ]
        },
        "sensitive_data_manager": {
          "cam_profiles": [
            "<Your Sensitive Data CAM Profile>"
          ]
        },
        "user": {
          "cam_profiles": [
            "<Your User CAM Profile>"
          ]
        }
      }
    }
    ```

    In this file:

    - `environment_name`: (Mandatory) The name of your new Dynatrace environment. It can be a maximum of 16 characters and can only consist of uppercase letters and digits.
    - `permission_assignments`: (Optional) An array of permission assignment objects that consist of the name of the CAM Profile and the Dynatrace privileges to be assigned.
        - `name`: (Mandatory) CAM Profile name to attach privileges of this Dynatrace environment to.
        - `roles`: (Mandatory) Dynatrace privileges to assign to this CAM Profile. Available roles: `admin`, `user`, `log_analytics`, `view_sensitive`, `configure_sensitive`.

    A full list of supported JSON values for environment configuration can be found in the documentation for [Environment Configuration](https://pages.github.tools.sap/apm/docs/environment/config){target=_blank}.

{% if deployment=="K8S" %}
Make sure your Cloud Foundry CLI client is logged in and targeting the correct space.
{% endif %}

Use Cloud Foundry CLI `cf create-service ... -c <config>` to create your instance. Supply 3 permission assignments in the configuration that match the CAM profiles.

??? example "Need help?"
    Run the command to create service:
    ```sh
    cf create-service dynatrace environment dynatrace-service -c dt-config.json
    ```
    Here is a template for the json config.
    ```json 
    {
      "environment_name": "BBADS<your-user-id>",
      "roles": {
        "admin": {
          "cam_profiles": [
            "Dynatrace Learning Admin"
          ]
        },
        "sensitive_data_manager": {
          "cam_profiles": [
            "Dynatrace Learning Sensitive"
          ]
        },
        "user": {
          "cam_profiles": [
            "Dynatrace Learning User"
          ]
        }
      }
    }
    ```

#### 2.3 - Access the dashboard

1. Run command `cf service dynatrace-service` to get the information of the service.

1. Notice the property `dashboard url` and copy the value of it. It takes the form like `https://canary.eu12.apm.services.cloud.sap/e/<envid>`.

1. Open the url in your browser.

    !!!Error "Attention!"
        BTP may take up to 2 hours to enable the access to Dynatrace UI. If you're not able to access your Dynatrace environment after 2 hours, refer to the section `Unable to access dynatrace environment` in the [errors help page](https://pages.github.tools.sap/apm/setup/self-service/errors/){target=_blank}.

        Take a break from this step 😄

{% if deployment=="K8S" %}
#### 2.4 - Configure Dynatrace on Kubernetes

Dynatrace provides support for monitoring both the Kubernetes cluster itself and the workloads running on the cluster. By deploying [Dynatrace Operator](https://github.com/Dynatrace/dynatrace-operator){target=_blank}, the status of your application and additional Kubernetes metrics can be collected and routed to built-in dashboards in Dynatrace.

There are different ways to deploy Dynatrace on Kubernetes. Here you are going to use **cloud-native full-stack injection**. You can refer to [SAP APM Service](https://pages.github.tools.sap/apm/docs/installation/kubernetes/){target=_blank} for more details.

1. Create a new namespace on Kubernetes:

    ```shell
    kubectl create namespace dynatrace
    ```

1. Install Dynatrace Operator and CSI driver.

    ```shell
    kubectl apply -f https://github.com/Dynatrace/dynatrace-operator/releases/download/v0.14.2/kubernetes.yaml
    kubectl apply -f https://github.com/Dynatrace/dynatrace-operator/releases/download/v0.14.2/kubernetes-csi.yaml
    ```

1. Wait for Dynatrace Operator components to finish initialization.

    ```shell
    kubectl -n dynatrace wait pod --for=condition=ready --selector=app.kubernetes.io/name=dynatrace-operator,app.kubernetes.io/component=webhook --timeout=300s
    ```

1. Open Dynatrace UI in your browser; go to **Manage > Access tokens > Generate new token** and create two tokens. Copy the value of the tokens which is needed in the next step.

    1. One token with the name `apiToken` and the template `Kubernetes: Dynatrace Operator`
    1. One token with the name `dataIngestToken` and the scopes `Ingest metrics` and `Ingest OpenTelemetry traces`

1. Create a Kubernetes Secret named `dynakube` to hold your tokens.

    ```shell
    kubectl -n dynatrace create secret generic dynakube --from-literal="apiToken=<API_TOKEN>" --from-literal="dataIngestToken=<DATA_INGEST_TOKEN>" --from-literal="apiurl=<DT_ENVIRIONMENT_API_URL>"
    ```

    The `<DT_ENVIRIONMENT_API_URL>` takes the form of `https://canary.eu12.apm.services.cloud.sap/e/<envid>/api` (replace `<envid>` with your own value).

1. Download a pre-configured DynaKube custom resource sample and save as `dynakube.yaml` locally.

    ```shell
    curl -o dynakube.yaml https://raw.githubusercontent.com/Dynatrace/dynatrace-operator/v0.14.2/assets/samples/cloudNativeFullStack.yaml
    ```

1. Open the file `dynakube.yaml` and edi the following properties:

    1. Set `.spec.apiUrl` to `<DT_ENVIRIONMENT_API_URL>`, for example: `https://canary.eu12.apm.services.cloud.sap/e/<envid>/api`.
    1. Set `.spec.tokens` to `dynakube` which is the Secret name you created in the previous step.
    1. Set `.metadata.name` to `my-dynakube` or any name you prefer.

1. Apply the DynaKube custom resource

    ```shell
    kubectl apply -f dynakube.yaml
    ```

1. Verify the DynaKube custom resource is running

    ```shell
    kubectl get dynakube my-dynakube -n dynatrace
    ```

After the `DynaKube` custom resource is deployed, the Kubernetes cluster will be listed below **Dynatrace UI > Infrastructure Observability > Kubernetes**.

{% endif %}

### 3 - Monitor your application

Dynatrace service is now created. You can use it to monitor the `bulletin board` application.

#### 3.1 - Connect Dynatrace to the application

{% if deployment=="CF" %}

1. Bind dynatrace service to both `ads` and `reviews` of `bulletin board` on Cloud Foundry.

    ??? example "Need help?"
        You can use command `cf bind-service`, for example:
        ```sh 
        cf bind-service bulletinboard-ads dynatrace-service
        ```
        Bind dynatrace service to `bulletinboard-reviews` as well.

1. Restage the applications after binding.

{% elif deployment=="K8S" %}

Dynatrace has the capability to monitor the processes running in Pods. But since you have installed Dynatrace on Kubernetes **after** you deployed the `bulletin board` application, you may have to restart the `bulletin board` application to enable the code level visibility. You can do it by simply deleting the running Pods, and Kubernetes will automatically restart them.

1. Delete all running Pods of `ads` and `reviews` of `bulletin board`.

1. Wait till Kubernetes restarts them and the status is `Running` again.

    ??? info "How does Dynatrace monitor the application running on Kubernetes"
        Dynatrace will inject an agent as an [Init Container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/){target=_blank} to each Pod. The agent will collect the information of your application containers and send to the dashboard. You can check the init containers by running the command: `kubectl describe pod <your_pod>`.

{% endif %}

#### 3.2 - Visit the dashboard

1. Go to Dynatrace UI.

1. Click menu `Favorites` > `Dashboards`; select `4 Golden Signals`.

    ??? Info "4 Golden Signals"
        Defined by Google, SRE’s Golden Signals are four key metrics used to monitor the health of your service and underlying systems.

        - Latency: the time it takes to serve a request
        - Traffic: the number of requests per second across the network
        - Errors: the number of requests that fail
        - Saturation: the load on your network and servers

#### 3.3 - Generate some traffic

You may notice the dashboard contains no data. That is because the bulletin board application has no user interaction after connecting to Dynatrace.

1. Visit the ads application in your browser, for example {% if deployment=="CF" %}`https://bulletinboard-ads-<YOUR c/d/i-number>.cfapps.eu12.hana.ondemand.com`{% elif deployment=="K8S" %}`https://ads.<SUBDOMAIN>.kyma.ondemand.com`{% endif %}.

1. Add several new advertisements.

1. Visit `4 Golden Signals` dashboard again.

    You may see some data coming in after a short while. Remember to select a proper time frame on the top right corner to make the data more visible.

### 4 - Find the bottleneck

When you add more advertisements, you may notice the application gradually becomes slower in response. Let us dig into details and find the bottleneck.

1. In the Dynatrace dashboard, select the menu `Application Observability` -> `Services`.

1. Notice the `Response time median`/`slowest 10%` for the each services.

    You may find the response time median/slowest 10% for `bulletinboard-ads` is extremely high which is on the scale of second. While others are on the scale of millisecond.

1. Click the `actions` menu (`...`) to `bulletinboard-ads`.

1. Select `Method hotspots`.

    In this page you will find how the service is responding to the request by its call hierarchy and each method's contribution to the total response time.

1. Select `Hotspots` tab.

    Notice the function `fib` contributes almost all the time during code execution.

### 5 - Fix the issue

1. Go to the `src/lib/router/ad-router.ts` in the `bulletinboard-ads-nodejs` application.

    Notice the `fib`  function was added just on the purpose of showing simulating a performance issue.

    Remove it from code base!

{% if deployment=="CF" %}
1. Build and push the application.

    ```shell
    npm run build
    cf push
    ```
{% elif deployment=="K8S" %}
1. Re-build the docker image and update the deployment.

    ```shell
    docker build --platform linux/amd64 -t cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v2 .
    docker push cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v2
    kubectl set image deployments/bulletinboard-ads app=cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-ads-<your D/C/I number>:v2
    ```
{% endif %}

1. Reload the ads application in your browser and create some new advertisements.

1. Go to Dynatrace dashboard and check if the performance is getting better.

## 🙌 Congratulations! Submit your solution.

<!-- {% if deployment=="CF" %}
{% with path_name="nodejs/cf/monitoring", language="Node.js", language_independent = false, branch_name="monitoring" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %}

{% elif deployment=="K8S" %}
{% with path_name="nodejs/k8s/monitoring", language="Node.js", language_independent = false, branch_name="monitoring" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %}
{% endif %} -->

## 🏁 Summary

Good job!

In this exercise you

- [x] install Dynatrace service on cloud platform
- [x] connect your application to Dynatrace
- [x] monitor the application performance

## 📚 Recommended Reading

- [SAP APM (Dynatrace) Service](https://pages.github.tools.sap/apm/about/){target=_blank}
- [SAP BTP Observability](https://pages.github.tools.sap/observability/){target=_blank}

## 🔗 Related Topics

- Alerting: [Cloud Foundry](https://pages.github.tools.sap/cloud-curriculum/materials/all/alerting/cloud-foundry-nodejs/){target=_blank} | [Kubernetes](https://pages.github.tools.sap/cloud-curriculum/materials/all/alerting/kubernetes-nodejs/){target=_blank}

