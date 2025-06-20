# Security Scans

## 🎯 Learning Objectives

In this module you will learn 
- what different kinds of security scans exist
- how to create a project on Black Duck
- how to trigger a Black Duck scan, and how to include in the CD pipeline

## 💻 Exercise
The microservices are almost ready to be deployed, so that you can focus on the alerting.

<!-- Prerequisites-->

{% with
  tools=[
  ],
  beneficial=[
    ('[Continuous Delivery](../../continuous-delivery/azure-cloud-foundry-java/){target=blank}'),
  ]
%}
{% include 'snippets/prerequisites/java.md' %}
{% endwith %}

### 🚀 Getting Started

{% with branch_name="security-scans", folder_name="security-scans-java" %}
{% include 'snippets/clone-import/java.md' %}
{% endwith %}

### 🔍 Code Introduction

We provide a small `greetings` service that exposes a very simple API endpoint `/hello`. You can add a URL parameter `?name=<name>` to customize the message.

This endpoint is defined in class `com.sap.cc.greeting.GreetingController`.

We are going to create open source security scans (OS3) using Black Duck for this now.

### 1 - Create Group

First, you need to create a group to be able to use Black Duck.

!!! warning "Firefox / Browser Issues"

    We've had people reporting the issue that they couldn't properly create the group using Firefox, but it worked well in Chrome. So if you face issues or strange behavior, consider switching your browser.

1. Find the [Self Help Portal](https://go.sap.corp/oss_shp_app_blackduck) 

1. Expand the `Self Help Portal` on the left and find Black Duck

1. Create a Group _without PPMS_ following the instructions [here](https://wiki.one.int.sap/wiki/display/osssec/BlackDuck+Self+Help+Portal#BlackDuckSelfHelpPortal-Howtocreateagroup-Step-by-Stepguide)

_Make sure you copy the API token to some text file - you will need it later!_

### 2 - Login to Black Duck

Go to https://sap.blackducksoftware.com/ to see the platform.

You should see your newly created group, but nothing in there yet.

### 3 - Trigger a Scan

1. Have a check on the [Black Duck Scan Configuration docs](https://github.wdf.sap.corp/SynopsysHUBSupport/GeneralSupport/wiki/Black-Duck-Scan-Configuration#scripting).

1. Trigger a scan using the CLI. You need to insert/replace some parameters
    
    - some, such as `Distribution`, can be found in the doc section listed above
    - others, such as the `ApiToken`, you should have gotten from the previous steps
    - the `ProjectName` and `ProjectVersion` can be freely defined - recommend you just use the artifact id and version from the `pom.xml`

    ??? example "Need help?"

        ```sh
            ./detect8.sh \
                --logging.level.com.synopsys.integration=DEBUG \
                --blackduck.url="https://$Server" \
                --blackduck.api.token=$ApiToken \
                --detect.project.version.distribution=$Distribution \
                --detect.blackduck.signature.scanner.memory=4096 \
                --detect.timeout=6000 \
                --blackduck.trust.cert=true \
                --detect.project.user.groups=$YourGroup \
                --detect.project.name=$ProjectName \
                --detect.project.version.name=$ProjectVersion \
                --detect.code.location.name=$ProjectName/$ProjectVersion \
                --detect.source.path=$ProjectPath
        ```

1. Have a check on the Black Duck Web UI - are there any issues reported? Can you find the details?

### 4 - Pipeline

Have a check at the [Continuous Delivery exercise](../../continuous-delivery/azure-cloud-foundry-java/).

In the "Hyperspace Onboarding" section, there is a step about the scan tools, where the configuration was skipped. You should be able to figure it out 😉.

You may also have a check on the [Piper docs](https://github.wdf.sap.corp/pages/ContinuousDelivery/piper-doc/steps/detectExecuteScan/) to learn a bit more.

### 5 - Reflection

Should you consider Code Scans only as part of your pipelines - is that enough?

??? info "Are Scans as part of the Pipeline enough?"

    Scans as part of the pipeline are not enough. E.g. vulnerabilities of other libraries can be detected any time. And if you run your pipeline only once per week, issues may remain undetected for quite a while. So it's advisable to run the scans also periodically, e.g. using a scheduled job.


## 🏁 Summary

Good job!
In this exercise you triggered a code scan on Black Duck to detect security risks of used libraries.

<!-- 
## 🦄 Stretch Goals

### Dynatrace

1. Create an instance of the service:

    You can either go to the [cockpit](https://canary.cockpit.btp.int.sap/cockpit/#/globalaccount/cloudCurriculum/subaccount/5545bfd2-7df6-4a02-99a9-ecfa153f11cd/spaces) or use `cf create-service ... -c <config>` to create your instance. Supply 3 permission assignments in the configuration that match the CAM profiles.

    ??? example "Need help?"

        Here is a template for the json config.

        ```json 
            {
                "environment_name": "GREETINGS<your-user-id>",
                "permission_assignments": [{
                    "name": "Dynatrace Learning Admin",
                    "roles": [ "admin", "log_analytics" ]
                }, {
                    "name": "Dynatrace Learning User",
                    "roles": [ "user", "log_analytics" ]
                }, {
                    "name": "Dynatrace Learning Sensitive",
                    "roles": [ "view_sensitive", "configure_sensitive" ]
                }]
            }
        ```

### Availability Service

Use the SAP Availability service to monitor the availability of your app.

Have a look at their [documentation](https://wiki.one.int.sap/wiki/display/hcpka/Tutorials) and try to define a evaluation that will send a notification if your app is not available.

 -->

## 📚 Recommended Learning

- [Security Testing Docs](https://github.wdf.sap.corp/pages/Security-Testing/doc/){target=_blank}
- [Open Source Software Security Docs](https://wiki.one.int.sap/wiki/display/osssec/Open+Source+Software+Security+Home){target=_blank}
- [Secure Code Warrior](https://wiki.one.int.sap/wiki/display/osssec/Open+Source+Software+Security+Home){target=_blank}


## 🔗 Related Topics

- [Authentication & Authorization](../../auth/java/){target=_blank}
