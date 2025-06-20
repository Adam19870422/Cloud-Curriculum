<!-- dummy line, needed to ensure headers work expectedly -->
## 🎯 Learning Objectives

In this learning module, you will learn

- about the problem that _release_ toggles help you to address.
- what kinds of toggles exist, and how they are related to release toggles.
- what the tradeoffs are, concluding with a reflection on when you _really_ need toggles.
- how to use toggles in development, including testing considerations.
- operational aspects such as configuration, monitoring and release criteria (corporate requirements).

## 🤔 Wait, but why?

Imagine you deploy to production every week, or even daily, but the current feature you're working on requires longer than this to complete.

- How can you share your code with your colleagues, and integrate it early and continuously into the main code line, in order to avoid accumulating risk and running into late integration issues?
- Additionally, how do you avoid revealing a half-implemented feature to the users and customers?

## 🧠 Theory

To learn about the theory, you have two options:

- <a href="../slides/fundamentals?showNotes=true" target="_blank" ping="https://cloud-native-dev-usage-tracker.cfapps.sap.hana.ondemand.com/click?sourcepage=/cloud-curriculum/materials/release-toggles-{{ language }}">Slides</a> with notes/annotations
- <a href="https://performancemanager5.successfactors.eu/sf/learning?destUrl=https%3A%2F%2Fsap%2eplateau%2ecom%2Flearning%2Fuser%2Fdeeplink%5fredirect%2ejsp%3FlinkId%3DITEM%5fDETAILS%26componentID%3DDEV%5f00002183%5fWBT%26componentTypeID%3DCOURSE%26revisionDate%3D1669283981000%26fromSF%3DY&company=SAP" target="_blank" ping="https://cloud-native-dev-usage-tracker.cfapps.sap.hana.ondemand.com/click?sourcepage=/cloud-curriculum/materials/release-toggles-{{ language }}">E-learning on DevOps and Cloud Native concepts</a> with dedicated chapter on Release Toggles

## 💻 Exercise
In the following exercises, we are going to develop a new feature "Order by Popularity" for an existing `bulletinboard` application.

This feature requires a bit of work. To avoid delaying our progress and to merge changes early without showing incomplete features to users, we will use release toggles.

<!-- Prerequisites-->
{% with
  language='java',
  deployment='cloud-foundry',
  tools=[
  ],
  beneficial=[
    ('[Cloud Platform Basics](../../cloud-platforms/' ~ deployment ~ '-' ~ language ~ '/){target=blank}'),
    ('[Persistence](../../persistence/' ~ language ~ '/){target=blank}')
  ],
  required=[
    ('[HTTP REST](../../http-rest/' ~ language ~ '/){target=blank}'),
    ('[Service-to-Service Communication](../../service2service/' ~ language ~ '/){target=blank}')
  ]
%}
{% include 'snippets/prerequisites/' ~ language ~ '.md' %}
{% endwith %}

#### 🚇 Infrastructure

{% if deployment == "cloud-foundry" %}
You have the option later in the exercise to deploy your solution to the cloud to see toggle integration on BTP. If you want to try this out, you'll need:

- A [Cloud Foundry Space](../../cf-spaces/spaces-{{ language }}/){target=blank}
- [**CF client V8**](https://github.com/cloudfoundry/cli/wiki/V8-CLI-Installation-Guide){target=_blank}
{% endif %}

{% if deployment == "kubernetes" %}
You have the option later in the exercise to deploy your solution to the Kubernetes to see toggle integration. To try this out, you will need access to a Kubernetes cluster.

If you don't have a cluster yet, see the first step of the [Kubernetes topic](../../cloud-platforms/kubernetes-{{ language }}/#1-kubernetes-cluster-access){target=_blank} to find out how to get a cluster and configure `kubectl`.
{% endif %}