# Cloud Platforms

<!-- TrackingCookie-->
{% with pagename="cloud-platforms" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-cn4l.md' %}
{% endwith %}

{% include 'snippets/disclaimer-work-in-progress.md' %}

## 🤔 Wait, but why?

>Platform as a service (PaaS) or application platform as a service (aPaaS) or platform-based service is a category of cloud computing services that provides a platform allowing customers to develop, run, and manage applications without the complexity of building and maintaining the infrastructure typically associated with developing and launching an app. (source: [Wikipedia](https://en.wikipedia.org/wiki/Platform_as_a_service){target=_blank})


Cloud platforms abstract away many aspects that you previously needed to manage when running bare metal servers in your own data centers. They also offer the option to manage higher-level aspects, further reducing the effort required to set up and maintain a system landscape. Resources that took days or weeks to set up, are now just a few clicks away.

## 🎯 Learning Objectives

In this module you will get:

- an overview of Cloud Platforms & Business Technology Platform (BTP)
- a comparison of Cloud Foundry vs. Kubernetes
- an overview of the different deployment models
- hands on experience by deploying an app to Cloud Foundry

## 🧠 Theory

1. Consume the following presentations:
    1. General concepts: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/fundamentals){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/fundamentals/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_rfjpzboo){target=_blank}

    1. Cloud Foundry: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/cloud-foundry){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/cloud-foundry/?showNotes=true){target=_blank}) or [recording](https://video.sap.com/media/t/1_cdwpt2gs){target=_blank}

    1. Cloud Platforms Comparison: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/comparison){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/comparison/?showNotes=true){target=_blank})

    1. Kubernetes vs Cloud Foundry: [slides](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/k8s-vs-cf){target=_blank} ([with speaker notes](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/slides/k8s-vs-cf/?showNotes=true){target=_blank})


1. Watch the following Demos
    1. BTP Control Center [demo (5min)](https://video.sap.com/media/t/1_h5hql1g1){target=_blank}: How to control the cost of your BTP account.
    1. BTP Cockpit Overview: [demo (6min)](https://video.sap.com/media/t/1_wyyphoej){target=_blank}: How to analyze usage in your global BTP account and manage service entitlements.

## 🏆 Case Studies

1. Australian Bureau of Statistics ([full story](https://www.serverless.com/blog/building-a-better-australian-census-site){target=_blank}):
    - In 2016 a website for the mandatory Census in Australia was built at a cost of 10M AUD. Unfortunately, the site could not handle the load.
    - Two working-students recreated the project on a budget of 500 AUD within a weekend, using serverless technology. This solution was then able to handle the heavy traffic.

1. App: Browser Event Streams from various browsers ([full story](https://medium.com/coryodaniel/from-erverless-to-elixir-48752db4d7bc){target=_blnak}):
    - In 2018, the app was built using serverless technology with monthly costs of 30k$ (12M requests/hour).
    - It was later rebuilt as a monolith, which reduced costs to ~180$ per month.

## 🪞 Reflections

1. What are the benefits of using cloud platforms?
1. What are potential downsides?
1. What changes do you anticipate when your team(s) migrate towards cloud services?
1. What is your role in this?

## 💻 Technical Exercises
1. **Mandatory: Deploy an app to Cloud Foundry** using
    [Java](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/cloud-foundry-java/#exercise){target=_blank},
    [Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/cloud-foundry-nodejs/#exercise){target=_blank} or
    [Python](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/cloud-foundry-python/#exercise){target=_blank}

1. *Stretch*: Deploy an app to Kubernetes using
    [Java](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/kubernetes-java/#exercise){target=_blank},
    [Node.js](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/kubernetes-nodejs/#exercise){target=_blank} or
    [Python](https://pages.github.tools.sap/cloud-curriculum/materials/leaders/cloud-platforms/kubernetes-python/#exercise){target=_blank}

## ✏️ Non-Technical Exercises

1. Analyze your cloud costs
    1. Check if you have access to the accounts of your product in the [BTP control center](https://cp-control-client-uc2.cfapps.sap.hana.ondemand.com/index.html#/internal_costs){target=_blank}.
    1. If not, find out who manages this in your team and have a look together with them.
    1. What costs do your cloud services incur?
    1. Is there anything you could optimize?

## 🔗 Related Topics 

- Cloud Foundry vs Kubernetes [article](https://phoenixnap.com/kb/cloud-foundry-vs-kubernetes){target=_blank}
- Docker vs Cloud Foundry Buildpacks from a developer perspective [article](https://www.suse.com/c/cloud-foundry-builpacks-dockerfiles/){target=_blank}
- How to set up, deploy and offer your service on BTP [article](https://cp-control-client-uc2.cfapps.sap.hana.ondemand.com/index.html#/knowledge_center/articles/26a955166c5b4054b2b18f0d0a2b2034){target=_blank}
- How to expose your product to external customers [article](https://cp-control-client-uc2.cfapps.sap.hana.ondemand.com/index.html#/knowledge_center/articles/1457b0b170404cd2b55c37d1618562fe){target=_blank}
- Explore additional BTP services in the [BTP Discovery Center](https://discovery-center.cloud.sap/index.html#/viewServices){target=_blank}
