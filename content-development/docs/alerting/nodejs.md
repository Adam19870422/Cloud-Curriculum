# Alerting ({% if deployment=="CF" %}Cloud Foundry{% elif deployment=="K8S" %}Kubernetes{% endif %})

<!-- TrackingCookie-->
<!-- {% if deployment=="CF" %}
{% with pagename="alerting-cf-nodejs" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}
{% elif deployment=="K8S" %}
{% with pagename="alerting-k8s-nodejs" %}
{% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}
{% endif %} -->

## 🎯 Learning Objectives

In this module you will learn

- how to use alerting service on SAP BTP
- how to send alert notifications based on errors in your application

##  🤔 Wait, but why?

When something goes wrong on your application, you may want to get notified in _real-time_. Alerting on cloud platforms allows DevOps teams to respond to any service degradation quickly and automatically. More important, teams can detect failures in early stage in development and avoid broken changes in production.

## 💻 Exercise

In this exercise you will deploy two microservices to SAP BTP, and trigger automatic email notification in case of a specific exception. 

<!-- Prerequisites-->
{% if deployment=="CF" %}
{% with
  tools=[
  ],
  required=[
    ('[Cloud Foundry Basics](../../cloud-platforms/cloud-foundry-nodejs){target=_blank}')
  ],
  beneficial=[
    ('[Logging Basics](../../logging/nodejs){target=_blank}'),
    ('[Distributed Logging](../../distributed-logging/cloud-foundry-nodejs){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}

{% elif deployment=="K8S" %}
{% with
  tools=[
  ],
  required=[
    ('[Kubernetes Basics](../../cloud-platforms/kubernetes-nodejs){target=_blank}')
  ],
  beneficial=[
    ('[Logging Basics](../../logging/nodejs){target=_blank}'),
    ('[Distributed Logging](../../distributed-logging/kubernetes-nodejs){target=_blank}')
  ]
%}
{% include 'snippets/prerequisites/nodejs.md' %}
{% endwith %}
{% endif %}

#### 🚇 Infrastructure

{% if deployment=="CF" %}
- A [Cloud Foundry Space](https://pages.github.tools.sap/cloud-curriculum/materials/all/cf-spaces/spaces-nodejs/){target=_blank}
- [CF client V8](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}
{% elif deployment=="K8S" %}
- Access to a Kubernetes Cluster

    If you don't have a cluster already, see the first step of the [Kubernetes topic](../../cloud-platforms/kubernetes-nodejs/#1-kubernetes-cluster-access){target=_blank} to find out how to get a cluster and configure `kubectl`.
{% endif %}

### 🚀 Getting Started

{% if deployment=="CF" %}
{% with branch_name="alerting-ts", folder_name="alerting-cf-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}
{% elif deployment=="K8S" %}
{% with branch_name="alerting-ts", folder_name="alerting-k8s-nodejs" %}
{% include 'snippets/clone-import/nodejs.md' %}
{% endwith %}
{% endif %}

1. Finally, install the required dependencies by running the following command within the `greetings` **and** `users` directories:

    ```sh
    npm install
    ```

### 🔍 Introduction

We provide two microservices: `greetings` and `users`. Both expose a simple REST interface. The `greetings` service calls the `users` service to retrieve the necessary information.

### 1 - Deploy the apps

{% if deployment=="CF" %}

1. Make sure your Cloud Foundry CLI client is logged in and targeting the correct space.
1. In the root directory open the file `vars.yaml` and replace the `<YOUR C/D/I-NUMBER>` placeholder with your actual (uppercase - the same name as the space) C/D/I-number in with the letter being lowercase.

    If you are not using a Cloud Foundry trial account you will also need to adapt the value for `domain` in the `vars.yaml`.

1. Run the shell script `cf_push_apps.sh` to build and push the apps
    
    --8<--- "snippets/shell-script-on-windows.md"

    ??? info "Command Walkthrough"
        The shell script runs the npm build script to compile both app's typescript to their dist folders. Afterwards a cf push with a variable substitutions file (vars-file) is executed.

        The values given in the file `vars.yaml` will be used to replace the placeholders (denoted by doubled parentheses) in the file `manifest.yaml`. For more details, see the [Cloud Foundry Documentation](https://docs.cloudfoundry.org/devguide/deploy-apps/manifest-attributes.html#variable-substitution){target=_blank}.


{% elif deployment=="K8S" %}

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
        If kubectl is not connected, please see the first exercise of the [Kubernetes topic](../../cloud-platforms/kubernetes-nodejs/#1-accessing-the-cluster){target=_blank} to find out how to get a cluster and configure `kubectl`.

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

{% endif %}

### 2 - Generate Some Traffic

{% if deployment=="CF" %}
1. Determine the route of the `greetings` app with `cf apps`.
1. Open it in a browser with the path `/api/v1/greetings/1` appended, i.e. `https://greetings-<YOUR C/D/I-NUMBER>.cfapps.eu12.hana.ondemand.com/api/v1/greetings/1`

{% elif deployment=="K8S" %}
1. Run the command:
    ```shell
    kubectl get ingress
    ```

1. Copy the link (`HOSTS` column) and enter it in your web-browser with the following path appended: `/api/v1/greetings/1`, i.e. `https://app.<SUBDOMAIN>.kyma.ondemand.com/api/v1/greetings/1`
{% endif %}

    You should see a nice greeting for **Jane Doe**.

1. In the greetings tab, navigate to the following path: `/api/v1/greetings/99`.

    You should see a greeting for **User**.

1. As the `users` service can not find an user for id 99, it logged some messages in the backend. Find out the related logs.

{% if deployment=="CF" %}
    ??? example "Need help?"
        Use command `cf logs users --recent`. You can find some logs emitted by the `users` service.
        ```log
        2024-11-03T19:05:22.23+0100 [APP/PROC/WEB/0] OUT {"logger":"nodejs-logger","type":"log","component_type":"application","component_id":"90d53e23-b290-497d-87c8-cad101bf631c","component_name":"users","component_instance":0,"source_instance":0,"layer":"[NODEJS]","organization_name":"dev-learning-trial","organization_id":"359db1cb-0e89-46fb-961c-c0365d95844b","space_name":"D068017","space_id":"c8200374-07ba-497f-8f27-e2c0cbb7f3ad","container_id":"10.0.73.20","msg":"No user found for id 99","level":"error","written_at":"2024-11-03T18:05:22.232Z","written_ts":1730657122232977700}
        ```

{% elif deployment=="K8S" %}
    ??? example "Need help?"
        Use command `kubectl logs <users pod>`. You can find some logs emitted by the `users` service.
        ```log
        {"msg":"No user found for id 99","level":"error","written_ts":"1716769717746116716","w3c_traceparent":"00-9a74213238850bfc625e30821b76b216-ec4fa13656bcb228-01","type":"log","correlation_id":"ff915cb6-c6ac-4373-a353-75e5c3e13ea2","written_at":"2024-05-27T00:28:37.746Z"}
        ```

{% endif %}

### 3 - Create alerting service

This "user not found" issue normally shouldn't occur. If it still occurs in the future, you, the team that owns the service, would like to get notified by email.

The [SAP BTP Alert Notification](https://help.sap.com/docs/alert-notification/sap-alert-notification-for-sap-btp/what-is-sap-alert-notification-service-for-sap-btp){target=blank} service can help send notifications through various channels, such as email, Microsoft Teams or Slack. You will configure the service to send an email based on a custom event type `app error`. 

***Note:*** The `Alert Notification` service has already been entitled in our trial account. But if you are using your own BTP account, please check [service setup](https://help.sap.com/docs/alert-notification/sap-alert-notification-for-sap-btp/initial-setup){target=blank} before you continue.

1. Create an `Alert Notification` service which contains:

    1. an action of type `EMAIL`;
    1. a condition that triggers when `eventType EQUALS app-error`;
    1. a subscription that binds the `condition` to the `action`.

{% if deployment=="CF" %}    
    ??? example "Need help?"
        You can create the service by using either [cockpit](https://canary.cockpit.btp.int.sap/cockpit/#/globalaccount/cloudCurriculum/subaccount/5545bfd2-7df6-4a02-99a9-ecfa153f11cd/spaces){target=blank} or the command line `cf create-service ...`.
        
        For example:

        ```sh
        cf create-service alert-notification free alerts -c alert-config.json
        ```

        Here's an example of a config json file you can use to create the service:

        ```json
        {
            "configuration": {        
                "actions": [{
                    "type": "EMAIL",
                    "name": "mail",
                    "state": "ENABLED",
                    "properties": {
                        "destination": <your email>,
                        "useHtml": "false",
                        "subjectTemplate": "💩 D'oh! {subject}",
                        "payloadTemplate": "something went wrong. {body}"
                    }
                }],
                "conditions": [{
                    "name": "on-app-error",
                    "mandatory": false,
                    "propertyKey": "eventType",
                    "predicate": "EQUALS",
                    "propertyValue": "app-error",
                    "labels": [],
                    "description": ""
                }],
                "subscriptions": [{
                    "name": "test",
                    "conditions": [ "on-app-error" ],
                    "actions": [ "mail" ],
                    "state": "ENABLED"
                }]
            }
        }       
        ```

{% elif deployment=="K8S" %}
    ??? example "Need help?"
        You can create the BTP service in Kyma environment by using either [Kyma dashboard](https://help.sap.com/docs/btp/sap-business-technology-platform/using-sap-btp-services-in-kyma-environment){target=blank} or the command line `kubectl`. For example:

        ```sh
        kubectl apply -f deployment/alerting-service/1_service-instance.yaml
        ```

        Here's an example of the yaml file you can use to create the service. Change the placeholder `<your email>` to your SAP email address.

        ```yaml
        apiVersion: services.cloud.sap.com/v1
        kind: ServiceInstance
        metadata:
          name: alert-service
          namespace: default
        spec:
          serviceOfferingName: alert-notification
          servicePlanName: standard
          externalName: alert-service
          parameters:
            configuration:
              actions:
                - type: EMAIL
                  name: mail
                  state: ENABLED
                  properties:
                    destination: <your email>
                    useHtml: "false"
                    subjectTemplate: 💩 D'oh! {subject}
                    payloadTemplate: something went wrong. {body}
              conditions:
                - name: on-app-error
                  mandatory: false
                  propertyKey: eventType
                  predicate: EQUALS
                  propertyValue: app-error
                  labels: []
                  description: ""
              subscriptions:
                - name: test
                  conditions:
                    - on-app-error
                  actions:
                    - mail
                  state: ENABLED
        ```
{% endif %}

1. Make sure you confirm the email action:

    You will receive an email after the previous step. Use the link inside to confirm that you'd like to activate the "send email" action.

{% if deployment=="CF" %}
1. Bind the application:

    Add another entry in your `manifest.yml` file to bind the `users` app to the `alerts` service.

    ??? example "Need help?"

        Add an entry `alerts` in the `services` list:

        ```yaml
            applications:
            - name: users
              ...
              services:
              - alerts
            - name: greetings
              ...
        ```

{% elif deployment=="K8S" %}
1. Bind the alert service:

    BTP Service Binding provides access details for an existing service instance. You need to create a binding to consume the alert server later in your application.

    ```sh
        kubectl apply -f deployment/alerting-service/2_service-binding.yaml
    ```

    ??? example "Need help?"

        Here's an example of the yaml file you can use to create the service binding.

        ```yaml
        apiVersion: services.cloud.sap.com/v1
        kind: ServiceBinding
        metadata:
          name: alert-binding
          namespace: default
        spec:
          serviceInstanceName: alert-service
          externalName: alert-binding
          secretName: alert-secret
        ```

{% endif %}

{% if deployment=="CF" %}
1. Run the following command to deploy both applications.

    ```shell
    ./cf_push_apps.sh
    ```

1. Inspect the environment.

    Use `cf env` to inspect the environment of `users`.
    
    !!! tip "Verify you have access to the alerting-service credentials."
        We will use a library to read these values from the environment. We are specifically interested in `client_id`, `client_secret`, `oauth_url` and `url` that are necessary to setup connection with our alert service.

    ![](./images/cf_evn_alerts.png)

{% elif deployment=="K8S" %}
1. Inspect the secret.

    The service binding creates a Kubernetes secret which stores the details of the alert service. Run the following command to see the credentials.

    ```sh
    kubectl get secret alert-secret -o yaml
    ```

    We are interested in `client_id`, `client_secret`, `oauth_url` and `url` (they are base64 encoded). We will use them in the next step.

1. Inject the secret variables as environment variables.

    ??? example "Need help?"
        Go to `deployment/apps/2_users.yaml` and extend the `env` section. Read the values from the provided secret.
        ```yaml
        env:
        - name: "PORT"
          value: "8081"
        - name: ALERTING_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: alert-secret
              key: client_id
        - name: ALERTING_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: alert-secret
              key: client_secret
        - name: ALERTING_OAUTH_URL
          valueFrom:
            secretKeyRef:
              name: alert-secret
              key: oauth_url
        - name: ALERTING_URL
          valueFrom:
            secretKeyRef:
              name: alert-secret
              key: url
        ```

{% endif %}

### 4 - Send email notification

Returning to the application, when a "user not found" error is detected, you should send an event of type `app error` to the alert notification service. This service will then send an email notification to inform the team.

Let's work on the `users` application.

1. Create and export a class called `AlertingService` within a new file `src/lib/alerting-service.ts`. For now, it should have a single public `async` method called `alert` which has no arguments and returns nothing.

1. Go to the `src/lib/application.ts`.

    1. Inject `AlertingService` as the 3rd argument to the (default export) `application` function.

    1. Update the generic `errorHandler`. Call the `alertService.alert` function if the error is of instance `NotFoundError`.

        ??? example "Need help?"
            We don't await the call to the `alertingService` - do you know why?
            
            ```typescript
            export default (log: RootLogger, usersStorage: UsersStorage, alertingService: AlertingService) => { // ... }

            // ...

            const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
                if (error instanceof NotFoundError) {
                    alertingService.alert()
                }
                // ..
            }
            ```

1. In `src/lib/server.ts`, pass in a new instance of `AlertingService` to the application function.

    Do the same in the `test/users.test.ts` - here, pass in an empty object as stub.

    ??? example "Need help?"
        ```typescript
        // server.ts
        const alertingService = new AlertingService()
        const app = application(log, usersStorage, alertingService)

        // users.test.ts
        const alertingService = {} as unknown as AlertingService
        const app = application(logStub, usersStorage, alertingService)
        ```

1. Update the `AlertingService`.

    !!! tip "Remember the properties from {% if deployment=="CF" %}`cf env`{% elif deployment=="K8S" %}`Kubernetes secret`{% endif %} in the previous step? You will need them now."

    {% if deployment=="CF" %}
    1. Create / Go to the constructor.

    1. Use the (already installed) `cfenv` library to get the credentials from the Cloud Foundry environment.

        ??? example "Need help?"
            **Note:** To improve testability of this class, a cleaner solution would be to inject the credentials in the constructor and read them on application startup. This is not in the scope of this exercise.

            ```typescript
            private alertingUrl: string
            private alertingOAuthUrl: string
            private alertingAuth: string

            constructor() {
                const appEnv = cfenv.getAppEnv()
                const credentials = appEnv.getServiceCreds('alerts')
                if (!credentials || !credentials.url || !credentials.oauth_url || !credentials.client_id || !credentials.client_secret) {
                    throw new Error('Alerts credentials not found')
                }
                this.alertingUrl = credentials.url
                this.alertingOAuthUrl = credentials.oauth_url
                this.alertingAuth = `Basic ${Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64')}`
            }
            ```
    {% elif deployment=="K8S" %}
    1. Read the credentials within the constructor using the environment variables you injected before. Make sure the environment variables have the same (correct) name as in the deployment file.

        ??? example "Need help?"
            Note: To improve testability of this class, a cleaner solution would be to inject the credentials in the constructor and read them on application startup. This is not in the scope of this exercise.
            ```typescript
            private alertingUrl: string
            private alertingOAuthUrl: string
            private alertingAuth: string

            constructor() {
                const alerting_url = process.env.ALERTING_URL
                const alerting_oauth_url = process.env.ALERTING_OAUTH_URL
                const alerting_client_id = process.env.ALERTING_CLIENT_ID
                const alerting_client_secret = process.env.ALERTING_CLIENT_SECRET

                if (!(alerting_url && alerting_oauth_url && alerting_client_id && alerting_client_secret)) {
                    throw new Error('Alerts credentials misconfigured')
                }

                this.alertingUrl = alerting_url
                this.alertingOAuthUrl = alerting_oauth_url
                this.alertingAuth = `Basic ${Buffer.from(`${alerting_client_id}:${alerting_client_secret}`).toString('base64')}`
            }
            ```

    {% endif %}

    1. Retrieve access token from the OAuth server.

        To send request to the alert notification server, you must retrieve an access token from the OAuth server at first.

        The request to retrieve token is something like this:

        ```http
        POST <oauth_url> HTTP/1.1
        Authorization: <client_id>:<client_secret>
        Content-Type: application/x-www-form-urlencoded
        ```

        ??? example "Need help?"
            ```typescript
            private async oAuthToken(): Promise<string> {
                const response = await fetch(this.alertingOAuthUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': this.alertingAuth,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                })
                if (!response.ok) {
                    throw new Error(`Failed auth: ${response.statusText}`)
                }
                const { access_token } = await response.json() as { access_token: string }
                return access_token
            }
            ```

    1. Send an event to the alert notification server.

        You will send the event to the so-called ["Producer API"](https://api.sap.com/api/cf_producer_api/path/postResourceEvent){target=blank} endpoint. Once the event is received by the alert notification server, it is delivered to each channel you have already defined - email, Slack, webhook, etc.

        Make sure you use the same `event type` as that you defined in the `condition` in your alert notification service (="app-error").

        The request is something like this:

        ```http
        POST https://clm-sl-ans-canary-ans-service-api.cfapps.eu12.hana.ondemand.com/cf/producer/v1/resource-events HTTP/1.1
        Authorization: Bearer <token-from-previous-step>
        Content-Type: application/json

        {
            "eventType": "app-error",
            "eventTimestamp": 1706782395,
            "resource": {
                "resourceName": "users",
                "resourceType": "app",
                "tags": {
                    "env": "prod"
                }
            },
            "severity": "FATAL",
            "category": "ALERT",
            "subject": "User not found - potential attack",
            "body": "Someone tried to access a user that does not exist.",
            "tags": {}
        }  
        ```

        ??? example "Need help?"
            Putting it together, you can place the code in the `catch` block.

            ```typescript
            async alert(): Promise<void> {
                const token = await this.oAuthToken()
                const response = await fetch(`${this.alertingUrl}/cf/producer/v1/resource-events`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        eventType: "app-error",
                        eventTimestamp: Math.floor(Date.now() / 1000),
                        resource: {
                            resourceName: "users",
                            resourceType: "app",
                            tags: {
                                env: "prod"
                            }
                        },
                        severity: "FATAL",
                        category: "ALERT",
                        subject: "User not found - potential attack",
                        body: "Someone tried to access a user that does not exist.",
                        tags: {}
                    })
                })
                if (!(response.status === 202)) {
                    throw new Error(`Failed to alert: ${response.statusText}`)
                }
            }
            ```

{% if deployment=="CF" %}
1. Build adn deploy the new applications

    ```sh
    ./cf_push_apps.sh
    ```

{% elif deployment=="K8S" %}
1. Build the docker image and deploy to Kubernetes.

    ```shell
    kubectl apply -f deployment/apps
    ```

    ```shell
    ./push_images.sh <your c/d/i-number>
    ```

{% endif %}

1. Try it out.

    Provoke the error - if everything is working as expected, you'll almost instantly get an email with a funny subject 😁.

### 5 - 🦄 Stretch Goals

1. Built-in alerts

    The SAP Alert Notification Service also allows to send notifications based on system events.

    Have a look at their [documentation](https://help.sap.com/docs/alert-notification/sap-alert-notification-for-sap-btp/application-events){target=_blank} and try e.g. to create an alert that will send a notification when your app gets stopped or crashed.

2. Availability Service

    Use SAP [Availability Service](https://pages.github.tools.sap/observability/availabilityservice/){target=_blank} to monitor the availability of your app.

    Have a look at the [tutorials](https://wiki.one.int.sap/wiki/display/hcpka/Tutorials){target=_blank} and try to define an evaluation that will send a notification if your app is not available.

### 6 - Reflection

In this example, we send our alert from a specific error in our code. This is just for demonstrating how it works. In "real life", you should implement such an alerting mechanism in a central place and not spread it all over. 

If you have an own logger or a wrapper around the logger you are using, this could be a potential place.

Other good places are high-level `catch` handlers of your application, e.g. a central handler that will catch all errors that are not caught on the lower levels, and be translated into an `HTTP 500 Internal Server Error` response.

Additionally, consider: the particular error we caught and alerted for, is somewhat a "client error" (from the `users` service point-of-view), so whether this is something to send an alert on, is at least worth a team discussion.

Last not least, a meaningful / better alternative can also be to define the alerting based on application logs outside the application and in the log monitoring tool, e.g. Kibana - if the monitoring tool you are using has the capability. This has the advantage that you can define the alerting strategy cross-services, and for "tricky" things like `HTTP 4xx Client Error` logs, or logs of the category `WARNING`, you can define more sophisticated strategies such as "send an alert only when a certain threshold is exceeded for this log category".

{% if deployment=="CF" %}
{% include 'snippets/cf-cleanup.md' %}
{% elif deployment=="K8S" %}
{% include 'snippets/k8s-cleanup.md' %}
{% endif %}

## 🙌 Congratulations! Submit your solution.

<!-- {% if deployment=="CF" %}
{% with path_name="nodejs/cf/alerting", language="Node.js", language_independent = false, branch_name="alerting" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %}

{% elif deployment=="K8S" %}
{% with path_name="nodejs/k8s/alerting", language="Node.js", language_independent = false, branch_name="alerting" %}
{% include 'snippets/self-learner/commit-push-exercise-independent.md' %}
{% endwith %}
{% endif %} -->

## 🏁 Summary

Good job! In this exercise you

- [x] setup alerting service on SAP BTP
- [x] sent an alert based on application errors


## 📚 Recommended Reading

- [Cloud Scale Readiness in Action with Site Reliability Engineering](https://video.sap.com/media/t/1_yl1n2frx){target=_blank}
- [SAP BTP Observability](https://pages.github.tools.sap/observability/){target=_blank}

## 🔗 Related Topics

- Monitoring: [Cloud Foundry](https://pages.github.tools.sap/cloud-curriculum/materials/all/monitoring/cloud-foundry-nodejs/){target=_blank} | [Kubernetes](https://pages.github.tools.sap/cloud-curriculum/materials/all/monitoring/kubernetes-nodejs/){target=_blank}
